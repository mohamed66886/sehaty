'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronLeft, Download, CheckCircle, XCircle, Clock, Award, User, Calendar } from 'lucide-react';

interface Exam {
  id: string;
  teacherId: string;
  title: string;
  classId: string;
  className: string;
  duration: number;
  totalMarks: number;
  startDate: Date;
  endDate: Date;
  questions: any[];
  createdAt: Date;
}

interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  timeTaken: number;
  completedAt: Date;
}

interface StudentWithResult {
  userId: string;
  userName: string;
  userEmail: string;
  completed: boolean;
  result?: ExamResult;
}

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [allStudents, setAllStudents] = useState<StudentWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed' | 'not-completed'>('all');

  useEffect(() => {
    if (user && params.examId) {
      fetchExamAndResults();
    }
  }, [user, params.examId]);

  const fetchExamAndResults = async () => {
    if (!user) return;
    
    try {
      // Fetch exam details
      const examDoc = await getDoc(doc(db, 'exams', params.examId as string));
      if (!examDoc.exists()) {
        console.error('Exam not found');
        setLoading(false);
        return;
      }

      const examData = {
        id: examDoc.id,
        ...examDoc.data(),
        startDate: examDoc.data().startDate?.toDate(),
        endDate: examDoc.data().endDate?.toDate(),
        createdAt: examDoc.data().createdAt?.toDate(),
      } as Exam;

      setExam(examData);

      // Fetch exam results
      const resultsQuery = query(
        collection(db, 'examResults'),
        where('examId', '==', params.examId)
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date(),
      })) as ExamResult[];
      
      setResults(resultsData);

      // Fetch students linked to this teacher and class
      const usersRef = collection(db, 'users');
      const studentsQuery = query(usersRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      // Filter students who are linked to this teacher and optionally this class
      const classStudents = studentsSnapshot.docs
        .map((doc) => ({
          userId: doc.id,
          userName: doc.data().name || doc.data().email || 'غير معروف',
          userEmail: doc.data().email || '',
          teacherIds: doc.data().teacherIds || [],
          class: doc.data().class || '',
        }))
        .filter(student => {
          // Student must be linked to the exam's teacher
          const isLinkedToTeacher = student.teacherIds.includes(examData.teacherId);
          // If class is specified in exam, filter by class as well
          const isInClass = !examData.className || student.class === examData.className;
          return isLinkedToTeacher && isInClass;
        });

      console.log('وجدت طلاب مرتبطين بالمدرس والصف:', classStudents.length);
      console.log('وجدت نتائج:', resultsData.length);

      // Combine students with their results
      const studentsWithResults: StudentWithResult[] = classStudents.map(student => {
        const result = resultsData.find(r => r.userId === student.userId);
        return {
          ...student,
          completed: !!result,
          result: result,
        };
      });

      setAllStudents(studentsWithResults);
    } catch (error) {
      console.error('خطأ في جلب نتائج الامتحان:', error);
      alert('خطأ في تحميل البيانات. تحقق من console للتفاصيل.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getScorePercentage = (result: ExamResult) => {
    return ((result.score / result.totalQuestions) * 100).toFixed(1);
  };

  const isPassed = (result: ExamResult) => {
    return parseFloat(getScorePercentage(result)) >= 60;
  };

  const downloadCSV = () => {
    if (!allStudents.length) return;

    const headers = ['Student Name', 'Score', 'Total Questions', 'Percentage', 'Status', 'Time Taken', 'Completed At'];
    const rows = filteredResults.map(student => {
      if (!student.completed || !student.result) {
        return [
          student.userName,
          '-',
          '-',
          '-',
          'Not Completed',
          '-',
          '-',
        ];
      }
      return [
        student.userName,
        student.result.score,
        student.result.totalQuestions,
        `${getScorePercentage(student.result)}%`,
        isPassed(student.result) ? 'Passed' : 'Failed',
        formatTime(student.result.timeTaken),
        formatDate(student.result.completedAt),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${exam?.title || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredResults = allStudents.filter((student) => {
    const matchesSearch = student.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'not-completed') return matchesSearch && !student.completed;
    if (!student.completed || !student.result) return false;
    
    const passed = isPassed(student.result);
    const matchesStatus = 
      (filterStatus === 'passed' && passed) ||
      (filterStatus === 'failed' && !passed);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalStudents = allStudents.length;
  const completedCount = allStudents.filter(s => s.completed).length;
  const notCompletedCount = totalStudents - completedCount;
  const passedCount = allStudents.filter(s => s.completed && s.result && isPassed(s.result)).length;
  const failedCount = completedCount - passedCount;
  const averageScore = completedCount > 0
    ? (allStudents
        .filter(s => s.completed && s.result)
        .reduce((sum, s) => sum + parseFloat(getScorePercentage(s.result!)), 0) / completedCount).toFixed(1)
    : '0';

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="text-center py-8">
          <p className="text-gray-600">لم يتم العثور على الامتحان</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => router.push('/dashboard/teacher/exams')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          العودة للامتحانات
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {exam.title} - النتائج
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              عرض وتحليل نتائج الامتحان - {exam.className} - {allStudents.length} طالب مرتبط بك
            </p>
          </div>
          {allStudents.length > 0 && (
            <button
              onClick={downloadCSV}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              تصدير CSV
            </button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">أنهوا الامتحان</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">لم ينهوا</p>
                <p className="text-2xl font-bold text-yellow-600">{notCompletedCount}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الدرجات</p>
                <p className="text-2xl font-bold text-purple-600">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input w-full"
            >
              <option value="all">جميع الطلاب</option>
              <option value="passed">الناجحون فقط</option>
              <option value="failed">الراسبون فقط</option>
              <option value="not-completed">لم ينهوا الامتحان</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length === 0 ? (
          <div className="card text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {allStudents.length === 0 ? 'لا يوجد طلاب في هذا الصف' : 'لا توجد نتائج تطابق الفلاتر'}
            </p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    اسم الطالب
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    الدرجة
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    النسبة المئوية
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    الحالة
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    الوقت المستغرق
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    تاريخ الإنهاء
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((student, index) => {
                  if (!student.completed || !student.result) {
                    return (
                      <tr
                        key={student.userId}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {student.userName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400">-</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            لم يبدأ
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 font-medium">قيد الانتظار</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400">-</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-400">-</span>
                        </td>
                      </tr>
                    );
                  }

                  const passed = isPassed(student.result);
                  const percentage = getScorePercentage(student.result);
                  
                  return (
                    <tr
                      key={student.userId}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {student.result.score}/{student.result.totalQuestions}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            passed
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {passed ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">ناجح</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-red-600 font-medium">راسب</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(student.result.timeTaken)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(student.result.completedAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
