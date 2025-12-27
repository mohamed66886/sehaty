'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Teacher, Student } from '@/types';
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
  Avatar
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function StudentTeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeachers = async () => {
      if (!user?.uid) return;

      try {
        // Get student data
        const usersRef = collection(db, 'users');
        const studentQuery = query(usersRef, where('uid', '==', user.uid));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (!studentSnapshot.empty) {
          const studentData = studentSnapshot.docs[0].data() as Student;
          
          // Get teachers
          const teachersQuery = query(
            usersRef, 
            where('role', '==', 'teacher')
          );
          const teachersSnapshot = await getDocs(teachersQuery);
          
          const allTeachers = teachersSnapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Teacher[];
          
          // Filter teachers who teach this student
          const studentTeachers = allTeachers.filter(teacher => 
            studentData.teacherIds?.includes(teacher.uid)
          );
          
          setTeachers(studentTeachers);
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
                المعلمين
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                قائمة المعلمين الذين يدرسون لك
              </Text>
            </Space>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
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
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي المعلمين</Text>
                    <Title level={3} style={{ margin: 0 }}>{teachers.length}</Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Teachers List */}
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
                description="لا يوجد معلمين"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {teachers.map((teacher) => (
                <Col key={teacher.uid} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    styles={{ body: { padding: '20px' } }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {/* Avatar and Name */}
                      <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                        <Avatar 
                          size={64} 
                          icon={<UserOutlined />}
                          style={{ 
                            background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)' 
                          }}
                        />
                        <Title level={4} style={{ margin: 0 }}>{teacher.name}</Title>
                      </Space>

                      {/* Contact Info */}
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                          <MailOutlined style={{ color: '#6b7280' }} />
                          <Text style={{ fontSize: '13px' }}>{teacher.email}</Text>
                        </Space>
                        <Space>
                          <PhoneOutlined style={{ color: '#6b7280' }} />
                          <Text style={{ fontSize: '13px' }}>{teacher.phone}</Text>
                        </Space>
                      </Space>

                      {/* Subjects */}
                      {teacher.subjects && teacher.subjects.length > 0 && (
                        <div>
                          <Space size={[0, 4]} wrap>
                            <BookOutlined style={{ color: '#6b7280', fontSize: '14px' }} />
                            {teacher.subjects.map((subject, index) => (
                              <Tag key={index} color="blue">
                                {subject}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}
                    </Space>
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
