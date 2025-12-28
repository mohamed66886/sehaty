'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Teacher, Student, PendingSubscription } from '@/types';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  ConfigProvider,
  Empty,
  Spin,
  Tag,
  Avatar,
  Divider,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

interface TeacherWithSubscription extends Teacher {
  subscription?: PendingSubscription;
}

export default function StudentTeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      if (!user?.uid) {
        console.log('No user UID found');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading teachers for student:', user.uid);
        
        // Get student data directly by document ID
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        
        console.log('Student doc exists?', studentDoc.exists());
        
        if (studentDoc.exists()) {
          const studentData = studentDoc.data() as Student;
          console.log('Student data:', studentData);
          console.log('Teacher IDs:', studentData.teacherIds);
          
          // Check if student has teacherIds
          if (!studentData.teacherIds || studentData.teacherIds.length === 0) {
            console.log('Student has no teachers assigned');
            setLoading(false);
            return;
          }
          
          // Get teachers
          const usersRef = collection(db, 'users');
          const teachersQuery = query(
            usersRef, 
            where('role', '==', 'teacher')
          );
          const teachersSnapshot = await getDocs(teachersQuery);
          
          console.log('Total teachers found:', teachersSnapshot.docs.length);
          
          const allTeachers = teachersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              uid: data.uid || doc.id, // استخدم uid من البيانات أو document ID
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          }) as Teacher[];
          
          console.log('All teachers:', allTeachers.map(t => ({ uid: t.uid, name: t.name })));
          
          // Filter teachers who teach this student
          const studentTeachers = allTeachers.filter(teacher => 
            studentData.teacherIds?.includes(teacher.uid)
          );
          
          console.log('Student teachers:', studentTeachers.map(t => ({ uid: t.uid, name: t.name })));
          
          // Get subscription details for each teacher
          const subscriptionsQuery = query(
            collection(db, 'pendingSubscriptions'),
            where('studentUid', '==', user.uid)
          );
          const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
          
          console.log('Subscriptions found:', subscriptionsSnapshot.docs.length);
          
          const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate(),
            reviewedAt: doc.data().reviewedAt?.toDate(),
            emailVerifiedAt: doc.data().emailVerifiedAt?.toDate(),
          })) as PendingSubscription[];
          
          console.log('Subscriptions:', subscriptions);
          
          // Merge teacher data with subscription data
          const teachersWithSubscriptions = studentTeachers.map(teacher => {
            const subscription = subscriptions.find(sub => sub.teacherId === teacher.uid);
            console.log(`Teacher ${teacher.name} subscription:`, subscription);
            return {
              ...teacher,
              subscription,
            };
          });
          
          console.log('Final teachers with subscriptions:', teachersWithSubscriptions);
          setTeachers(teachersWithSubscriptions);
        } else {
          console.log('Student document not found');
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, [user]);

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['student']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', 
              border: 'none' 
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Space direction="vertical" size={4}>
              <Title 
                level={2} 
                style={{ 
                  margin: 0, 
                  color: 'white',
                  fontSize: 'clamp(22px, 5vw, 30px)'
                }}
              >
                <TeamOutlined style={{ marginLeft: '12px' }} />
                معلمي
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                المعلم الذي تدرس معه وتفاصيل الاشتراك
              </Text>
            </Space>
          </Card>

          {/* Loading State */}
          {loading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                  جاري التحميل...
                </Text>
              </div>
            </Card>
          ) : teachers.length === 0 ? (
            <Card>
              <Empty 
                description={
                  <Space direction="vertical" size="small">
                    <Text>لا يوجد معلمين مسجلين حالياً</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      قد تحتاج إلى الاشتراك مع معلم أولاً
                    </Text>
                  </Space>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {teachers.map((teacher) => (
                <Col key={teacher.uid} xs={24}>
                  <Card
                    hoverable
                    styles={{ body: { padding: '24px' } }}
                  >
                    <Row gutter={[24, 24]}>
                      {/* Teacher Info Section */}
                      <Col xs={24} md={12}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {/* Avatar and Name */}
                          <Space size="middle">
                            <Avatar 
                              size={80} 
                              icon={<UserOutlined />}
                              style={{ 
                                background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)' 
                              }}
                            />
                            <div>
                              <Title level={3} style={{ margin: 0 }}>{teacher.name}</Title>
                              <Text type="secondary">معلم</Text>
                            </div>
                          </Space>

                          <Divider style={{ margin: '8px 0' }} />

                          {/* Contact Info */}
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <MailOutlined style={{ color: '#6b7280' }} />
                              <Text>{teacher.email}</Text>
                            </Space>
                            <Space>
                              <PhoneOutlined style={{ color: '#6b7280' }} />
                              <Text>{teacher.phone}</Text>
                            </Space>
                          </Space>

                          {/* Subjects */}
                          {teacher.subjects && teacher.subjects.length > 0 && (
                            <>
                              <Divider style={{ margin: '8px 0' }} />
                              <div>
                                <Space size={[0, 8]} wrap>
                                  <BookOutlined style={{ color: '#6b7280', fontSize: '16px' }} />
                                  <Text strong>المواد:</Text>
                                  {teacher.subjects.map((subject, index) => (
                                    <Tag key={index} color="blue" style={{ fontSize: '13px' }}>
                                      {subject}
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            </>
                          )}
                        </Space>
                      </Col>

                      {/* Subscription Details Section */}
                      <Col xs={24} md={12}>
                        <Card
                          type="inner"
                          title={
                            <Space>
                              <BookOutlined />
                              <Text strong>تفاصيل الاشتراك</Text>
                            </Space>
                          }
                          style={{ height: '100%' }}
                        >
                          {teacher.subscription ? (
                            <Descriptions column={1} size="small">
                              <Descriptions.Item 
                                label={
                                  <Space>
                                    <BookOutlined />
                                    <Text>الصف</Text>
                                  </Space>
                                }
                              >
                                <Text strong>{teacher.subscription.className}</Text>
                              </Descriptions.Item>
                              
                              <Descriptions.Item 
                                label={
                                  <Space>
                                    <CalendarOutlined />
                                    <Text>تاريخ الاشتراك</Text>
                                  </Space>
                                }
                              >
                                <Text>
                                  {new Date(teacher.subscription.createdAt).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </Text>
                              </Descriptions.Item>
                              
                              <Descriptions.Item 
                                label={
                                  <Space>
                                    {teacher.subscription.status === 'approved' && <CheckCircleOutlined />}
                                    {teacher.subscription.status === 'pending' && <ClockCircleOutlined />}
                                    {teacher.subscription.status === 'rejected' && <CloseCircleOutlined />}
                                    <Text>حالة الاشتراك</Text>
                                  </Space>
                                }
                              >
                                {teacher.subscription.status === 'approved' && (
                                  <Tag color="success" icon={<CheckCircleOutlined />}>
                                    مقبول
                                  </Tag>
                                )}
                                {teacher.subscription.status === 'pending' && (
                                  <Tag color="warning" icon={<ClockCircleOutlined />}>
                                    قيد المراجعة
                                  </Tag>
                                )}
                                {teacher.subscription.status === 'rejected' && (
                                  <Tag color="error" icon={<CloseCircleOutlined />}>
                                    مرفوض
                                  </Tag>
                                )}
                              </Descriptions.Item>

                              {teacher.subscription.status === 'approved' && teacher.subscription.reviewedAt && (
                                <Descriptions.Item 
                                  label={
                                    <Space>
                                      <CalendarOutlined />
                                      <Text>تاريخ الموافقة</Text>
                                    </Space>
                                  }
                                >
                                  <Text>
                                    {new Date(teacher.subscription.reviewedAt).toLocaleDateString('ar-EG', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Text>
                                </Descriptions.Item>
                              )}

                              {teacher.subscription.status === 'rejected' && teacher.subscription.rejectionReason && (
                                <Descriptions.Item 
                                  label={
                                    <Space>
                                      <CloseCircleOutlined />
                                      <Text>سبب الرفض</Text>
                                    </Space>
                                  }
                                >
                                  <Text type="danger">{teacher.subscription.rejectionReason}</Text>
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          ) : (
                            <Empty 
                              description="لا توجد تفاصيل اشتراك"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
