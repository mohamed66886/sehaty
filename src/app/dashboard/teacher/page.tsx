'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentsByTeacher } from '@/lib/firebase/firestore';
import type { Student } from '@/types';
import { Users, ClipboardList, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      if (user?.uid) {
        try {
          const studentsList = await getStudentsByTeacher(user.uid);
          setStudents(studentsList);
        } catch (error) {
          console.error('Error loading students:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStudents();
  }, [user]);

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            مرحباً، {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            إليك نظرة عامة على طلابك وأنشطتك اليومية
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الطلاب"
            value={students.length}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="الحضور اليوم"
            value="0"
            icon={ClipboardList}
            color="green"
          />
          <StatCard
            title="الواجبات المعلقة"
            value="0"
            icon={FileText}
            color="yellow"
          />
          <StatCard
            title="الامتحانات القادمة"
            value="0"
            icon={BookOpen}
            color="purple"
          />
        </div>

        {/* Recent Students */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">الطلاب المسجلين</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">لا يوجد طلاب مسجلين بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right pb-3 font-semibold">الاسم</th>
                    <th className="text-right pb-3 font-semibold">الصف</th>
                    <th className="text-right pb-3 font-semibold">البريد الإلكتروني</th>
                    <th className="text-right pb-3 font-semibold">الهاتف</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.uid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">{student.name}</td>
                      <td className="py-3">{student.class}</td>
                      <td className="py-3">{student.email}</td>
                      <td className="py-3">{student.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/teacher/attendance" className="btn-primary p-4 text-right hover:bg-primary-700 transition-colors">
              <ClipboardList className="mb-2" size={24} />
              <p className="font-semibold">تسجيل الحضور</p>
            </Link>
            <Link href="/dashboard/teacher/homework" className="btn-primary p-4 text-right hover:bg-primary-700 transition-colors">
              <FileText className="mb-2" size={24} />
              <p className="font-semibold">إضافة واجب</p>
            </Link>
            <Link href="/dashboard/teacher/exams" className="btn-primary p-4 text-right hover:bg-primary-700 transition-colors">
              <BookOpen className="mb-2" size={24} />
              <p className="font-semibold">إنشاء امتحان</p>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">روابط سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/dashboard/teacher/students" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="text-primary-600" size={20} />
                <span className="font-medium">عرض جميع الطلاب</span>
              </div>
            </Link>
            <Link href="/dashboard/teacher/homework" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="text-primary-600" size={20} />
                <span className="font-medium">الواجبات المنزلية</span>
              </div>
            </Link>
            <Link href="/dashboard/teacher/exams" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="text-primary-600" size={20} />
                <span className="font-medium">الامتحانات</span>
              </div>
            </Link>
            <Link href="/dashboard/teacher/attendance" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-primary-600" size={20} />
                <span className="font-medium">سجل الحضور</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
