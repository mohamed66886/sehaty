'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  BookOpen, 
  ClipboardList, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2,
  CreditCard,
  Bell,
  Calendar,
  MessageSquare,
  UserCircle,
  Megaphone
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: Array<'super_admin' | 'teacher' | 'student' | 'parent'>;
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, loading, allowedRoles, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const navigation = getNavigationByRole(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 h-16 bg-[#1e3a5f] border-b border-[#2a4a6f] z-40 shadow-sm">
        <div className="h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1e678d]">
              <BookOpen className="text-white" size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">حصتي</h1>
              <p className="text-xs text-gray-300">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#2a4a6f] rounded-lg border border-[#3a5a7f]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-[#1e678d]">
                {user.name.charAt(0)}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-300">مرحباً،</p>
                <p className="text-sm text-white font-semibold">{user.name}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a4a6f] hover:bg-[#3a5a7f] text-white transition-colors duration-200 border border-[#3a5a7f]"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1e3a5f] border-b border-[#2a4a6f] z-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e678d]">
              <BookOpen className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-white">حصتي</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-[#2a4a6f] hover:bg-[#3a5a7f] text-white transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 lg:top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-[#1e3a5f] border-l border-[#2a4a6f] shadow-sm z-40 transform transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile User Info */}
        <div className="lg:hidden p-4 border-b border-[#2a4a6f] bg-[#2a4a6f]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-[#1e678d]">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300">مرحباً،</p>
              <p className="font-semibold text-white truncate">{user.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation Header */}
        <div className="hidden lg:block px-6 py-4 border-b border-[#2a4a6f] bg-[#2a4a6f]">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">القائمة الرئيسية</h2>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-5rem)] lg:h-[calc(100%-4rem)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1e678d] text-white shadow-sm'
                    : 'text-gray-300 hover:bg-[#2a4a6f] hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <div className="absolute right-0 w-1 h-10 bg-[#1e678d] rounded-l"></div>
                )}
                <item.icon size={20} strokeWidth={2} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button - Mobile Only */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 border-t border-[#2a4a6f] bg-[#1e3a5f]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2a4a6f] hover:bg-[#3a5a7f] text-white w-full transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="lg:mr-64 lg:mt-16 pt-20 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function getNavigationByRole(role: string) {
  switch (role) {
    case 'super_admin':
      return [
        { label: 'الرئيسية', href: '/dashboard/super-admin', icon: Home },
        { label: 'السناتر', href: '/dashboard/super-admin/centers', icon: Building2 },
        { label: 'المستخدمين', href: '/dashboard/super-admin/users', icon: Users },
        { label: 'المعلمين', href: '/dashboard/super-admin/teachers', icon: Users },
        { label: 'الطلاب', href: '/dashboard/super-admin/students', icon: Users },
        { label: 'أولياء الأمور', href: '/dashboard/super-admin/parents', icon: Users },
        { label: 'الاشتراكات', href: '/dashboard/super-admin/subscriptions', icon: CreditCard },
        { label: 'التقارير', href: '/dashboard/super-admin/reports', icon: BarChart3 },
        { label: 'الإشعارات', href: '/dashboard/super-admin/notifications', icon: Bell },
        { label: 'الإعدادات', href: '/dashboard/super-admin/settings', icon: Settings },
      ];
    case 'teacher':
      return [
        { label: 'الرئيسية', href: '/dashboard/teacher', icon: Home },
        { label: 'إدارة الصفوف', href: '/dashboard/teacher/classes', icon: BookOpen },
        { label: 'طلبات الاشتراك', href: '/dashboard/teacher/subscriptions', icon: CreditCard },
        { label: 'الحضور', href: '/dashboard/teacher/attendance', icon: ClipboardList },
        { label: 'الواجبات', href: '/dashboard/teacher/homework', icon: FileText },
        { label: 'الامتحانات', href: '/dashboard/teacher/exams', icon: BookOpen },
        { label: 'النتائج', href: '/dashboard/teacher/results', icon: BarChart3 },
        { label: 'الإعلانات', href: '/dashboard/teacher/announcements', icon: Megaphone },
        { label: 'الرسائل', href: '/dashboard/teacher/messages', icon: MessageSquare },
        { label: 'الإعدادات', href: '/dashboard/teacher/settings', icon: Settings },
      ];
    case 'student':
      return [
        { label: 'الرئيسية', href: '/dashboard/student', icon: Home },
        { label: 'جدولي', href: '/dashboard/student/schedule', icon: Calendar },
        { label: 'المعلمين', href: '/dashboard/student/teachers', icon: Users },
        { label: 'الحضور', href: '/dashboard/student/attendance', icon: ClipboardList },
        { label: 'الواجبات', href: '/dashboard/student/homework', icon: FileText },
        { label: 'الامتحانات', href: '/dashboard/student/exams', icon: BookOpen },
        { label: 'النتائج', href: '/dashboard/student/results', icon: BarChart3 },
        { label: 'الإعلانات', href: '/dashboard/student/announcements', icon: Megaphone },
        { label: 'الملف الشخصي', href: '/dashboard/student/profile', icon: UserCircle },
      ];
    case 'parent':
      return [
        { label: 'الرئيسية', href: '/dashboard/parent', icon: Home },
        { label: 'أبنائي', href: '/dashboard/parent/children', icon: Users },
        { label: 'الحضور', href: '/dashboard/parent/attendance', icon: ClipboardList },
        { label: 'الواجبات', href: '/dashboard/parent/homework', icon: FileText },
        { label: 'النتائج', href: '/dashboard/parent/results', icon: BarChart3 },
        { label: 'التقارير', href: '/dashboard/parent/reports', icon: BarChart3 },
        { label: 'الإشعارات', href: '/dashboard/parent/notifications', icon: Bell },
        { label: 'الرسائل', href: '/dashboard/parent/messages', icon: MessageSquare },
        { label: 'الملف الشخصي', href: '/dashboard/parent/profile', icon: UserCircle },
      ];
    default:
      return [];
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'المسؤول الرئيسي';
    case 'teacher':
      return 'معلم';
    case 'student':
      return 'طالب';
    case 'parent':
      return 'ولي أمر';
    default:
      return '';
  }
}
