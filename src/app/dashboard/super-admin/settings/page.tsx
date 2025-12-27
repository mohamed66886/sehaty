'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Database, Bell, Shield, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'database', label: 'قاعدة البيانات', icon: Database },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: Palette },
  ];

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات النظام</h1>
          <p className="text-gray-600 mt-2">إدارة إعدادات وتكوينات النظام</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="card lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'database' && <DatabaseSettings />}
            {activeTab === 'notifications' && <NotificationsSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function GeneralSettings() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">الإعدادات العامة</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اسم المنصة
        </label>
        <input
          type="text"
          defaultValue="حصتي"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          وصف المنصة
        </label>
        <textarea
          rows={3}
          defaultValue="منصة تعليمية لإدارة المراكز التعليمية"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          البريد الإلكتروني للدعم
        </label>
        <input
          type="email"
          defaultValue="support@hesaty.com"
          className="input-field"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          رقم الهاتف للدعم
        </label>
        <input
          type="tel"
          defaultValue="01234567890"
          className="input-field"
          dir="ltr"
        />
      </div>

      <div className="pt-4">
        <button className="btn-primary">حفظ التغييرات</button>
      </div>
    </div>
  );
}

function DatabaseSettings() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">إدارة قاعدة البيانات</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">معلومات قاعدة البيانات</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>النوع: Firebase Firestore</p>
          <p>المشروع: skarkna2</p>
          <p>الحالة: <span className="badge-success">متصل</span></p>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">النسخ الاحتياطي</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">آخر نسخة احتياطية</p>
              <p className="text-sm text-gray-600">{new Date().toLocaleDateString('ar-EG')}</p>
            </div>
            <button className="btn-secondary">تحميل</button>
          </div>
          <button className="btn-primary w-full">إنشاء نسخة احتياطية جديدة</button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-bold text-red-900 mb-2">منطقة خطرة</h3>
        <p className="text-sm text-red-800 mb-3">
          احذر: هذه الإجراءات لا يمكن التراجع عنها
        </p>
        <button className="btn-error">مسح جميع البيانات</button>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">إعدادات الإشعارات</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">إشعارات البريد الإلكتروني</p>
            <p className="text-sm text-gray-600">إرسال إشعارات عبر البريد الإلكتروني</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">إشعارات الرسائل النصية</p>
            <p className="text-sm text-gray-600">إرسال إشعارات عبر الرسائل النصية</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">إشعارات المتصفح</p>
            <p className="text-sm text-gray-600">إظهار إشعارات في المتصفح</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button className="btn-primary">حفظ التغييرات</button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">إعدادات الأمان</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الحد الأدنى لطول كلمة المرور
        </label>
        <input
          type="number"
          min="6"
          defaultValue="6"
          className="input-field"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">المصادقة الثنائية</p>
            <p className="text-sm text-gray-600">تفعيل المصادقة الثنائية للمسؤولين</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">فرض تغيير كلمة المرور</p>
            <p className="text-sm text-gray-600">إجبار المستخدمين على تغيير كلمة المرور كل 90 يوم</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button className="btn-primary">حفظ التغييرات</button>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">إعدادات المظهر</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اللون الأساسي
        </label>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-primary-600 rounded-lg cursor-pointer border-2 border-gray-300"></div>
          <div className="w-12 h-12 bg-blue-600 rounded-lg cursor-pointer"></div>
          <div className="w-12 h-12 bg-green-600 rounded-lg cursor-pointer"></div>
          <div className="w-12 h-12 bg-purple-600 rounded-lg cursor-pointer"></div>
          <div className="w-12 h-12 bg-red-600 rounded-lg cursor-pointer"></div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          شعار المنصة
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">حصتي</span>
          </div>
          <button className="btn-secondary">تغيير الشعار</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">الوضع الليلي</p>
            <p className="text-sm text-gray-600">تفعيل الوضع الداكن</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button className="btn-primary">حفظ التغييرات</button>
      </div>
    </div>
  );
}
