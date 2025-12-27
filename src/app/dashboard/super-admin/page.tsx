'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Users, GraduationCap, UserCheck, Settings, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    parents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      title: 'مرحباً بك في منصة حصتي',
      description: 'منصة تعليمية متكاملة لإدارة المراكز التعليمية',
      bgColor: 'from-gray-800 to-gray-900',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
    },
    {
      title: 'إدارة سهلة وفعالة',
      description: 'تحكم كامل في المعلمين والطلاب وأولياء الأمور',
      bgColor: 'from-slate-800 to-slate-900',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
    },
    {
      title: 'تقارير شاملة',
      description: 'احصل على إحصائيات دقيقة وتقارير تفصيلية',
      bgColor: 'from-zinc-800 to-zinc-900',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
    }
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;

        const teachers = usersSnapshot.docs.filter(doc => doc.data().role === 'teacher').length;
        const students = usersSnapshot.docs.filter(doc => doc.data().role === 'student').length;
        const parents = usersSnapshot.docs.filter(doc => doc.data().role === 'parent').length;

        setStats({
          totalUsers,
          teachers,
          students,
          parents,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleNextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    }
  }, [isTransitioning, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    }
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 700);
    }
  }, [isTransitioning, currentSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNextSlide]);

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-4 md:space-y-6">
        {/* Welcome Message */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-600">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-2xl flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">مرحباً، {user?.name || 'المسؤول'} 👋</h2>
              <p className="text-sm md:text-base text-gray-600">إليك نظرة شاملة على أداء النظام</p>
            </div>
          </div>
        </div>

        {/* Hero Slider */}
        <div className="relative h-48 sm:h-64 md:h-80 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-60`}></div>
              </div>
              
              {/* Content */}
              <div className="relative h-full flex items-center justify-center px-4 sm:px-8 md:px-12">
                <div className="text-white text-center max-w-3xl">
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 transition-all duration-700 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    {slide.title}
                  </h1>
                  <p className={`text-sm sm:text-base md:text-xl lg:text-2xl text-white text-opacity-95 transition-all duration-700 delay-100 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handlePrevSlide}
            disabled={isTransitioning}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white bg-opacity-20 hover:bg-opacity-40 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            <ChevronRight size={20} className="md:hidden" />
            <ChevronRight size={28} className="hidden md:block" />
          </button>
          <button
            onClick={handleNextSlide}
            disabled={isTransitioning}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white bg-opacity-20 hover:bg-opacity-40 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={20} className="md:hidden" />
            <ChevronLeft size={28} className="hidden md:block" />
          </button>

          <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white w-8 md:w-12' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75 w-1.5 md:w-2'
                }`}
              />
            ))}
          </div>
        </div>



        {/* Charts Section - الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Bar Chart - الرسم البياني الشريطي */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">إحصائيات المستخدمين</h2>
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
              <BarChart
                data={[
                  { name: 'المعلمين', value: stats.teachers, fill: '#10b981' },
                  { name: 'الطلاب', value: stats.students, fill: '#a855f7' },
                  { name: 'أولياء الأمور', value: stats.parents, fill: '#f97316' },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Cairo' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontFamily: 'Cairo',
                    fontSize: '13px'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
                  {[
                    { name: 'المعلمين', value: stats.teachers, fill: '#10b981' },
                    { name: 'الطلاب', value: stats.students, fill: '#a855f7' },
                    { name: 'أولياء الأمور', value: stats.parents, fill: '#f97316' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - الرسم البياني الدائري */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">توزيع المستخدمين</h2>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <ResponsiveContainer width="100%" height={250} className="md:!h-[350px]">
              <LineChart
                data={[
                  { name: 'المعلمين', value: stats.teachers },
                  { name: 'الطلاب', value: stats.students },
                  { name: 'أولياء الأمور', value: stats.parents },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  style={{ fontSize: '12px', fontFamily: 'Cairo' }} 
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontFamily: 'Cairo',
                    fontSize: '13px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-gray-900">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <QuickActionCard
              href="/dashboard/super-admin/users"
              icon={<Users size={32} />}
              title="المستخدمين"
              color="blue"
            />
            <QuickActionCard
              href="/dashboard/super-admin/teachers"
              icon={<GraduationCap size={32} />}
              title="المعلمين"
              color="green"
            />
            <QuickActionCard
              href="/dashboard/super-admin/students"
              icon={<UserCheck size={32} />}
              title="الطلاب"
              color="purple"
            />
            <QuickActionCard
              href="/dashboard/super-admin/parents"
              icon={<Users size={32} />}
              title="أولياء الأمور"
              color="orange"
            />
            <QuickActionCard
              href="/dashboard/super-admin/reports"
              icon={<BarChart3 size={32} />}
              title="التقارير"
              color="indigo"
            />
            <QuickActionCard
              href="/dashboard/super-admin/settings"
              icon={<Settings size={32} />}
              title="الإعدادات"
              color="gray"
            />
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
  color: 'blue' | 'green' | 'orange' | 'purple';
  loading?: boolean;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, loading, trend }: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'from-green-500 to-emerald-600', light: 'bg-green-50', text: 'text-green-600' },
    orange: { bg: 'from-orange-500 to-amber-600', light: 'bg-orange-50', text: 'text-orange-600' },
    purple: { bg: 'from-purple-500 to-pink-600', light: 'bg-purple-50', text: 'text-purple-600' },
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${colorClasses[color].bg} text-white shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="md:hidden" />
          <Icon size={28} className="hidden md:block" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-bold">
            <TrendingUp size={14} className="md:hidden" />
            <TrendingUp size={16} className="hidden md:block" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs md:text-sm text-gray-600 mb-1">{title}</p>
      {loading ? (
        <div className="h-8 md:h-10 w-16 md:w-20 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <p className="text-2xl md:text-4xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: string;
}

function QuickActionCard({ href, icon, title, color }: QuickActionCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'hover:bg-blue-50 hover:border-blue-300',
    green: 'hover:bg-green-50 hover:border-green-300',
    purple: 'hover:bg-purple-50 hover:border-purple-300',
    orange: 'hover:bg-orange-50 hover:border-orange-300',
    indigo: 'hover:bg-indigo-50 hover:border-indigo-300',
    gray: 'hover:bg-gray-50 hover:border-gray-300',
  };

  return (
    <Link
      href={href}
      className={`p-4 md:p-6 rounded-lg md:rounded-xl border-2 border-gray-200 ${colorClasses[color]} transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 group hover:scale-105 hover:shadow-lg`}
    >
      <div className="text-gray-700 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="font-bold text-gray-900 text-center text-xs md:text-sm leading-tight">{title}</p>
    </Link>
  );
}
