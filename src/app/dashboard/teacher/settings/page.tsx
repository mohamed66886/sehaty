'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  message as antMessage,
  Alert,
  Divider,
  Tag,
  ConfigProvider,
  Table,
  Tooltip,
  Modal,
  Popconfirm,
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
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import type { Teacher } from '@/types';

const { Title, Text } = Typography;
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [secretCodeForm] = Form.useForm();

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
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [addClassForm] = Form.useForm();
  
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    avatar: '',
  });

  // Load teacher data
  useEffect(() => {
    const loadTeacherData = async () => {
      if (!user) {
        console.log('No user found');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading data for user:', user.uid);
        
        // Load teacher document
        const teacherRef = doc(db, 'teachers', user.uid);
        const teacherSnap = await getDoc(teacherRef);
        
        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          console.log('Teacher data loaded:', teacherData);
          
          // Set profile data from user context and teacher document
          const data = {
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            specialty: teacherData.subjects?.join(', ') || '',
            bio: teacherData.bio || '',
            avatar: (user as any).photoURL || user.name?.charAt(0)?.toUpperCase() || 'م',
          };
          
          console.log('Profile data to display:', data);
          setProfileData(data);
          form.setFieldsValue(data);
          
          // Load class codes with real student counts
          await loadClassCodes(teacherData);
          
          // Load notification settings
          if (teacherData.notificationSettings) {
            setNotifications(teacherData.notificationSettings);
          }
          
          // Load theme preference
          if (teacherData.theme) {
            setTheme(teacherData.theme);
          }
          
          // Load secret code
          if (teacherData.secretCode) {
            setSecretCode(teacherData.secretCode);
          }
        } else {
          console.log('No teacher document found for user:', user.uid);
          // Still show user basic data
          const data = {
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            specialty: '',
            bio: '',
            avatar: (user as any).photoURL || user.name?.charAt(0)?.toUpperCase() || 'م',
          };
          setProfileData(data);
          form.setFieldsValue(data);
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
        antMessage.error('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    const loadClassCodes = async (teacherData: any) => {
      try {
        console.log('Loading class codes...');
        
        // Load only manually added classes from Firebase
        const savedClassCodes = teacherData.classCodes || [];
        console.log('Saved class codes:', savedClassCodes);
        
        if (savedClassCodes.length === 0) {
          console.log('No class codes found');
          setClassCodes([]);
          return;
        }
        
        // Load real student counts for each saved class
        const codesWithCounts = await Promise.all(
          savedClassCodes.map(async (classData: any, index: number) => {
            // Count students in this class taught by this teacher
            const studentsQuery = query(
              collection(db, 'students'),
              where('class', '==', classData.name),
              where('teacherIds', 'array-contains', user!.uid)
            );
            
            const studentsSnap = await getDocs(studentsQuery);
            const studentsCount = studentsSnap.size;
            console.log(`Class ${classData.name}: ${studentsCount} students`);
            
            return {
              id: classData.id || (index + 1).toString(),
              name: classData.name,
              code: classData.code,
              studentsCount: studentsCount,
              lastModified: classData.lastModified || new Date().toISOString().split('T')[0],
              isActive: studentsCount > 0,
            };
          })
        );
        
        console.log('Class codes loaded:', codesWithCounts);
        setClassCodes(codesWithCounts);
        
        // Update student counts in Firebase
        const teacherRef = doc(db, 'teachers', user!.uid);
        await updateDoc(teacherRef, {
          classCodes: codesWithCounts
        });
      } catch (error) {
        console.error('Error loading class codes:', error);
      }
    };
    
    loadTeacherData();
  }, [user, form]);

  const handleUpdateProfile = async (values: any) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: values.fullName,
        phone: values.phone,
      });
      
      // Update or create teacher document
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDoc(teacherRef);
      
      const teacherData = {
        subjects: values.specialty.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        bio: values.bio,
      };
      
      if (teacherSnap.exists()) {
        // Update existing document
        await updateDoc(teacherRef, teacherData);
      } else {
        // Create new document
        await setDoc(teacherRef, {
          ...teacherData,
          uid: user.uid,
          centerId: '',
          studentIds: [],
          createdAt: new Date(),
        });
      }
      
      // Update local state
      setProfileData({
        ...profileData,
        fullName: values.fullName,
        phone: values.phone,
        specialty: values.specialty,
        bio: values.bio,
        avatar: values.fullName.charAt(0).toUpperCase(),
      });
      
      antMessage.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      antMessage.error('حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      antMessage.error('الرجاء اختيار صورة فقط');
      return;
    }
    
    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      antMessage.error('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
      return;
    }
    
    try {
      setUploadingImage(true);
      antMessage.loading({ content: 'جاري ضغط الصورة...', key: 'upload' });
      
      // Compress the image
      const compressedBlob = await compressImage(file, 800, 800, 0.85);
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      
      console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`);
      console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);
      
      antMessage.loading({ content: 'جاري رفع الصورة...', key: 'upload' });
      
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the compressed file
      await uploadBytes(storageRef, compressedFile);
      
      // Get the download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Update user document with photo URL
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: photoURL,
      });
      
      // Update local state
      setProfileData({
        ...profileData,
        avatar: photoURL,
      });
      
      antMessage.success({ content: 'تم تحميل الصورة بنجاح', key: 'upload' });
    } catch (error) {
      console.error('Error uploading image:', error);
      antMessage.error({ content: 'حدث خطأ في تحميل الصورة', key: 'upload' });
    } finally {
      setUploadingImage(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleUpdatePassword = async (values: any) => {
    if (!firebaseUser) return;

    try {
      setSaving(true);
      
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        values.current
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, values.new);
      
      passwordForm.resetFields();
      antMessage.success('تم تحديث كلمة المرور بنجاح');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        antMessage.error('كلمة المرور الحالية غير صحيحة');
      } else {
        antMessage.error('حدث خطأ في تحديث كلمة المرور');
      }
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
      
      antMessage.success('تم تحديث إعدادات الإشعارات');
    } catch (error) {
      console.error('Error updating notifications:', error);
      antMessage.error('حدث خطأ في تحديث الإشعارات');
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
      
      antMessage.success('تم تحديث المظهر');
    } catch (error) {
      console.error('Error updating theme:', error);
      antMessage.error('حدث خطأ في تحديث المظهر');
    }
  };

  const handleGenerateRandomCode = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    return randomCode;
  };

  const handleUpdateClassCode = async (classId: string) => {
    if (!user) return;
    
    try {
      const newCode = handleGenerateRandomCode();
      const updatedCodes = classCodes.map(cls =>
        cls.id === classId ? { ...cls, code: newCode, lastModified: new Date().toISOString().split('T')[0] } : cls
      );
      
      // Save to Firebase
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        classCodes: updatedCodes
      });
      
      setClassCodes(updatedCodes);
      antMessage.success('تم تحديث الكود وحفظه');
    } catch (error) {
      console.error('Error updating class code:', error);
      antMessage.error('حدث خطأ في تحديث الكود');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    antMessage.success('تم نسخ الكود');
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
    antMessage.success('تم تصدير الأكواد');
  };

  const handleAddClass = async () => {
    if (!user || !newClassName.trim()) {
      antMessage.error('الرجاء إدخال اسم الصف');
      return;
    }

    // Check if class already exists
    if (classCodes.some(cls => cls.name === newClassName.trim())) {
      antMessage.error('هذا الصف موجود بالفعل');
      return;
    }

    try {
      // Generate random code
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Generate unique ID
      const newId = Date.now().toString();
      
      // Create new class code entry
      const newClassCode: ClassCode = {
        id: newId,
        name: newClassName.trim(),
        code: newCode,
        studentsCount: 0,
        lastModified: new Date().toISOString().split('T')[0],
        isActive: false,
      };

      const updatedCodes = [...classCodes, newClassCode];
      setClassCodes(updatedCodes);

      // Save to Firebase - create or update
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDoc(teacherRef);
      
      if (teacherSnap.exists()) {
        // Update existing document
        await updateDoc(teacherRef, {
          classCodes: updatedCodes
        });
      } else {
        // Create new teacher document
        await setDoc(teacherRef, {
          uid: user.uid,
          classCodes: updatedCodes,
          subjects: [],
          studentIds: [],
          centerId: '',
          createdAt: new Date(),
        });
      }

      antMessage.success('تم إضافة الصف بنجاح');
      setIsAddClassModalOpen(false);
      setNewClassName('');
    } catch (error) {
      console.error('Error adding class:', error);
      antMessage.error('حدث خطأ في إضافة الصف');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!user) return;

    try {
      const updatedCodes = classCodes.filter(cls => cls.id !== classId);
      setClassCodes(updatedCodes);

      // Save to Firebase
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        classCodes: updatedCodes
      });

      antMessage.success('تم حذف الصف بنجاح');
    } catch (error) {
      console.error('Error deleting class:', error);
      antMessage.error('حدث خطأ في حذف الصف');
    }
  };

  const classCodesColumns = [
    {
      title: 'الصف الدراسي',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClassCode) => (
        <Space>
          <div className={`w-2 h-2 rounded-full ${record.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'الكود',
      dataIndex: 'code',
      key: 'code',
      render: (code: string, record: ClassCode) => (
        <Space>
          <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px', fontWeight: 'bold' }}>
            {showCodes[record.id] ? code : '••••'}
          </Tag>
          <Tooltip title={showCodes[record.id] ? 'إخفاء الكود' : 'إظهار الكود'}>
            <Button
              type="text"
              icon={showCodes[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowCodes({...showCodes, [record.id]: !showCodes[record.id]})}
            />
          </Tooltip>
          <Tooltip title="نسخ الكود">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopyCode(code)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'عدد الطلاب',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <Text>{count} طالب</Text>
        </Space>
      ),
    },
    {
      title: 'آخر تحديث',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_: any, record: ClassCode) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleUpdateClassCode(record.id)}
          >
            توليد كود جديد
          </Button>
          <Popconfirm
            title="حذف الصف"
            description="هل أنت متأكد من حذف هذا الصف؟"
            onConfirm={() => handleDeleteClass(record.id)}
            okText="نعم"
            cancelText="لا"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider 
      locale={arEG} 
      direction="rtl"
      theme={{
        token: {
          // Suppress deprecation warnings
        },
      }}
    >
      <DashboardLayout allowedRoles={['teacher']}>
        {loading ? (
          <Card>
            <Space direction="vertical" align="center" style={{ width: '100%', padding: '80px 0' }}>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <Text type="secondary">جاري تحميل البيانات...</Text>
            </Space>
          </Card>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <Card style={{ background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', border: 'none' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space direction="vertical" size={4}>
                    <Title level={2} style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <SettingOutlined style={{ fontSize: '32px' }} />
                      الإعدادات
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
                      إدارة حسابك وتفضيلاتك وأكواد الصفوف الدراسية
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Button
                    danger
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => signOut()}
                    style={{ height: '48px' }}
                  >
                    تسجيل الخروج
                  </Button>
                </Col>
              </Row>
            </Card>

          {/* Main Content */}
          <Card>
            <Tabs defaultActiveKey="profile" size="large">
              {/* Profile Tab */}
              <Tabs.TabPane
                tab={
                  <span>
                    <UserOutlined />
                    الملف الشخصي
                  </span>
                }
                key="profile"
              >
                <Row gutter={24}>
                  <Col xs={24} md={6}>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      {profileData.avatar.startsWith('http') ? (
                        <Avatar 
                          size={120} 
                          src={profileData.avatar}
                        />
                      ) : (
                        <Avatar 
                          size={120} 
                          style={{ background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', fontSize: '48px' }}
                        >
                          {profileData.avatar}
                        </Avatar>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-image-upload"
                        onChange={handleImageUpload}
                      />
                      <Button 
                        icon={<CameraOutlined />}
                        loading={uploadingImage}
                        onClick={() => document.getElementById('profile-image-upload')?.click()}
                      >
                        {uploadingImage ? 'جاري التحميل...' : 'تغيير الصورة'}
                      </Button>
                    </Space>
                  </Col>
                  <Col xs={24} md={18}>
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                      initialValues={profileData}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="الاسم الكامل"
                            name="fullName"
                            rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}
                          >
                            <Input size="large" prefix={<UserOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="البريد الإلكتروني"
                            name="email"
                          >
                            <Input size="large" prefix={<MailOutlined />} disabled />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="رقم الهاتف"
                            name="phone"
                          >
                            <Input size="large" prefix={<PhoneOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="التخصص"
                            name="specialty"
                          >
                            <Input size="large" placeholder="مثال: رياضيات, فيزياء" />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item
                            label="نبذة تعريفية"
                            name="bio"
                          >
                            <TextArea rows={4} placeholder="اكتب نبذة تعريفية عنك..." />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          icon={<SaveOutlined />}
                          loading={saving}
                          style={{ background: 'rgb(30, 103, 141)' }}
                        >
                          حفظ التغييرات
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </Tabs.TabPane>

              {/* Notifications Tab */}
              <Tabs.TabPane
                tab={
                  <span>
                    <BellOutlined />
                    الإشعارات
                  </span>
                }
                key="notifications"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Title level={4}>قنوات الإشعارات</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Space direction="vertical">
                          <MailOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                          <Text strong>البريد الإلكتروني</Text>
                          <Switch
                            checked={notifications.email}
                            onChange={(checked) => setNotifications({...notifications, email: checked})}
                          />
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Space direction="vertical">
                          <BellOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                          <Text strong>الإشعارات الفورية</Text>
                          <Switch
                            checked={notifications.push}
                            onChange={(checked) => setNotifications({...notifications, push: checked})}
                          />
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card size="small">
                        <Space direction="vertical">
                          <MessageOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                          <Text strong>رسائل SMS</Text>
                          <Switch
                            checked={notifications.sms}
                            onChange={(checked) => setNotifications({...notifications, sms: checked})}
                          />
                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={4}>أنواع الإشعارات</Title>
                  <Row gutter={[16, 16]}>
                    {[
                      { key: 'assignments', label: 'الواجبات والأنشطة' },
                      { key: 'announcements', label: 'الإعلانات العامة' },
                      { key: 'messages', label: 'الرسائل المباشرة' },
                      { key: 'grades', label: 'نتائج التقييمات' },
                    ].map(({ key, label }) => (
                      <Col xs={24} md={12} key={key}>
                        <Card size="small">
                          <Row justify="space-between" align="middle">
                            <Text>{label}</Text>
                            <Switch
                              checked={notifications[key as keyof typeof notifications]}
                              onChange={(checked) => setNotifications({...notifications, [key]: checked})}
                            />
                          </Row>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleUpdateNotifications}
                    style={{ background: 'rgb(30, 103, 141)' }}
                  >
                    حفظ الإعدادات
                  </Button>
                </Space>
              </Tabs.TabPane>

              {/* Security Tab */}
              <Tabs.TabPane
                tab={
                  <span>
                    <LockOutlined />
                    الأمان
                  </span>
                }
                key="security"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Class Codes */}
                  <Card
                    title={
                      <Space>
                        <TeamOutlined />
                        <span>أكواد الصفوف الدراسية</span>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setIsAddClassModalOpen(true)}
                          style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                          إضافة صف
                        </Button>
                        <Button
                          type="default"
                          icon={<DownloadOutlined />}
                          onClick={handleExportCodes}
                        >
                          تصدير الكل
                        </Button>
                      </Space>
                    }
                  >
                    <Alert
                      title="كل صف دراسي له كود سري خاص به يستخدمه الطلاب للدخول إلى المحتوى"
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Table
                      columns={classCodesColumns}
                      dataSource={classCodes}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>

                  {/* Add Class Modal */}
                  <Modal
                    title={
                      <Space>
                        <PlusOutlined />
                        <span>إضافة صف دراسي جديد</span>
                      </Space>
                    }
                    open={isAddClassModalOpen}
                    onOk={handleAddClass}
                    onCancel={() => {
                      setIsAddClassModalOpen(false);
                      setNewClassName('');
                      addClassForm.resetFields();
                    }}
                    okText="إضافة"
                    cancelText="إلغاء"
                    okButtonProps={{ 
                      style: { background: 'rgb(30, 103, 141)' },
                      icon: <PlusOutlined />
                    }}
                  >
                    <Space vertical style={{ width: '100%' }} size="large">
                      <Alert
                        title="سيتم توليد كود تلقائي للصف الجديد"
                        type="info"
                        showIcon
                      />
                      <Form form={addClassForm}>
                        <Form.Item
                          label="اسم الصف الدراسي"
                          name="className"
                          rules={[{ required: true, message: 'الرجاء إدخال اسم الصف' }]}
                        >
                          <Input
                            size="large"
                            placeholder="مثال: الصف الأول الثانوي"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            prefix={<TeamOutlined />}
                            onPressEnter={handleAddClass}
                          />
                        </Form.Item>
                      </Form>
                    </Space>
                  </Modal>

                  {/* Password Change */}
                  <Card title="تغيير كلمة المرور">
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleUpdatePassword}
                    >
                      <Form.Item
                        label="كلمة المرور الحالية"
                        name="current"
                        rules={[{ required: true, message: 'الرجاء إدخال كلمة المرور الحالية' }]}
                      >
                        <Input.Password size="large" prefix={<LockOutlined />} />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="كلمة المرور الجديدة"
                            name="new"
                            rules={[
                              { required: true, message: 'الرجاء إدخال كلمة المرور الجديدة' },
                              { min: 6, message: 'يجب أن تكون 6 أحرف على الأقل' }
                            ]}
                          >
                            <Input.Password size="large" prefix={<LockOutlined />} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="تأكيد كلمة المرور"
                            name="confirm"
                            dependencies={['new']}
                            rules={[
                              { required: true, message: 'الرجاء تأكيد كلمة المرور' },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('new') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('كلمات المرور غير متطابقة'));
                                },
                              }),
                            ]}
                          >
                            <Input.Password size="large" prefix={<LockOutlined />} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          icon={<SaveOutlined />}
                          loading={saving}
                          style={{ background: 'rgb(30, 103, 141)' }}
                        >
                          تحديث كلمة المرور
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Space>
              </Tabs.TabPane>

              {/* Preferences Tab */}
              <Tabs.TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    التفضيلات
                  </span>
                }
                key="preferences"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card title="المظهر">
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => handleUpdateTheme('light')}
                          style={{
                            border: theme === 'light' ? '2px solid rgb(30, 103, 141)' : '1px solid #d9d9d9',
                            background: theme === 'light' ? '#f0f9ff' : 'white'
                          }}
                        >
                          <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <SunOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                            <Title level={5}>فاتح</Title>
                            <Text type="secondary">المظهر الافتراضي</Text>
                          </Space>
                        </Card>
                      </Col>
                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => handleUpdateTheme('dark')}
                          style={{
                            border: theme === 'dark' ? '2px solid rgb(30, 103, 141)' : '1px solid #d9d9d9',
                            background: theme === 'dark' ? '#f0f9ff' : 'white'
                          }}
                        >
                          <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <MoonOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                            <Title level={5}>داكن</Title>
                            <Text type="secondary">مريح للعين</Text>
                          </Space>
                        </Card>
                      </Col>
                      <Col xs={24} md={8}>
                        <Card
                          hoverable
                          onClick={() => handleUpdateTheme('auto')}
                          style={{
                            border: theme === 'auto' ? '2px solid rgb(30, 103, 141)' : '1px solid #d9d9d9',
                            background: theme === 'auto' ? '#f0f9ff' : 'white'
                          }}
                        >
                          <Space direction="vertical" align="center" style={{ width: '100%' }}>
                            <SettingOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                            <Title level={5}>تلقائي</Title>
                            <Text type="secondary">يتكيف تلقائياً</Text>
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                  </Card>

                  <Card title="اللغة والمنطقة">
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item label="اللغة">
                          <Select size="large" defaultValue="ar" suffixIcon={<GlobalOutlined />}>
                            <Option value="ar">العربية</Option>
                            <Option value="en">English</Option>
                            <Option value="fr">Français</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="المنطقة الزمنية">
                          <Select size="large" defaultValue="cairo" suffixIcon={<GlobalOutlined />}>
                            <Option value="cairo">القاهرة (GMT+2)</Option>
                            <Option value="riyadh">الرياض (GMT+3)</Option>
                            <Option value="dubai">دبي (GMT+4)</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Space>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Space>
        )}
      </DashboardLayout>
    </ConfigProvider>
  );
}
