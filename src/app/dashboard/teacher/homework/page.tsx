'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student, Homework } from '@/types';
import { 
  Button,
  Card, 
  Space, 
  DatePicker,
  Row, 
  Col,
  Typography,
  message,
  ConfigProvider,
  Input,
  Progress,
  Badge,
  Checkbox,
  Modal,
  Form
} from 'antd';
import { 
  FileTextOutlined,
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function HomeworkPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Load students
      const usersRef = collection(db, 'users');
      const studentsQuery = query(usersRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentsData = studentsSnapshot.docs
        .map(doc => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }) as Student)
        .filter(student => student.teacherIds?.includes(user.uid));
      
      setStudents(studentsData);

      // Load homework
      const homeworkRef = collection(db, 'homework');
      const homeworkQuery = query(homeworkRef, where('teacherId', '==', user.uid));
      const homeworkSnapshot = await getDocs(homeworkQuery);
      
      const homeworkData = homeworkSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || new Date(),
      })) as Homework[];
      
      setHomework(homeworkData);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getHomeworkStats = (hw: Homework) => {
    const totalStudents = hw.studentIds.length;
    const submissions = hw.submissions || [];
    const submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
    const pending = totalStudents - submitted;
    return { totalStudents, submitted, pending };
  };

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', 
              border: 'none' 
            }}
            styles={{ body: { padding: '16px' } }}
          >
            <Row justify="space-between" align="middle" gutter={[12, 12]}>
              <Col xs={24} md={16}>
                <Space direction="vertical" size={4}>
                  <Title 
                    level={2} 
                    style={{ 
                      margin: 0, 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: 'clamp(20px, 5vw, 28px)'
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                    الواجبات المنزلية
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    إدارة ومتابعة الواجبات المنزلية
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="default"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setShowForm(true)}
                  block
                  style={{ 
                    background: 'white', 
                    color: 'rgb(30, 103, 141)',
                    fontWeight: '600',
                    height: '48px',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  إضافة واجب جديد
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    borderRadius: '8px' 
                  }}>
                    <FileTextOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الواجبات</Text>
                    <Title level={3} style={{ margin: 0 }}>{homework.length}</Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#dcfce7', 
                    color: '#16a34a', 
                    borderRadius: '8px' 
                  }}>
                    <CheckCircleOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>واجبات مكتملة</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {homework.filter(hw => {
                        const stats = getHomeworkStats(hw);
                        return stats.submitted === stats.totalStudents;
                      }).length}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#fef3c7', 
                    color: '#ca8a04', 
                    borderRadius: '8px' 
                  }}>
                    <ClockCircleOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>واجبات معلقة</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {homework.filter(hw => new Date(hw.deadline) > new Date()).length}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Homework List */}
          {homework.length === 0 ? (
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">لا توجد واجبات منزلية</Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setShowForm(true)}
                  style={{ 
                    background: 'rgb(30, 103, 141)',
                    borderColor: 'rgb(30, 103, 141)',
                    height: '44px'
                  }}
                >
                  إضافة أول واجب
                </Button>
              </Space>
            </Card>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {homework.map((hw) => {
                const stats = getHomeworkStats(hw);
                const isOverdue = new Date(hw.deadline) < new Date();
                const progressPercent = stats.totalStudents > 0 
                  ? Math.round((stats.submitted / stats.totalStudents) * 100)
                  : 0;
                
                return (
                  <Card
                    key={hw.id}
                    styles={{ body: { padding: '16px' } }}
                    style={{ borderRadius: '8px' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* Title and Badge */}
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Title level={4} style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 18px)' }}>
                            {hw.title}
                          </Title>
                        </Col>
                        <Col>
                          {isOverdue ? (
                            <Badge status="error" text="منتهي" />
                          ) : (
                            <Badge status="success" text="نشط" />
                          )}
                        </Col>
                      </Row>

                      {/* Description */}
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {hw.description}
                      </Text>

                      {/* Info */}
                      <Row gutter={[8, 8]}>
                        <Col xs={24} sm={12}>
                          <Space size="small">
                            <CalendarOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {new Date(hw.deadline).toLocaleDateString('ar-EG')}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Space size="small">
                            <TeamOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {stats.totalStudents} طالب
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Space size="small">
                            <CheckCircleOutlined style={{ color: '#16a34a' }} />
                            <Text style={{ fontSize: '13px', color: '#16a34a' }}>
                              {stats.submitted} مسلم
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Space size="small">
                            <ClockCircleOutlined style={{ color: '#ca8a04' }} />
                            <Text style={{ fontSize: '13px', color: '#ca8a04' }}>
                              {stats.pending} معلق
                            </Text>
                          </Space>
                        </Col>
                      </Row>

                      {/* Progress Bar */}
                      <div>
                        <Row justify="space-between" style={{ marginBottom: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>نسبة التسليم</Text>
                          <Text strong style={{ color: 'rgb(30, 103, 141)', fontSize: '13px' }}>
                            {progressPercent}%
                          </Text>
                        </Row>
                        <Progress 
                          percent={progressPercent} 
                          strokeColor="rgb(30, 103, 141)"
                          showInfo={false}
                        />
                      </div>

                      {/* Actions */}
                      <Row gutter={[8, 8]}>
                        <Col xs={24} sm={12}>
                          <Link href={`/dashboard/teacher/homework/${hw.id}`} style={{ display: 'block' }}>
                            <Button
                              type="primary"
                              size="large"
                              block
                              style={{ 
                                background: 'rgb(30, 103, 141)',
                                borderColor: 'rgb(30, 103, 141)',
                                height: '44px'
                              }}
                            >
                              عرض التفاصيل
                            </Button>
                          </Link>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Link href={`/dashboard/teacher/homework/${hw.id}/submissions`} style={{ display: 'block' }}>
                            <Button
                              size="large"
                              block
                              style={{ height: '44px' }}
                            >
                              التسليمات ({stats.submitted})
                            </Button>
                          </Link>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                );
              })}
            </Space>
          )}
        </Space>

        {/* Add Homework Modal */}
        <Modal
          title={<Text strong style={{ fontSize: '18px' }}>إضافة واجب منزلي جديد</Text>}
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
          width={700}
          style={{ top: 20 }}
        >
          <HomeworkForm
            students={students}
            teacherId={user?.uid || ''}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        </Modal>
      </DashboardLayout>
    </ConfigProvider>
  );
}

