'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Student, Homework } from '@/types';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  duration: string;
  price: string;
  studentsCount: number;
  maxStudents: number;
  isActive: boolean;
  teacherId: string;
  createdAt: Date;
}
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
  Progress,
  Badge,
  Modal,
  Form,
  Select,
  Upload,
  Tag
} from 'antd';
import { 
  FileTextOutlined,
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UploadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  VideoCameraOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import arEG from 'antd/locale/ar_EG';
import Link from 'next/link';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function HomeworkPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Load students
      const usersRef = collection(db, 'users');
      const studentsQuery = query(usersRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentsData = studentsSnapshot.docs
        .map(doc => ({
          uid: doc.id, // IMPORTANT: Add document ID as uid
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }) as Student)
        .filter(student => student.teacherIds?.includes(user.uid));
      
      setStudents(studentsData);

      // Load classes
      const classesRef = collection(db, 'classes');
      const classesQuery = query(classesRef, where('teacherId', '==', user.uid));
      const classesSnapshot = await getDocs(classesQuery);
      
      const classesData = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as ClassItem[];
      
      setClasses(classesData);

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

  // Get unique classes
  const uniqueClassNames = Array.from(new Set(homework.map(hw => hw.class).filter(Boolean)));

  // Filter homework
  const filteredHomework = homework.filter(hw => {
    const classMatch = filterClass === 'all' || hw.class === filterClass;
    let statusMatch = true;
    
    if (filterStatus === 'active') {
      statusMatch = new Date(hw.deadline) > new Date();
    } else if (filterStatus === 'completed') {
      const stats = getHomeworkStats(hw);
      statusMatch = stats.submitted === stats.totalStudents;
    } else if (filterStatus === 'overdue') {
      statusMatch = new Date(hw.deadline) < new Date();
    }
    
    return classMatch && statusMatch;
  });

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
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
                <Space orientation="vertical" size={4}>
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
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
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
                    <Text type="secondary" style={{ fontSize: '13px' }}>واجبات نشطة</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {homework.filter(hw => new Date(hw.deadline) > new Date()).length}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    borderRadius: '8px' 
                  }}>
                    <CalendarOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>واجبات منتهية</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {homework.filter(hw => new Date(hw.deadline) < new Date()).length}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          {homework.length > 0 && (
            <Card styles={{ body: { padding: '16px' } }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    الصف:
                  </Text>
                  <Select
                    value={filterClass}
                    onChange={setFilterClass}
                    style={{ width: '100%' }}
                    size="large"
                    options={[
                      { label: 'جميع الصفوف', value: 'all' },
                      ...uniqueClassNames.map(c => ({ label: c, value: c }))
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    الحالة:
                  </Text>
                  <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: '100%' }}
                    size="large"
                    options={[
                      { label: 'الكل', value: 'all' },
                      { label: 'نشط', value: 'active' },
                      { label: 'مكتمل', value: 'completed' },
                      { label: 'منتهي', value: 'overdue' }
                    ]}
                  />
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    عرض {filteredHomework.length} من {homework.length} واجب
                  </Text>
                </Col>
              </Row>
            </Card>
          )}

          {/* Homework List */}
          {filteredHomework.length === 0 ? (
            <Card>
              <Space orientation="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">
                  {homework.length === 0 ? 'لا توجد واجبات منزلية' : 'لا توجد نتائج تطابق البحث'}
                </Text>
                {homework.length === 0 && (
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
                )}
              </Space>
            </Card>
          ) : (
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              {filteredHomework.map((hw) => {
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
                    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
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
                              البدء: {new Date(hw.startDate || hw.createdAt).toLocaleDateString('ar-EG')}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Space size="small">
                            <CalendarOutlined style={{ color: '#dc2626' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              الانتهاء: {new Date(hw.deadline).toLocaleDateString('ar-EG')}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Space size="small">
                            <TeamOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {hw.class || 'جميع الصفوف'}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Space size="small">
                            <FileTextOutlined style={{ color: '#6b7280' }} />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {hw.subject}
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

                      {/* Attachments */}
                      {hw.attachments && hw.attachments.length > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                            المرفقات:
                          </Text>
                          <div>
                            {hw.attachments.map((file: any, idx: number) => {
                              let icon = <FileTextOutlined />;
                              let color = '#1890ff';
                              
                              if (file.type?.startsWith('image/')) {
                                icon = <FileImageOutlined />;
                                color = '#52c41a';
                              } else if (file.type?.startsWith('video/')) {
                                icon = <VideoCameraOutlined />;
                                color = '#1890ff';
                              } else if (file.type?.includes('pdf')) {
                                icon = <FilePdfOutlined />;
                                color = '#f5222d';
                              }
                              
                              return (
                                <Tag key={`hw-${hw.id}-attachment-${idx}-${file.name}`} icon={icon} color={color} style={{ marginBottom: '8px' }}>
                                  <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                    {file.name}
                                  </a>
                                </Tag>
                              );
                            })}
                          </div>
                        </div>
                      )}

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
          width={800}
          style={{ top: 20 }}
          styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
        >
          <HomeworkForm
            students={students}
            classes={classes}
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
  classes: ClassItem[];
  teacherId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function HomeworkForm({ students, classes, teacherId, onClose, onSuccess }: HomeworkFormProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Get selected class details
  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Debug: Log all students and selected class
  console.log('📊 Debug Info:', {
    selectedClassId,
    selectedClass: selectedClass ? {
      id: selectedClass.id,
      name: selectedClass.name,
      subject: selectedClass.subject
    } : null,
    totalStudents: students.length,
    studentsData: students.map(s => ({
      uid: s.uid,
      name: s.name,
      class: s.class,
      hasClass: !!s.class,
      teacherIds: s.teacherIds
    }))
  });

  // Filter students by selected class name and ensure they have valid uid
  // Students must belong to the selected class AND be linked to this teacher
  const filteredStudents = selectedClass 
    ? students.filter(s => {
        if (!s.uid) {
          console.log('❌ Student without uid:', s.name);
          return false;
        }
        
        // Skip students without a class assigned
        if (!s.class) {
          console.log('⚠️ Student without class:', s.name);
          return false;
        }
        
        // Normalize both strings: trim and convert to lowercase
        const studentClass = s.class.trim().toLowerCase().replace(/\s+/g, ' ');
        const selectedClassName = selectedClass.name.trim().toLowerCase().replace(/\s+/g, ' ');
        
        // Must match the class name
        const classMatch = studentClass === selectedClassName;
        
        // Must be linked to this teacher
        const teacherMatch = s.teacherIds?.includes(teacherId);
        
        // Debug log for each student
        console.log(`🔍 Checking ${s.name}:`, {
          studentClass: `"${s.class}"`,
          studentClassNormalized: `"${studentClass}"`,
          selectedClassName: `"${selectedClass.name}"`,
          selectedClassNameNormalized: `"${selectedClassName}"`,
          classMatch,
          teacherMatch,
          willBeIncluded: classMatch && teacherMatch
        });
        
        return classMatch && teacherMatch;
      })
    : [];
  
  console.log('✅ Filtered Students Count:', filteredStudents.length);

  // Count students without class assignment
  const studentsWithoutClass = students.filter(s => !s.class && s.teacherIds?.includes(teacherId));

  // Use filtered students only - no fallback to all students
  const studentsToShow = filteredStudents;

  const getFileIcon = (file: UploadFile) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
    if (type.startsWith('video/')) return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    if (type.includes('pdf')) return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    if (type.includes('word')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    return <FileTextOutlined />;
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);

    try {
      // Validate required fields
      if (!teacherId) {
        message.error('خطأ: معرف المعلم غير موجود');
        return;
      }

      if (!values.classId) {
        message.error('الرجاء اختيار الصف');
        return;
      }

      if (!values.studentIds || values.studentIds.length === 0) {
        message.error('الرجاء اختيار طالب واحد على الأقل');
        return;
      }

      // Get selected class details
      const selectedClassForSubmit = classes.find(c => c.id === values.classId);
      if (!selectedClassForSubmit) {
        message.error('الصف المحدد غير موجود');
        return;
      }

      // Upload files to Firebase Storage
      const uploadedFiles = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          const storageRef = ref(storage, `homework/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file.originFileObj);
          const url = await getDownloadURL(storageRef);
          uploadedFiles.push({
            name: file.name,
            url,
            type: file.type || 'application/octet-stream',
            size: file.size || 0
          });
        }
      }
      // Prepare homework data with all required fields
      const homeworkData = {
        teacherId,
        title: values.title,
        description: values.description,
        subject: selectedClassForSubmit.subject,
        class: selectedClassForSubmit.name,
        classId: values.classId,
        startDate: Timestamp.fromDate(new Date(values.startDate)),
        deadline: Timestamp.fromDate(new Date(values.deadline)),
        studentIds: values.studentIds,
        attachments: uploadedFiles,
        submissions: [],
        createdAt: Timestamp.now(),
      };

      const homeworkRef = collection(db, 'homework');
      await addDoc(homeworkRef, homeworkData);

      message.success('تم إضافة الواجب بنجاح');
      form.resetFields();
      setFileList([]);
      setSelectedClassId('');
      onSuccess();
    } catch (error) {
      console.error('Error adding homework:', error);
      message.error('حدث خطأ أثناء إضافة الواجب');
    } finally {
      setSaving(false);
    }
  };

  const selectAll = () => {
    form.setFieldsValue({ studentIds: studentsToShow.map(s => s.uid) });
  };

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student selection when class changes
    form.setFieldsValue({ studentIds: [] });
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
            label="الصف"
            name="classId"
            rules={[{ required: true, message: 'الرجاء اختيار الصف' }]}
          >
            <Select
              size="large"
              placeholder="اختر الصف"
              onChange={handleClassChange}
              options={classes.map(c => ({ 
                label: `${c.name} - ${c.subject}`, 
                value: c.id 
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="المادة"
          >
            <Input
              size="large"
              value={selectedClass?.subject || ''}
              disabled
              placeholder="سيتم اختيارها تلقائياً"
              style={{ 
                height: '44px',
                backgroundColor: '#f5f5f5',
                color: '#666'
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="تاريخ البدء"
            name="startDate"
            rules={[{ required: true, message: 'الرجاء اختيار تاريخ البدء' }]}
          >
            <Input
              type="date"
              size="large"
              min={new Date().toISOString().split('T')[0]}
              style={{ height: '44px' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="تاريخ الانتهاء"
            name="deadline"
            rules={[
              { required: true, message: 'الرجاء اختيار تاريخ الانتهاء' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('startDate');
                  if (!value || !startDate || new Date(value) >= new Date(startDate)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'));
                },
              }),
            ]}
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
        label="إرفاق ملفات (صور، فيديوهات، مستندات)"
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          listType="text"
          iconRender={getFileIcon}
        >
          <Button 
            icon={<UploadOutlined />} 
            size="large"
            block
            style={{ height: '44px' }}
          >
            اختر الملفات
          </Button>
        </Upload>
        {fileList.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {fileList.map(file => (
              <Tag 
                key={file.uid}
                closable
                onClose={() => setFileList(fileList.filter(f => f.uid !== file.uid))}
                icon={getFileIcon(file)}
                style={{ padding: '4px 8px', marginBottom: '8px' }}
              >
                {file.name}
              </Tag>
            ))}
          </div>
        )}
      </Form.Item>

      <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
          <Text strong>الطلاب {selectedClass && `(${selectedClass.name})`}</Text>
          <Button type="link" size="small" onClick={selectAll} disabled={!selectedClassId || studentsToShow.length === 0}>
            تحديد الكل ({studentsToShow.length})
          </Button>
        </Row>
        <Form.Item
          name="studentIds"
          rules={[{ required: true, message: 'الرجاء اختيار الطلاب' }]}
        >
          <Select
            mode="multiple"
            size="large"
            placeholder={
              !selectedClassId 
                ? "اختر الصف أولاً" 
                : studentsToShow.length === 0 
                  ? "لا يوجد طلاب في هذا الصف" 
                  : "اختر الطلاب"
            }
            disabled={!selectedClassId || studentsToShow.length === 0}
            options={studentsToShow.map((s, index) => ({
              key: `student-${s.uid}-${index}`,
              label: s.name || 'طالب بدون اسم',
              value: s.uid
            }))}
            style={{ width: '100%' }}
            maxTagCount="responsive"
          />
        </Form.Item>
        {selectedClassId && studentsToShow.length === 0 && studentsWithoutClass.length > 0 && (
          <div style={{ marginTop: '-16px', marginBottom: '16px', padding: '8px', background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '4px' }}>
            <Text style={{ fontSize: '13px', color: '#d46b08' }}>
              ⚠️ يوجد {studentsWithoutClass.length} طالب لم يتم تعيين صف لهم. 
              يرجى تحديث بيانات الطلاب من صفحة &quot;الطلاب&quot;.
            </Text>
          </div>
        )}
      </div>

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
                height: '48px',
                fontSize: '16px',
                fontWeight: '600'
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
              style={{ height: '48px', fontSize: '16px' }}
            >
              إلغاء
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
}
