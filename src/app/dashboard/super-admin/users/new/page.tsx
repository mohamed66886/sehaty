'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUser } from '@/lib/firebase/firestore';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CLASSES } from '@/lib/constants';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  ConfigProvider,
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleSubmit = async (values: any) => {
    setError('');
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // Create user document in Firestore
      await createUser(userCredential.user.uid, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
      });

      message.success('تم إنشاء المستخدم بنجاح');
      // Redirect to users list
      router.push('/dashboard/super-admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'حدث خطأ أثناء إنشاء المستخدم';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['super_admin']}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', 
                border: 'none' 
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Row align="middle" gutter={[8, 8]}>
                <Col>
                  <Link href="/dashboard/super-admin/users">
                    <Button 
                      type="text" 
                      icon={<ArrowRightOutlined style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} />}
                      style={{ color: 'white' }}
                      size="large"
                    />
                  </Link>
                </Col>
                <Col flex="auto">
                  <Space direction="vertical" size={4}>
                    <Title 
                      level={2} 
                      style={{ 
                        margin: 0, 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        fontSize: 'clamp(18px, 4.5vw, 28px)',
                        flexWrap: 'wrap'
                      }}
                    >
                      <UserOutlined style={{ fontSize: 'clamp(22px, 5vw, 32px)' }} />
                      إضافة مستخدم جديد
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(12px, 3vw, 15px)' }}>
                      إنشاء حساب مستخدم جديد في النظام
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Form */}
            <Card styles={{ body: { padding: '16px 16px 24px' } }}>
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError('')}
                  style={{ marginBottom: 20 }}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ role: 'student', class: CLASSES[0] }}
                requiredMark="optional"
              >
                {/* Name */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>الاسم الكامل</span>}
                  name="name"
                  rules={[{ required: true, message: 'الرجاء إدخال الاسم الكامل' }]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="أدخل الاسم الكامل"
                    style={{ height: '44px' }}
                  />
                </Form.Item>

                {/* Email */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>البريد الإلكتروني</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'الرجاء إدخال البريد الإلكتروني' },
                    { type: 'email', message: 'البريد الإلكتروني غير صحيح' }
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="example@email.com"
                    dir="ltr"
                    style={{ height: '44px' }}
                  />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>رقم الهاتف</span>}
                  name="phone"
                  rules={[{ required: true, message: 'الرجاء إدخال رقم الهاتف' }]}
                >
                  <Input
                    size="large"
                    prefix={<PhoneOutlined />}
                    placeholder="01234567890"
                    dir="ltr"
                    style={{ height: '44px' }}
                  />
                </Form.Item>

                {/* Role */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>الدور</span>}
                  name="role"
                  rules={[{ required: true, message: 'الرجاء اختيار الدور' }]}
                >
                  <Select
                    size="large"
                    placeholder="اختر الدور"
                    onChange={(value) => setSelectedRole(value)}
                    style={{ height: '44px' }}
                  >
                    <Select.Option value="student">طالب</Select.Option>
                    <Select.Option value="teacher">معلم</Select.Option>
                    <Select.Option value="parent">ولي أمر</Select.Option>
                    <Select.Option value="super_admin">مسؤول رئيسي</Select.Option>
                  </Select>
                </Form.Item>

                {/* Class - Only for students */}
                {selectedRole === 'student' && (
                  <Form.Item
                    label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>الصف الدراسي</span>}
                    name="class"
                    rules={[{ required: true, message: 'الرجاء اختيار الصف الدراسي' }]}
                  >
                    <Select 
                      size="large" 
                      placeholder="اختر الصف الدراسي"
                      style={{ height: '44px' }}
                    >
                      {CLASSES.map((className) => (
                        <Select.Option key={className} value={className}>
                          {className}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {/* Password */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>كلمة المرور</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'الرجاء إدخال كلمة المرور' },
                    { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                  ]}
                  extra={<span style={{ fontSize: 'clamp(11px, 2.5vw, 12px)' }}>يجب أن تكون 6 أحرف على الأقل</span>}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="********"
                    dir="ltr"
                    style={{ height: '44px' }}
                  />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                  label={<span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '500' }}>تأكيد كلمة المرور</span>}
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'الرجاء تأكيد كلمة المرور' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('كلمات المرور غير متطابقة'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="********"
                    dir="ltr"
                    style={{ height: '44px' }}
                  />
                </Form.Item>

                {/* Actions */}
                <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                  <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={loading}
                        block
                        style={{
                          background: 'rgb(30, 103, 141)',
                          borderColor: 'rgb(30, 103, 141)',
                          height: '48px',
                          fontSize: 'clamp(14px, 3vw, 16px)',
                          fontWeight: '600',
                        }}
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Link href="/dashboard/super-admin/users" style={{ display: 'block' }}>
                        <Button 
                          size="large" 
                          block
                          style={{ 
                            height: '48px',
                            fontSize: 'clamp(14px, 3vw, 16px)'
                          }}
                        >
                          إلغاء
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        </div>
      </DashboardLayout>
    </ConfigProvider>
  );
}
