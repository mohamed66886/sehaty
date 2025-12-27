'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, GraduationCap } from 'lucide-react';

interface ReportStats {
  totalUsers: number;
  teachers: number;
  students: number;
  parents: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let totalUsers = 0;
      let teachers = 0;
      let students = 0;
      let parents = 0;
      let newUsersThisMonth = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalUsers++;
        
        if (data.role === 'teacher') teachers++;
        if (data.role === 'student') students++;
        if (data.role === 'parent') parents++;
        
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt);
        
        if (createdAt >= startOfMonth) {
          newUsersThisMonth++;
        }
      });

      setStats({
        totalUsers,
        teachers,
        students,
        parents,
        newUsersThisMonth,
        activeUsers: totalUsers, // يمكن تحسينه بناءً على آخر تسجيل دخول
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: string) => {
    // TODO: Implement report generation
    alert(`سيتم إنشاء تقرير ${type}`);
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

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
            <p className="text-gray-600 mt-2">عرض وتحليل بيانات النظام</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
              <option value="quarter">آخر 3 أشهر</option>
              <option value="year">آخر سنة</option>
            </select>
            <button onClick={() => generateReport('شامل')} className="btn-primary">
              <Download size={20} className="ml-2" />
              تصدير تقرير
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
            <p className="text-sm text-green-600 mt-2">
              +{stats.newUsersThisMonth} هذا الشهر
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <GraduationCap size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600">المعلمين</p>
            <p className="text-3xl font-bold mt-1">{stats.teachers}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.teachers / stats.totalUsers) * 100) : 0}% من المستخدمين
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600">الطلاب</p>
            <p className="text-3xl font-bold mt-1">{stats.students}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.students / stats.totalUsers) * 100) : 0}% من المستخدمين
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600">أولياء الأمور</p>
            <p className="text-3xl font-bold mt-1">{stats.parents}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.totalUsers > 0 ? Math.round((stats.parents / stats.totalUsers) * 100) : 0}% من المستخدمين
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">توزيع المستخدمين</h2>
              <BarChart3 className="text-gray-400" size={24} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">معلمين</span>
                  <span className="text-sm text-gray-600">{stats.teachers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.teachers / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">طلاب</span>
                  <span className="text-sm text-gray-600">{stats.students}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.students / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">أولياء أمور</span>
                  <span className="text-sm text-gray-600">{stats.parents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-600 h-3 rounded-full"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.parents / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Trend */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">نمو المستخدمين</h2>
              <TrendingUp className="text-gray-400" size={24} />
            </div>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-50 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">+{stats.newUsersThisMonth}</p>
                  <p className="text-sm text-green-600">هذا الشهر</p>
                </div>
              </div>
              <p className="text-gray-600">مستخدمين جدد انضموا للمنصة</p>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">قوالب التقارير</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => generateReport('المستخدمين')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <FileText className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير المستخدمين</h3>
              <p className="text-sm text-gray-600">تفاصيل كاملة عن جميع المستخدمين</p>
            </button>

            <button
              onClick={() => generateReport('المعلمين')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <GraduationCap className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير المعلمين</h3>
              <p className="text-sm text-gray-600">إحصائيات المعلمين والطلاب</p>
            </button>

            <button
              onClick={() => generateReport('الطلاب')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <Users className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير الطلاب</h3>
              <p className="text-sm text-gray-600">تفاصيل الطلاب والتقدم الأكاديمي</p>
            </button>

            <button
              onClick={() => generateReport('الحضور')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <Calendar className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير الحضور</h3>
              <p className="text-sm text-gray-600">سجل حضور الطلاب</p>
            </button>

            <button
              onClick={() => generateReport('النشاط')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <TrendingUp className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير النشاط</h3>
              <p className="text-sm text-gray-600">نشاط المستخدمين في النظام</p>
            </button>

            <button
              onClick={() => generateReport('مخصص')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-right"
            >
              <BarChart3 className="mb-3 text-primary-600" size={24} />
              <h3 className="font-bold mb-1">تقرير مخصص</h3>
              <p className="text-sm text-gray-600">إنشاء تقرير حسب الطلب</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
