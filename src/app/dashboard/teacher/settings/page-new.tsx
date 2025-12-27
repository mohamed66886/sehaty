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
  message as antMessage,
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
  
  const [classCodes, setClassCodes] = useState<ClassCode[]>([
    { id: '1', name: 'الصف الأول الابتدائي', code: '1111', studentsCount: 25, lastModified: '2024-01-15', isActive: true },
    { id: '2', name: 'الصف الثاني الابتدائي', code: '2222', studentsCount: 30, lastModified: '2024-01-14', isActive: true },
    { id: '3', name: 'الصف الثالث الابتدائي', code: '3333', studentsCount: 28, lastModified: '2024-01-13', isActive: true },
    { id: '4', name: 'الصف الرابع الابتدائي', code: '4444', studentsCount: 32, lastModified: '2024-01-12', isActive: true },
    { id: '5', name: 'الصف الخامس الابتدائي', code: '5555', studentsCount: 27, lastModified: '2024-01-11', isActive: true },
    { id: '6', name: 'الصف السادس الابتدائي', code: '6666', studentsCount: 35, lastModified: '2024-01-10', isActive: true },
  ]);

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
      if (!user) return;
      
      try {
        setLoading(true);
        
        const teacherRef = doc(db, 'teachers', user.uid);
        const teacherSnap = await getDoc(teacherRef);
        
        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          const data = {
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            specialty: teacherData.subjects?.join(', ') || '',
            bio: teacherData.bio || '',
            avatar: user.name?.charAt(0) || 'م',
          };
          setProfileData(data);
          form.setFieldsValue(data);
          
          if (teacherData.classCodes) {
            setClassCodes(teacherData.classCodes);
          }
          
          if (teacherData.notificationSettings) {
            setNotifications(teacherData.notificationSettings);
          }
          
          if (teacherData.theme) {
            setTheme(teacherData.theme);
          }
          
          if (teacherData.secretCode) {
            setSecretCode(teacherData.secretCode);
          }
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
        antMessage.error('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    loadTeacherData();
  }, [user, form]);

  const handleUpdateProfile = async (values: any) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: values.fullName,
        phone: values.phone,
      });
      
      const teacherRef = doc(db, 'teachers', user.uid);
      await updateDoc(teacherRef, {
        subjects: values.specialty.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        bio: values.bio,
      });
      
      antMessage.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      antMessage.error('حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setSaving(false);
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
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => {
            const newCode = handleGenerateRandomCode();
            const updatedCodes = classCodes.map(cls =>
              cls.id === record.id ? { ...cls, code: newCode, lastModified: new Date().toISOString().split('T')[0] } : cls
            );
            setClassCodes(updatedCodes);
            antMessage.success('تم تحديث الكود');
          }}
        >
          توليد كود جديد
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
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
                      <Avatar 
                        size={120} 
                        style={{ background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', fontSize: '48px' }}
                      >
                        {profileData.avatar}
                      </Avatar>
                      <Button icon={<CameraOutlined />}>تغيير الصورة</Button>
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
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportCodes}
                      >
                        تصدير الكل
                      </Button>
                    }
                  >
                    <Alert
                      message="كل صف دراسي له كود سري خاص به يستخدمه الطلاب للدخول إلى المحتوى"
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
      </DashboardLayout>
    </ConfigProvider>
  );
}
