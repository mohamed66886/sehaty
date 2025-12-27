'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student, Exam, Question } from '@/types';
import { 
  Button,
  Card, 
  Space, 
  Row, 
  Col,
  Typography,
  message,
  ConfigProvider,
  Input,
  Badge,
  Checkbox,
  Modal,
  Form,
  InputNumber,
  DatePicker
} from 'antd';
import { 
  BookOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ExamsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    try {
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

      // Load exams
      const examsRef = collection(db, 'exams');
      const examsQuery = query(examsRef, where('teacherId', '==', user.uid));
      const examsSnapshot = await getDocs(examsQuery);
      
      const examsData = examsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
      })) as Exam[];
      
      setExams(examsData);
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

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(168, 85, 247) 100%)', 
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
                    <BookOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                    الامتحانات
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    إنشاء وإدارة الامتحانات
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
                    color: 'rgb(147, 51, 234)',
                    fontWeight: '600',
                    height: '48px',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  إنشاء امتحان جديد
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
                    background: '#f3e8ff', 
                    color: '#9333ea', 
                    borderRadius: '8px' 
                  }}>
                    <BookOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الامتحانات</Text>
                    <Title level={3} style={{ margin: 0 }}>{exams.length}</Title>
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
                    <CalendarOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>امتحانات قادمة</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {exams.filter(exam => new Date(exam.startDate) > new Date()).length}
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
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    borderRadius: '8px' 
                  }}>
                    <TeamOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الطلاب</Text>
                    <Title level={3} style={{ margin: 0 }}>{students.length}</Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Exams List */}
          {exams.length === 0 ? (
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">لا توجد امتحانات</Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setShowForm(true)}
                  style={{ 
                    background: 'rgb(147, 51, 234)',
                    borderColor: 'rgb(147, 51, 234)',
                    height: '44px'
                  }}
                >
                  إنشاء أول امتحان
                </Button>
              </Space>
            </Card>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {exams.map((exam) => {
                const isUpcoming = new Date(exam.startDate) > new Date();
                const isActive = new Date(exam.startDate) <= new Date() && new Date(exam.endDate) >= new Date();
                const isPast = new Date(exam.endDate) < new Date();
                
                return (
                  <Card
                    key={exam.id}
                    styles={{ body: { padding: '16px' } }}
                    style={{ borderRadius: '8px' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* Title and Badge */}
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Title level={4} style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 18px)' }}>
                            {exam.title}
                          </Title>
                        </Col>
                        <Col>
                          {isUpcoming && <Badge status="processing" text="قادم" />}
                          {isActive && <Badge status="success" text="نشط" />}
                          {isPast && <Badge status="error" text="منتهي" />}
                        </Col>
                      </Row>

                      {/* Subject */}
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {exam.subject}
                      </Text>

                      {/* Info */}
                      <Row gutter={[8, 8]}>
                        <Col xs={24}>
                          <Space size="small">
                            <CalendarOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              من {new Date(exam.startDate).toLocaleDateString('ar-EG')} 
                              إلى {new Date(exam.endDate).toLocaleDateString('ar-EG')}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Space size="small">
                            <ClockCircleOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {exam.duration} دقيقة
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Space size="small">
                            <TeamOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {exam.studentIds.length} طالب
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Space size="small">
                            <BookOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {exam.questions.length} سؤال
                            </Text>
                          </Space>
                        </Col>
                      </Row>

                      {/* Total Score */}
                      <Card style={{ background: '#f9fafb', border: 'none' }}>
                        <Row justify="space-between" align="middle">
                          <Text type="secondary" style={{ fontSize: '13px' }}>الدرجة الكلية</Text>
                          <Text strong style={{ fontSize: '18px', color: 'rgb(147, 51, 234)' }}>
                            {exam.totalScore}
                          </Text>
                        </Row>
                      </Card>

                      {/* Actions */}
                      <Row gutter={[8, 8]}>
                        <Col xs={24} sm={12}>
                          <Link href={`/dashboard/teacher/exams/${exam.id}`} style={{ display: 'block' }}>
                            <Button
                              type="primary"
                              size="large"
                              block
                              style={{ 
                                background: 'rgb(147, 51, 234)',
                                borderColor: 'rgb(147, 51, 234)',
                                height: '44px'
                              }}
                            >
                              عرض التفاصيل
                            </Button>
                          </Link>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Link href={`/dashboard/teacher/exams/${exam.id}/results`} style={{ display: 'block' }}>
                            <Button
                              size="large"
                              block
                              style={{ height: '44px' }}
                            >
                              النتائج
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

        {/* Add Exam Modal */}
        <Modal
          title={<Text strong style={{ fontSize: '18px' }}>إنشاء امتحان جديد</Text>}
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
          width={800}
          style={{ top: 20 }}
        >
          <ExamForm
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

interface ExamFormProps {
  students: Student[];
  teacherId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ExamForm({ students, teacherId, onClose, onSuccess }: ExamFormProps) {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: any) => {
    if (questions.length === 0) {
      message.warning('يجب إضافة سؤال واحد على الأقل');
      return;
    }

    setSaving(true);

    try {
      const totalScore = questions.reduce((sum, q) => sum + q.points, 0);
      
      const examsRef = collection(db, 'exams');
      await addDoc(examsRef, {
        teacherId,
        title: values.title,
        subject: values.subject,
        duration: values.duration,
        startDate: Timestamp.fromDate(new Date(values.startDate)),
        endDate: Timestamp.fromDate(new Date(values.endDate)),
        studentIds: values.studentIds,
        questions,
        totalScore,
        createdAt: Timestamp.now(),
      });

      message.success('تم إنشاء الامتحان بنجاح');
      onSuccess();
    } catch (error) {
      console.error('Error creating exam:', error);
      message.error('حدث خطأ أثناء إنشاء الامتحان');
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
      initialValues={{ duration: 60, studentIds: [] }}
      style={{ marginTop: '20px' }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="عنوان الامتحان"
            name="title"
            rules={[{ required: true, message: 'الرجاء إدخال عنوان الامتحان' }]}
          >
            <Input
              size="large"
              placeholder="مثال: امتحان الشهر الأول"
              style={{ height: '44px' }}
            />
          </Form.Item>
        </Col>
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
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="المدة (بالدقائق)"
            name="duration"
            rules={[{ required: true, message: 'الرجاء إدخال المدة' }]}
          >
            <InputNumber
              size="large"
              min={1}
              placeholder="60"
              style={{ width: '100%', height: '44px' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="تاريخ البدء"
            name="startDate"
            rules={[{ required: true, message: 'الرجاء اختيار تاريخ البدء' }]}
          >
            <Input
              type="datetime-local"
              size="large"
              style={{ height: '44px' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="تاريخ الانتهاء"
            name="endDate"
            rules={[{ required: true, message: 'الرجاء اختيار تاريخ الانتهاء' }]}
          >
            <Input
              type="datetime-local"
              size="large"
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
            maxHeight: '180px', 
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

      <Form.Item
        label={
          <Row justify="space-between" style={{ width: '100%' }}>
            <Text>الأسئلة</Text>
            <Button type="link" size="small" icon={<PlusOutlined />} onClick={addQuestion}>
              إضافة سؤال
            </Button>
          </Row>
        }
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {questions.map((q, index) => (
            <Card 
              key={q.id} 
              size="small"
              styles={{ body: { padding: '12px' } }}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeQuestion(index)}
                  size="small"
                />
              }
              title={<Text style={{ fontSize: '13px' }}>سؤال {index + 1}</Text>}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Input
                  placeholder="نص السؤال"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  style={{ fontSize: '13px' }}
                />
                <Row gutter={8}>
                  <Col span={12}>
                    <InputNumber
                      placeholder="الدرجة"
                      min={1}
                      value={q.points}
                      onChange={(value) => updateQuestion(index, 'points', value || 1)}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      placeholder="الإجابة الصحيحة"
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      style={{ fontSize: '13px' }}
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          ))}
        </Space>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: '20px' }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
              block
              disabled={questions.length === 0}
              style={{ 
                background: 'rgb(147, 51, 234)',
                borderColor: 'rgb(147, 51, 234)',
                height: '44px'
              }}
            >
              {saving ? 'جاري الحفظ...' : 'إنشاء الامتحان'}
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
