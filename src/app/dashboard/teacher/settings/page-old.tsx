'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db } from '@/lib/firebase/config';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  message,
  Alert,
  Divider,
  Tag,
  ConfigProvider,
  Table,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  BellOutlined,
  LockOutlined,
  SettingOutlined,
  LogoutOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  KeyOutlined,
  CopyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  SafetyOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import type { Teacher } from '@/types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface ClassCode {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  lastModified: string;
  isActive: boolean;
}

export default function TeacherSettingsPage() {
  const { user, firebaseUser, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    assignments: true,
    announcements: true,
    messages: true,
    grades: false,
  });
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [secretCode, setSecretCode] = useState('1234');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [confirmSecretCode, setConfirmSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(false);

  const [classCodes, setClassCodes] = useState<ClassCode[]>([
    { id: '1', name: 'الصف الأول الابتدائي', code: '1111', studentsCount: 25, lastModified: '2024-01-15', isActive: true },
    { id: '2', name: 'الصف الثاني الابتدائي', code: '2222', studentsCount: 30, lastModified: '2024-01-14', isActive: true },
    { id: '3', name: 'الصف الثالث الابتدائي', code: '3333', studentsCount: 28, lastModified: '2024-01-13', isActive: true },
    { id: '4', name: 'الصف الرابع الابتدائي', code: '4444', studentsCount: 32, lastModified: '2024-01-12', isActive: true },
    { id: '5', name: 'الصف الخامس الابتدائي', code: '5555', studentsCount: 27, lastModified: '2024-01-11', isActive: true },
    { id: '6', name: 'الصف السادس الابتدائي', code: '6666', studentsCount: 35, lastModified: '2024-01-10', isActive: true },
    { id: '7', name: 'الصف الأول الإعدادي', code: '7777', studentsCount: 40, lastModified: '2024-01-09', isActive: true },
    { id: '8', name: 'الصف الثاني الإعدادي', code: '8888', studentsCount: 38, lastModified: '2024-01-08', isActive: true },
    { id: '9', name: 'الصف الثالث الإعدادي', code: '9999', studentsCount: 42, lastModified: '2024-01-07', isActive: true },
    { id: '10', name: 'الصف الأول الثانوي', code: '1010', studentsCount: 45, lastModified: '2024-01-06', isActive: true },
    { id: '11', name: 'الصف الثاني الثانوي', code: '2020', studentsCount: 43, lastModified: '2024-01-05', isActive: true },
    { id: '12', name: 'الصف الثالث الثانوي', code: '3030', studentsCount: 48, lastModified: '2024-01-04', isActive: true },
  ]);

  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [tempClassCode, setTempClassCode] = useState('');
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Load teacher data from Firebase
  useEffect(() => {
    const loadTeacherData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load teacher profile
        const teacherRef = doc(db, 'teachers', user.uid);
        const teacherSnap = await getDoc(teacherRef);
        
        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          setProfileData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            specialty: teacherData.subjects?.join(', ') || '',
            bio: teacherData.bio || '',
            avatar: user.name?.charAt(0) || 'م',
          });
          
          // Load class codes
          const loadedCodes = teacherData.classCodes || [];
          if (loadedCodes.length > 0) {
            setClassCodes(loadedCodes);
          }
          
          // Load notifications settings
          if (teacherData.notificationSettings) {
            setNotifications(teacherData.notificationSettings);
          }
          
          // Load theme
          if (teacherData.theme) {
            setTheme(teacherData.theme);
          }
          
          // Load secret code
          if (teacherData.secretCode) {
            setSecretCode(teacherData.secretCode);
          }
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
        showMessage('error', 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    loadTeacherData();
  }, [user]);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateClassCode = async (classId: string) => {
    if (tempClassCode.length === 4 && /^\d+$/.test(tempClassCode)) {
      try {
        setSaving(true);
        const updatedCodes = classCodes.map(cls => 
          cls.id === classId ? { ...cls, code: tempClassCode, lastModified: new Date().toISOString().split('T')[0] } : cls
        );
        
        // Update in Firebase
        if (user) {
          const teacherRef = doc(db, 'teachers', user.uid);
          await updateDoc(teacherRef, {
            classCodes: updatedCodes
          });
        }
        
        setClassCodes(updatedCodes);
        setEditingClass(null);
        setTempClassCode('');
        showMessage('success', 'تم تحديث الكود بنجاح');
      } catch (error) {
        console.error('Error updating class code:', error);
        showMessage('error', 'حدث خطأ في تحديث الكود');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleGenerateRandomCode = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setTempClassCode(randomCode);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const handleExportCodes = () => {
    const csvContent = classCodes.map(cls => 
      `${cls.name},${cls.code},${cls.studentsCount}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-codes.csv';
    a.click();
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showMessage('error', 'كلمة المرور غير متطابقة');
      return;
    }

    if (!firebaseUser || !passwordData.current || !passwordData.new) {
      showMessage('error', 'يرجى ملء جميع الحقول');
      return;
    }

    try {
      setSaving(true);
      
      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwordData.current
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Update password
      await updatePassword(firebaseUser, passwordData.new);
      
      setPasswordData({ current: '', new: '', confirm: '' });
      showMessage('success', 'تم تحديث كلمة المرور بنجاح');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'كلمة المرور الحالية غير صحيحة');
      } else {
        showMessage('error', 'حدث خطأ في تحديث كلمة المرور');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileData.fullName,
        phone: profileData.phone,
      });
      
      // Update teacher document
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        subjects: profileData.specialty.split(',').map(s => s.trim()).filter(s => s),
        bio: profileData.bio,
      });
      
      showMessage('success', 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecretCode = async () => {
    if (newSecretCode !== confirmSecretCode) {
      showMessage('error', 'الكود السري غير متطابق');
      return;
    }
    
    if (newSecretCode.length !== 4) {
      showMessage('error', 'يجب أن يكون الكود مكون من 4 أرقام');
      return;
    }

    if (!user) return;

    try {
      setSaving(true);
      
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        secretCode: newSecretCode
      });
      
      setSecretCode(newSecretCode);
      setNewSecretCode('');
      setConfirmSecretCode('');
      showMessage('success', 'تم تحديث الكود السري بنجاح');
    } catch (error) {
      console.error('Error updating secret code:', error);
      showMessage('error', 'حدث خطأ في تحديث الكود السري');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        notificationSettings: notifications
      });
      
      showMessage('success', 'تم تحديث إعدادات الإشعارات');
    } catch (error) {
      console.error('Error updating notifications:', error);
      showMessage('error', 'حدث خطأ في تحديث الإشعارات');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    if (!user) return;
    
    try {
      setTheme(newTheme);
      
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        theme: newTheme
      });
      
      showMessage('success', 'تم تحديث المظهر');
    } catch (error) {
      console.error('Error updating theme:', error);
      showMessage('error', 'حدث خطأ في تحديث المظهر');
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">الملف الشخصي</h3>
                  <p className="text-sm text-gray-600">إدارة معلومات حسابك الشخصية</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                    {profileData.avatar}
                  </div>
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors group-hover:scale-105">
                    <Camera size={20} className="text-gray-700" />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md">
                      <Camera size={16} />
                      <span>تغيير الصورة</span>
                    </button>
                    <p className="text-sm text-gray-600 mt-2">الحد الأقصى: 2 ميجابايت • PNG, JPG, GIF</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        التخصص
                      </label>
                      <input
                        type="text"
                        value={profileData.specialty}
                        onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      نبذة تعريفية
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleUpdateProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Bell className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">الإشعارات</h3>
                  <p className="text-sm text-gray-600">إدارة تفضيلات الإشعارات والإعلانات</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Notification Channels */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">قنوات الإشعارات</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">البريد الإلكتروني</h5>
                          <p className="text-sm text-gray-600">تلقي الإشعارات عبر البريد الإلكتروني</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.email ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Smartphone size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">الإشعارات الفورية</h5>
                          <p className="text-sm text-gray-600">إشعارات فورية على المتصفح والجوال</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.push ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MessageSquare size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">رسائل SMS</h5>
                          <p className="text-sm text-gray-600">تلقي إشعارات عبر الرسائل النصية</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.sms ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">أنواع الإشعارات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">الواجبات والأنشطة</h5>
                        <p className="text-sm text-gray-600">إشعارات بخصوص الواجبات</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.assignments}
                          onChange={(e) => setNotifications({...notifications, assignments: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.assignments ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">الإعلانات العامة</h5>
                        <p className="text-sm text-gray-600">إشعارات الإعلانات المهمة</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.announcements}
                          onChange={(e) => setNotifications({...notifications, announcements: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.announcements ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">الرسائل المباشرة</h5>
                        <p className="text-sm text-gray-600">إشعارات الرسائل من الطلاب</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.messages}
                          onChange={(e) => setNotifications({...notifications, messages: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.messages ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">نتائج التقييمات</h5>
                        <p className="text-sm text-gray-600">إشعارات درجات الطلاب</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.grades}
                          onChange={(e) => setNotifications({...notifications, grades: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.grades ? 'translate-x-7' : 'translate-x-1'} top-0.5`} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200 px-6 pb-6">
                <button
                  onClick={handleUpdateNotifications}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>حفظ الإعدادات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <>
            {/* Class Codes Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">أكواد الصفوف الدراسية</h3>
                      <p className="text-sm text-gray-600">إدارة الأكواد السرية للصفوف الدراسية</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportCodes}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
                  >
                    <Download size={16} />
                    <span>تصدير الكل</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        كل صف دراسي له كود سري خاص به يستخدمه الطلاب للدخول إلى المحتوى
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        يمكن للطلاب استخدام هذه الأكواد للانضمام إلى الصفوف الدراسية
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {classCodes.map((cls) => (
                    <div key={cls.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${cls.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <h4 className="font-bold text-gray-900">{cls.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {cls.studentsCount} طالب
                          </span>
                          <span>آخر تحديث: {cls.lastModified}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {editingClass === cls.id ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={4}
                                value={tempClassCode}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  setTempClassCode(value);
                                }}
                                placeholder="0000"
                                className="w-28 px-4 py-2 border border-blue-300 rounded-lg text-center font-bold text-lg tracking-wider bg-white shadow-sm"
                                autoFocus
                              />
                              <button
                                onClick={handleGenerateRandomCode}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                                title="توليد كود عشوائي"
                              >
                                <RefreshCw size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleUpdateClassCode(cls.id)}
                              disabled={tempClassCode.length !== 4}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => {
                                setEditingClass(null);
                                setTempClassCode('');
                              }}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-300">
                              <span className="font-mono font-bold text-lg tracking-wider text-gray-800">
                                {showCodes[cls.id] ? cls.code : '••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowCodes({...showCodes, [cls.id]: !showCodes[cls.id]})}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title={showCodes[cls.id] ? 'إخفاء الكود' : 'إظهار الكود'}
                              >
                                {showCodes[cls.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <button
                                onClick={() => handleCopyToClipboard(cls.code)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="نسخ الكود"
                              >
                                <Key size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingClass(cls.id);
                                  setTempClassCode(cls.code);
                                }}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="تعديل الكود"
                              >
                                <Save size={18} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Lock className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">الأمان</h3>
                    <p className="text-sm text-gray-600">إدارة إعدادات الأمان والحماية</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-8">
                {/* Personal Secret Code */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">الكود السري الشخصي</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield size={16} />
                      <span>للعمليات المهمة</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        الكود الحالي
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretCode ? "text" : "password"}
                          value={secretCode}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center font-bold text-lg tracking-wider"
                        />
                        <button
                          onClick={() => setShowSecretCode(!showSecretCode)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                          {showSecretCode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        الكود الجديد
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={newSecretCode}
                        onChange={(e) => setNewSecretCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="4 أرقام"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-bold text-lg tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        تأكيد الكود
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={confirmSecretCode}
                        onChange={(e) => setConfirmSecretCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="أعد إدخاله"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-bold text-lg tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateSecretCode}
                      disabled={!newSecretCode || newSecretCode !== confirmSecretCode || newSecretCode.length !== 4 || saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {saving ? 'جاري التحديث...' : 'تحديث الكود السري'}
                    </button>
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">تغيير كلمة المرور</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        كلمة المرور الحالية
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                          تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={!passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm || saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {saving ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'preferences':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Palette className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">التفضيلات</h3>
                  <p className="text-sm text-gray-600">تخصيص تجربة استخدام المنصة</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">المظهر</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      onClick={() => handleUpdateTheme('light')}
                      disabled={saving}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'} disabled:opacity-50`}
                    >
                      <div className="flex items-center justify-center mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center">
                          <Sun size={isMobile ? 20 : 24} className="text-white" />
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900 text-center text-sm sm:text-base">فاتح</h5>
                      <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">المظهر الافتراضي</p>
                    </button>

                    <button
                      onClick={() => handleUpdateTheme('dark')}
                      disabled={saving}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'} disabled:opacity-50`}
                    >
                      <div className="flex items-center justify-center mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Moon size={isMobile ? 20 : 24} className="text-white" />
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900 text-center text-sm sm:text-base">داكن</h5>
                      <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">مريح للعين</p>
                    </button>

                    <button
                      onClick={() => handleUpdateTheme('auto')}
                      disabled={saving}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${theme === 'auto' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'} disabled:opacity-50`}
                    >
                      <div className="flex items-center justify-center mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <Settings size={isMobile ? 20 : 24} className="text-white" />
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900 text-center text-sm sm:text-base">تلقائي</h5>
                      <p className="text-xs sm:text-sm text-gray-600 text-center mt-1">يتكيف تلقائياً</p>
                    </button>
                  </div>
                </div>

                {/* Language and Region */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">اللغة والمنطقة</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        اللغة
                      </label>
                      <div className="relative">
                        <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                          <option>العربية</option>
                          <option>English</option>
                          <option>Français</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        المنطقة الزمنية
                      </label>
                      <div className="relative">
                        <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                          <option>القاهرة (GMT+2)</option>
                          <option>الرياض (GMT+3)</option>
                          <option>دبي (GMT+4)</option>
                          <option>الرباط (GMT+1)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Preferences */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">التفضيلات المتقدمة</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">النسخ الاحتياطي التلقائي</h5>
                        <p className="text-sm text-gray-600">نسخ احتياطي تلقائي للإعدادات كل أسبوع</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className="w-5 h-5 bg-white rounded-full transform transition-transform translate-x-7 top-0.5" />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h5 className="font-medium text-gray-900">جلسات متعددة</h5>
                        <p className="text-sm text-gray-600">السماح بتسجيل الدخول من أجهزة متعددة</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors">
                          <div className="w-5 h-5 bg-white rounded-full transform transition-transform translate-x-7 top-0.5" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">جاري التحميل...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Success/Error Message */}
          {message && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 p-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 animate-slideDown ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="flex-shrink-0" size={24} />
              ) : (
                <XCircle className="flex-shrink-0" size={24} />
              )}
              <p className="font-medium flex-1">{message.text}</p>
              <button 
                onClick={() => setMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">الإعدادات</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">إدارة حسابك وتفضيلاتك وأكواد الصفوف الدراسية</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Tabs */}
            {isMobile ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <User size={20} />
                    <span className="text-xs font-medium">الملف</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Bell size={20} />
                    <span className="text-xs font-medium">الإشعارات</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all relative ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Lock size={20} />
                    <span className="text-xs font-medium">الأمان</span>
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">مهم</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Palette size={20} />
                    <span className="text-xs font-medium">التفضيلات</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Settings className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">القائمة</h3>
                      <p className="text-sm text-blue-100">جميع الإعدادات</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <User size={20} />
                    <span className="font-medium">الملف الشخصي</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Bell size={20} />
                    <span className="font-medium">الإشعارات</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Lock size={20} />
                    <span className="font-medium">الأمان</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-auto">مهم</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Palette size={20} />
                    <span className="font-medium">التفضيلات</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {getTabContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .appearance-none {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        .appearance-none::-ms-expand {
          display: none;
        }
        
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
        </>
      )}
    </DashboardLayout>
  );
}