interface HomeworkFormProps {
  students: Student[];
  teacherId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function HomeworkForm({ students, teacherId, onClose, onSuccess }: HomeworkFormProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: any) => {
    setSaving(true);

    try {
      const homeworkRef = collection(db, 'homework');
      await addDoc(homeworkRef, {
        teacherId,
        title: values.title,
        description: values.description,
        subject: values.subject,
        deadline: Timestamp.fromDate(new Date(values.deadline)),
        studentIds: values.studentIds,
        submissions: [],
        createdAt: Timestamp.now(),
      });

      message.success('تم إضافة الواجب بنجاح');
      onSuccess();
    } catch (error) {
      console.error('Error adding homework:', error);
      message.error('حدث خطأ أثناء إضافة الواجب');
    } finally {
      setSaving(false);
    }
  };

  const selectAll = () => {
    form.setFieldsValue({ studentIds: students.map(s => s.uid) });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ studentIds: [] }}
      style={{ marginTop: '20px' }}
    >
      <Form.Item
        label="عنوان الواجب"
        name="title"
        rules={[{ required: true, message: 'الرجاء إدخال عنوان الواجب' }]}
      >
        <Input
          size="large"
          placeholder="مثال: حل تمارين الرياضيات"
          style={{ height: '44px' }}
        />
      </Form.Item>

      <Form.Item
        label="الوصف"
        name="description"
        rules={[{ required: true, message: 'الرجاء إدخال وصف الواجب' }]}
      >
        <TextArea
          rows={3}
          placeholder="تفاصيل الواجب..."
          style={{ fontSize: '14px' }}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="المادة"
            name="subject"
            rules={[{ required: true, message: 'الرجاء إدخال المادة' }]}
          >
            <Input
              size="large"
              placeholder="مثال: الرياضيات"
              style={{ height: '44px' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="الموعد النهائي"
            name="deadline"
            rules={[{ required: true, message: 'الرجاء اختيار الموعد النهائي' }]}
          >
            <Input
              type="date"
              size="large"
              min={new Date().toISOString().split('T')[0]}
              style={{ height: '44px' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={
          <Row justify="space-between" style={{ width: '100%' }}>
            <Text>الطلاب</Text>
            <Button type="link" size="small" onClick={selectAll}>
              تحديد الكل
            </Button>
          </Row>
        }
        name="studentIds"
        rules={[{ required: true, message: 'الرجاء اختيار الطلاب' }]}
      >
        <Checkbox.Group style={{ width: '100%' }}>
          <Space direction="vertical" style={{ 
            width: '100%', 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            padding: '12px'
          }}>
            {students.map(student => (
              <Checkbox key={student.uid} value={student.uid} style={{ marginLeft: 0 }}>
                {student.name} - {student.class}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
              block
              style={{ 
                background: 'rgb(30, 103, 141)',
                borderColor: 'rgb(30, 103, 141)',
                height: '44px'
              }}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الواجب'}
            </Button>
          </Col>
          <Col xs={24} sm={12}>
            <Button
              size="large"
              onClick={onClose}
              block
              style={{ height: '44px' }}
            >
              إلغاء
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
}
