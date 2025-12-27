'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Timeline,
  Tag,
  ConfigProvider,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import {
  getSchedulesByTeacher,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/lib/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Schedule, ScheduleClass } from '@/types';

const { Title, Text } = Typography;

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingClassIndex, setEditingClassIndex] = useState<number | null>(null);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const loadSchedules = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const data = await getSchedulesByTeacher(user.uid);
      setSchedule(data);
      
      // Load available classes from teacher's classCodes
      const teacherRef = doc(db, 'teachers', user.uid);
      const teacherSnap = await getDoc(teacherRef);
      
      if (teacherSnap.exists()) {
        const teacherData = teacherSnap.data();
        const classCodes = teacherData.classCodes || [];
        const classNames = classCodes.map((cls: any) => cls.name);
        setAvailableClasses(classNames);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('حدث خطأ في تحميل الجدول');
    } finally {
      setLoading(false);
    }
  };

  // Load schedules from Firebase
  useEffect(() => {
    if (user?.uid) {
      loadSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddClass = (daySchedule: Schedule) => {
    setEditingSchedule(daySchedule);
    setEditingClassIndex(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClass = (daySchedule: Schedule, classIndex: number) => {
    setEditingSchedule(daySchedule);
    setEditingClassIndex(classIndex);
    const classData = daySchedule.classes[classIndex];
    form.setFieldsValue(classData);
    setModalVisible(true);
  };

  const handleDeleteClass = async (daySchedule: Schedule, classIndex: number) => {
    try {
      const updatedClasses = daySchedule.classes.filter((_, index) => index !== classIndex);
      
      if (updatedClasses.length === 0) {
        // Delete the entire day schedule if no classes left
        await deleteSchedule(daySchedule.id!);
      } else {
        // Update with remaining classes
        await updateSchedule(daySchedule.id!, { classes: updatedClasses });
      }
      
      message.success('تم حذف الحصة بنجاح');
      loadSchedules();
    } catch (error) {
      console.error('Error deleting class:', error);
      message.error('حدث خطأ في حذف الحصة');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!user?.uid) return;

      if (editingSchedule && editingClassIndex !== null) {
        // Edit existing class
        const updatedClasses = [...editingSchedule.classes];
        updatedClasses[editingClassIndex] = values;
        await updateSchedule(editingSchedule.id!, { classes: updatedClasses });
        message.success('تم تعديل الحصة بنجاح');
      } else if (editingSchedule) {
        // Add new class to existing day
        const updatedClasses = [...editingSchedule.classes, values];
        await updateSchedule(editingSchedule.id!, { classes: updatedClasses });
        message.success('تم إضافة الحصة بنجاح');
      } else {
        // Create new day schedule
        const dayName = values.day;
        delete values.day;
        await createSchedule({
          teacherId: user.uid,
          day: dayName,
          classes: [values],
        });
        message.success('تم إضافة الحصة بنجاح');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      setEditingClassIndex(null);
      loadSchedules();
    } catch (error) {
      console.error('Error saving class:', error);
      message.error('حدث خطأ في حفظ الحصة');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingSchedule(null);
    setEditingClassIndex(null);
  };

  const handleAddNewDay = () => {
    setEditingSchedule(null);
    setEditingClassIndex(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Sort days
  const daysOrder = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const sortedSchedule = [...schedule].sort((a, b) => 
    daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
  );

  if (loading) {
    return (
      <ConfigProvider locale={arEG} direction="rtl">
        <DashboardLayout allowedRoles={['teacher']}>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </DashboardLayout>
      </ConfigProvider>
    );
  }

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
                    <CalendarOutlined style={{ fontSize: '32px' }} />
                    جدولي
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
                    جدول الحصص الأسبوعي
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddNewDay}
                    style={{
                      background: 'white',
                      color: 'rgb(30, 103, 141)',
                      border: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    إضافة يوم جديد
                  </Button>
                  <Tag 
                    icon={<CalendarOutlined />} 
                    color="white"
                    style={{ 
                      color: 'rgb(30, 103, 141)', 
                      fontSize: '14px', 
                      padding: '8px 16px',
                      fontWeight: '600'
                    }}
                  >
                    الأسبوع الحالي
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>



          {/* Schedule Cards */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {sortedSchedule.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CalendarOutlined style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
                  <Text type="secondary" style={{ display: 'block', fontSize: 16 }}>
                    لا توجد حصص في الجدول بعد
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddNewDay}
                    style={{ marginTop: 16 }}
                  >
                    إضافة يوم جديد
                  </Button>
                </div>
              </Card>
            ) : (
              sortedSchedule.map((day) => (
                <Card 
                  key={day.id}
                  title={
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)',
                      margin: '-1px -1px 0 -1px',
                      padding: '12px 24px',
                      borderRadius: '8px 8px 0 0',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{day.day}</span>
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddClass(day)}
                        style={{
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        إضافة حصة
                      </Button>
                    </div>
                  }
                  headStyle={{ padding: 0, border: 'none' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  {day.classes.length > 0 ? (
                    <Timeline
                      items={day.classes.map((classItem, index) => ({
                        color: 'rgb(30, 103, 141)',
                        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                        children: (
                          <Card 
                            size="small"
                            style={{ 
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.3s'
                            }}
                            hoverable
                            extra={
                              <Space>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditClass(day, index)}
                                  style={{ color: '#3b82f6' }}
                                >
                                  تعديل
                                </Button>
                                <Popconfirm
                                  title="حذف الحصة"
                                  description="هل أنت متأكد من حذف هذه الحصة؟"
                                  onConfirm={() => handleDeleteClass(day, index)}
                                  okText="نعم"
                                  cancelText="لا"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    danger
                                  >
                                    حذف
                                  </Button>
                                </Popconfirm>
                              </Space>
                            }
                          >
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <Space>
                                    <ClockCircleOutlined style={{ color: 'rgb(30, 103, 141)' }} />
                                    <Text strong style={{ color: 'rgb(30, 103, 141)' }}>
                                      {classItem.time}
                                    </Text>
                                  </Space>
                                </Col>
                                <Col>
                                  <Tag color="blue">{classItem.grade}</Tag>
                                </Col>
                              </Row>
                              
                              <Title level={5} style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOutlined />
                                {classItem.subject}
                              </Title>
                              
                              <Row gutter={16}>
                                <Col>
                                  <Space size={4}>
                                    <EnvironmentOutlined style={{ color: '#64748b' }} />
                                    <Text type="secondary">{classItem.room}</Text>
                                  </Space>
                                </Col>
                              </Row>
                            </Space>
                          </Card>
                        ),
                      }))}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <CalendarOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
                      <Text type="secondary" style={{ display: 'block' }}>
                        لا توجد حصص في هذا اليوم
                      </Text>
                    </div>
                  )}
                </Card>
              ))
            )}
          </Space>

          {/* Add/Edit Modal */}
          <Modal
            title={
              editingSchedule && editingClassIndex !== null
                ? 'تعديل حصة'
                : editingSchedule
                ? 'إضافة حصة جديدة'
                : 'إضافة يوم جديد'
            }
            open={modalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okText="حفظ"
            cancelText="إلغاء"
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              style={{ marginTop: 24 }}
            >
              {!editingSchedule && (
                <Form.Item
                  name="day"
                  label="اليوم"
                  rules={[{ required: true, message: 'الرجاء اختيار اليوم' }]}
                >
                  <Select
                    placeholder="اختر اليوم"
                    size="large"
                    options={daysOrder.map(day => ({ label: day, value: day }))}
                  />
                </Form.Item>
              )}
              
              <Form.Item
                name="time"
                label="الوقت"
                rules={[{ required: true, message: 'الرجاء إدخال الوقت' }]}
              >
                <Input placeholder="مثال: 09:00 - 10:30" size="large" />
              </Form.Item>

              <Form.Item
                name="subject"
                label="المادة"
                rules={[{ required: true, message: 'الرجاء إدخال المادة' }]}
              >
                <Input placeholder="مثال: رياضيات" size="large" />
              </Form.Item>

              <Form.Item
                name="grade"
                label="الصف"
                rules={[{ required: true, message: 'الرجاء اختيار الصف' }]}
              >
                <Select
                  placeholder="اختر الصف"
                  size="large"
                  options={availableClasses.map(className => ({
                    label: className,
                    value: className
                  }))}
                  notFoundContent={
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Text type="secondary">
                        لا توجد صفوف متاحة. يرجى إضافة صفوف من صفحة الإعدادات أولاً.
                      </Text>
                    </div>
                  }
                />
              </Form.Item>

              <Form.Item
                name="room"
                label="القاعة"
                rules={[{ required: true, message: 'الرجاء إدخال القاعة' }]}
              >
                <Input placeholder="مثال: قاعة A1" size="large" />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
