'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Teacher, Student } from '@/types';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight,
  UserPlus,
  UserMinus,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TeacherDetailsPage() {
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadTeacherData = useCallback(async () => {
    try {
      // Load teacher
      const teacherDoc = await getDoc(doc(db, 'users', teacherId));
      if (teacherDoc.exists()) {
        const teacherData = {
          ...teacherDoc.data(),
          createdAt: teacherDoc.data().createdAt?.toDate() || new Date(),
        } as Teacher;
        setTeacher(teacherData);

        // Load teacher's students
        if (teacherData.studentIds && teacherData.studentIds.length > 0) {
          const studentsRef = collection(db, 'users');
          const q = query(studentsRef, where('role', '==', 'student'));
          const snapshot = await getDocs(q);
          const allStudentsData = snapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Student[];
          
          const teacherStudents = allStudentsData.filter(s => 
            teacherData.studentIds.includes(s.uid)
          );
          setStudents(teacherStudents);
          
          // Set students not assigned to this teacher
          const availableStudents = allStudentsData.filter(s => 
            !teacherData.studentIds.includes(s.uid)
          );
          setAllStudents(availableStudents);
        } else {
          // Load all students if teacher has none
          const studentsRef = collection(db, 'users');
          const q = query(studentsRef, where('role', '==', 'student'));
          const snapshot = await getDocs(q);
          const allStudentsData = snapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Student[];
          setAllStudents(allStudentsData);
        }
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  const handleAddStudent = async () => {
    if (!selectedStudentId || !teacher) return;
    
    setUpdating(true);
    try {
      // Update teacher's studentIds
      const teacherRef = doc(db, 'users', teacherId);
      await updateDoc(teacherRef, {
        studentIds: arrayUnion(selectedStudentId)
      });

      // Update student's teacherIds
      const studentRef = doc(db, 'users', selectedStudentId);
      await updateDoc(studentRef, {
        teacherIds: arrayUnion(teacherId)
      });

      // Reload data
      await loadTeacherData();
      setShowAddStudent(false);
      setSelectedStudentId('');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('حدث خطأ أثناء إضافة الطالب');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الطالب من قائمة المعلم؟')) return;
    
    setUpdating(true);
    try {
      // Update teacher's studentIds
      const teacherRef = doc(db, 'users', teacherId);
      await updateDoc(teacherRef, {
        studentIds: arrayRemove(studentId)
      });

      // Update student's teacherIds
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        teacherIds: arrayRemove(teacherId)
      });

      // Reload data
      await loadTeacherData();
    } catch (error) {
      console.error('Error removing student:', error);
      alert('حدث خطأ أثناء إزالة الطالب');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['super_admin']}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout allowedRoles={['super_admin']}>
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">المعلم غير موجود</p>
          <Link href="/dashboard/super-admin/teachers" className="btn-primary mt-4 inline-flex items-center">
            <ArrowRight size={20} className="ml-2" />
            العودة إلى قائمة المعلمين
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/super-admin/teachers"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تفاصيل المعلم</h1>
              <p className="text-gray-600 mt-1">عرض وإدارة بيانات المعلم</p>
            </div>
          </div>
          <button className="btn-secondary">
            <Edit size={20} className="ml-2" />
            تعديل البيانات
          </button>
        </div>

        {/* Teacher Info Card */}
        <div className="card">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {teacher.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{teacher.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={20} className="text-primary-600" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={20} className="text-primary-600" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-primary-600" />
                  <span>تاريخ الانضمام: {teacher.createdAt.toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users size={20} className="text-primary-600" />
                  <span>{students.length} طالب</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects */}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={24} className="text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">المواد الدراسية</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {teacher.subjects.map((subject, index) => (
                <span key={index} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Students Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">طلاب المعلم ({students.length})</h3>
            </div>
            <button 
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="btn-primary"
            >
              <UserPlus size={20} className="ml-2" />
              إضافة طالب
            </button>
          </div>

          {/* Add Student Form */}
          {showAddStudent && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">إضافة طالب جديد</h4>
              <div className="flex gap-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="input-field flex-1"
                  disabled={updating}
                >
                  <option value="">اختر طالب...</option>
                  {allStudents.map(student => (
                    <option key={student.uid} value={student.uid}>
                      {student.name} - {student.class}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId || updating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => {
                    setShowAddStudent(false);
                    setSelectedStudentId('');
                  }}
                  className="btn-secondary"
                  disabled={updating}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Students List */}
          {students.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">لا يوجد طلاب مسجلين لهذا المعلم</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div key={student.uid} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.class}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/super-admin/students/${student.uid}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      عرض التفاصيل
                    </Link>
                    <button
                      onClick={() => handleRemoveStudent(student.uid)}
                      disabled={updating}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            <p className="text-sm text-gray-600">إجمالي الطلاب</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{teacher.subjects?.length || 0}</p>
            <p className="text-sm text-gray-600">المواد الدراسية</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(students.map(s => s.class)).size}
            </p>
            <p className="text-sm text-gray-600">الصفوف الدراسية</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor((new Date().getTime() - teacher.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-600">يوم في النظام</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
