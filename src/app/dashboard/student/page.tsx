'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getStudent,
  getHomeworkByStudent,
  getExamsByStudent,
  getAttendanceByStudent
} from '@/lib/firebase/firestore';
import type { Student, Homework, Exam, Attendance } from '@/types';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  ConfigProvider,
  Badge,
  Statistic,
  Table,
  Empty,
  Spin
} from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          const [studentInfo, homeworkList, examsList, attendanceList] = await Promise.all([
            getStudent(user.uid),
            getHomeworkByStudent(user.uid),
            getExamsByStudent(user.uid),
            getAttendanceByStudent(user.uid),
          ]);

          setStudentData(studentInfo);
          setHomework(homeworkList);
          setExams(examsList);
          setAttendance(attendanceList);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const upcomingExams = exams.filter(exam => exam.startDate > new Date()).slice(0, 5);
  const pendingHomework = homework.filter(hw => new Date(hw.deadline) > new Date()).slice(0, 5);

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      excused: 'غياب بعذر',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      present: 'success',
      absent: 'error',
      late: 'warning',
      excused: 'processing',
    };
    return colors[status] || 'default';
  };

  const attendanceColumns = [
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => new Date(date).toLocaleDateString('ar-EG'),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getStatusColor(status) as any} 
          text={getStatusLabel(status)} 
        />
      ),
    },
  ];

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
                مرحباً، {user?.name}
              </Title>
              {studentData && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                  الصف: {studentData.class}
                </Text>
              )}
            </Space>
          </Card>

          {/* Quick Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="معدل الحضور"
                  value={calculateAttendanceRate()}
                  suffix="%"
                  valueStyle={{ color: '#16a34a', fontSize: 'clamp(20px, 5vw, 28px)' }}
                  prefix={<CheckCircleOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="الواجبات المعلقة"
                  value={pendingHomework.length}
                  valueStyle={{ color: '#ca8a04', fontSize: 'clamp(20px, 5vw, 28px)' }}
                  prefix={<FileTextOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="الامتحانات القادمة"
                  value={upcomingExams.length}
                  valueStyle={{ color: '#9333ea', fontSize: 'clamp(20px, 5vw, 28px)' }}
                  prefix={<BookOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="المعلمين"
                  value={studentData?.teacherIds.length || 0}
                  valueStyle={{ color: '#2563eb', fontSize: 'clamp(20px, 5vw, 28px)' }}
                  prefix={<UserOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Upcoming Homework */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#ca8a04' }} />
                    <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>الواجبات القادمة</Text>
                  </Space>
                }
                styles={{ body: { padding: '16px' } }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                  </div>
                ) : pendingHomework.length === 0 ? (
                  <Empty 
                    description="لا توجد واجبات معلقة"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {pendingHomework.map((hw) => (
                      <Card 
                        key={hw.id} 
                        size="small"
                        hoverable
                        styles={{ body: { padding: '12px' } }}
                      >
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text strong style={{ fontSize: '14px' }}>{hw.title}</Text>
                          <Text type="secondary" style={{ fontSize: '13px' }}>{hw.subject}</Text>
                          <Space size="small">
                            <CalendarOutlined style={{ color: '#dc2626', fontSize: '12px' }} />
                            <Text style={{ color: '#dc2626', fontSize: '13px' }}>
                              {new Date(hw.deadline).toLocaleDateString('ar-EG')}
                            </Text>
                          </Space>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                )}
              </Card>
            </Col>

            {/* Upcoming Exams */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#9333ea' }} />
                    <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>الامتحانات القادمة</Text>
                  </Space>
                }
                styles={{ body: { padding: '16px' } }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                  </div>
                ) : upcomingExams.length === 0 ? (
                  <Empty 
                    description="لا توجد امتحانات قادمة"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {upcomingExams.map((exam) => (
                      <Card 
                        key={exam.id} 
                        size="small"
                        hoverable
                        styles={{ body: { padding: '12px' } }}
                      >
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text strong style={{ fontSize: '14px' }}>{exam.title}</Text>
                          <Text type="secondary" style={{ fontSize: '13px' }}>{exam.subject}</Text>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <Space size="small">
                                <CalendarOutlined style={{ color: 'rgb(30, 103, 141)', fontSize: '12px' }} />
                                <Text style={{ color: 'rgb(30, 103, 141)', fontSize: '13px' }}>
                                  {new Date(exam.startDate).toLocaleDateString('ar-EG')}
                                </Text>
                              </Space>
                            </Col>
                            <Col span={12}>
                              <Space size="small">
                                <ClockCircleOutlined style={{ color: '#6b7280', fontSize: '12px' }} />
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  {exam.duration} دقيقة
                                </Text>
                              </Space>
                            </Col>
                          </Row>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                )}
              </Card>
            </Col>
          </Row>

          {/* Recent Attendance */}
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#16a34a' }} />
                <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>سجل الحضور الأخير</Text>
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
              </div>
            ) : attendance.length === 0 ? (
              <Empty 
                description="لا يوجد سجل حضور"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={attendanceColumns}
                dataSource={attendance.slice(0, 10).map((record, index) => ({
                  ...record,
                  key: index
                }))}
                pagination={false}
                scroll={{ x: 400 }}
                size="small"
              />
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
