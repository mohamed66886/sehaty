'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student, Teacher, Parent } from '@/types';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Users, 
  ArrowRight,
  UserPlus,
  UserMinus,
  Edit,
  GraduationCap,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadStudentData = useCallback(async () => {
    try {
      // Load student
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (studentDoc.exists()) {
        const studentData = {
          ...studentDoc.data(),
          createdAt: studentDoc.data().createdAt?.toDate() || new Date(),
        } as Student;
        setStudent(studentData);

        // Load parent
        if (studentData.parentId) {
          const parentDoc = await getDoc(doc(db, 'users', studentData.parentId));
          if (parentDoc.exists()) {
            const parentData = {
              ...parentDoc.data(),
              createdAt: parentDoc.data().createdAt?.toDate() || new Date(),
            } as Parent;
            setParent(parentData);
          }
        }

        // Load all teachers
        const teachersRef = collection(db, 'users');
        const q = query(teachersRef, where('role', '==', 'teacher'));
        const snapshot = await getDocs(q);
        const allTeachersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Teacher[];

        // Load student's teachers
        if (studentData.teacherIds && studentData.teacherIds.length > 0) {
          const studentTeachers = allTeachersData.filter(t => 
            studentData.teacherIds.includes(t.uid)
          );
          setTeachers(studentTeachers);
          
          // Set teachers not assigned to this student
          const availableTeachers = allTeachersData.filter(t => 
            !studentData.teacherIds.includes(t.uid)
          );
          setAllTeachers(availableTeachers);
        } else {
          setAllTeachers(allTeachersData);
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const handleAddTeacher = async () => {
    if (!selectedTeacherId || !student) return;
    
    setUpdating(true);
    try {
      // Update student's teacherIds
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        teacherIds: arrayUnion(selectedTeacherId)
      });

      // Update teacher's studentIds
      const teacherRef = doc(db, 'users', selectedTeacherId);
      await updateDoc(teacherRef, {
        studentIds: arrayUnion(studentId)
      });

      // Reload data
      await loadStudentData();
      setShowAddTeacher(false);
      setSelectedTeacherId('');
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('حدث خطأ أثناء إضافة المعلم');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا المعلم من قائمة الطالب؟')) return;
    
    setUpdating(true);
    try {
      // Update student's teacherIds
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        teacherIds: arrayRemove(teacherId)
      });

      // Update teacher's studentIds
      const teacherRef = doc(db, 'users', teacherId);
      await updateDoc(teacherRef, {
        studentIds: arrayRemove(studentId)
      });

      // Reload data
      await loadStudentData();
    } catch (error) {
      console.error('Error removing teacher:', error);
      alert('حدث خطأ أثناء إزالة المعلم');
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

  if (!student) {
    return (
      <DashboardLayout allowedRoles={['super_admin']}>
        <div className="text-center py-12">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">الطالب غير موجود</p>
          <Link href="/dashboard/super-admin/students" className="btn-primary mt-4 inline-flex items-center">
            <ArrowRight size={20} className="ml-2" />
            العودة إلى قائمة الطلاب
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
              href="/dashboard/super-admin/students"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطالب</h1>
              <p className="text-gray-600 mt-1">عرض وإدارة بيانات الطالب</p>
            </div>
          </div>
          <button className="btn-secondary">
            <Edit size={20} className="ml-2" />
            تعديل البيانات
          </button>
        </div>

        {/* Student Info Card */}
        <div className="card">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={20} className="text-primary-600" />
                  <span>{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={20} className="text-primary-600" />
                    <span>{student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <GraduationCap size={20} className="text-primary-600" />
                  <span>الصف: {student.class}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-primary-600" />
                  <span>تاريخ الانضمام: {student.createdAt.toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        {parent && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Home size={24} className="text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">ولي الأمر</h3>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {parent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{parent.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{parent.email}</span>
                    </div>
                    {parent.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} />
                        <span>{parent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/super-admin/parents/${parent.uid}`}
                  className="btn-secondary text-sm"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap size={24} className="text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">المعلمون ({teachers.length})</h3>
            </div>
            <button 
              onClick={() => setShowAddTeacher(!showAddTeacher)}
              className="btn-primary"
            >
              <UserPlus size={20} className="ml-2" />
              إضافة معلم
            </button>
          </div>

          {/* Add Teacher Form */}
          {showAddTeacher && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-gray-900 mb-3">إضافة معلم جديد</h4>
              <div className="flex gap-3">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="input-field flex-1"
                  disabled={updating}
                >
                  <option value="">اختر معلم...</option>
                  {allTeachers.map(teacher => (
                    <option key={teacher.uid} value={teacher.uid}>
                      {teacher.name} - {teacher.subjects?.join(', ')}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddTeacher}
                  disabled={!selectedTeacherId || updating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => {
                    setShowAddTeacher(false);
                    setSelectedTeacherId('');
                  }}
                  className="btn-secondary"
                  disabled={updating}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Teachers List */}
          {teachers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">لا يوجد معلمون مسجلين لهذا الطالب</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div key={teacher.uid} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                        <p className="text-xs text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {teacher.subjects.map((subject, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/super-admin/teachers/${teacher.uid}`}
                      className="flex-1 text-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      عرض التفاصيل
                    </Link>
                    <button
                      onClick={() => handleRemoveTeacher(teacher.uid)}
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
              <GraduationCap size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            <p className="text-sm text-gray-600">المعلمون</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(teachers.flatMap(t => t.subjects || [])).size}
            </p>
            <p className="text-sm text-gray-600">المواد الدراسية</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">1</p>
            <p className="text-sm text-gray-600">ولي الأمر</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor((new Date().getTime() - student.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-600">يوم في النظام</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
