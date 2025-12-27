'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getStudentsByParent,
  getAttendanceByStudent,
  getExamResultsByStudent
} from '@/lib/firebase/firestore';
import type { Student, Attendance, ExamResult } from '@/types';
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
  Spin,
  Button,
  Tabs
} from 'antd';
import {
  CheckCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  AlertOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function ParentDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      if (user?.uid) {
        try {
          const studentsList = await getStudentsByParent(user.uid);
          setStudents(studentsList);
          
          if (studentsList.length > 0) {
            setSelectedStudent(studentsList[0]);
            await loadStudentData(studentsList[0].uid);
          }
        } catch (error) {
          console.error('Error loading students:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStudents();
  }, [user]);

  const loadStudentData = async (studentId: string) => {
    try {
      const [attendanceList, resultsList] = await Promise.all([
        getAttendanceByStudent(studentId),
        getExamResultsByStudent(studentId),
      ]);

      setAttendance(attendanceList);
      setResults(resultsList);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const handleStudentChange = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentData(student.uid);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const calculateAverageScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / results.length);
  };

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
    {
      title: 'ملاحظات',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-',
    },
  ];

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['parent']}>
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
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                متابعة أداء أبنائك وتطورهم الدراسي
              </Text>
            </Space>
          </Card>

          {loading ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                  جاري تحميل البيانات...
                </Text>
              </div>
            </Card>
          ) : students.length === 0 ? (
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <AlertOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div>
                  <Title level={4}>لا يوجد طلاب مسجلين</Title>
                  <Text type="secondary">
                    يرجى التواصل مع الإدارة لربط حسابك بأبنائك
                  </Text>
                </div>
              </Space>
            </Card>
          ) : (
            <>
              {/* Student Selector */}
              {students.length > 1 && (
                <Card>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>اختر الطالب</Text>
                    <Space wrap>
                      {students.map((student) => (
                        <Button
                          key={student.uid}
                          type={selectedStudent?.uid === student.uid ? 'primary' : 'default'}
                          size="large"
                          onClick={() => handleStudentChange(student)}
                          style={
                            selectedStudent?.uid === student.uid
                              ? {
                                  background: 'rgb(30, 103, 141)',
                                  borderColor: 'rgb(30, 103, 141)',
                                }
                              : {}
                          }
                        >
                          {student.name}
                        </Button>
                      ))}
                    </Space>
                  </Space>
                </Card>
              )}

              {selectedStudent && (
                <>
                  {/* Student Info */}
                  <Card 
                    style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Title level={3} style={{ margin: 0 }}>{selectedStudent.name}</Title>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>الصف</Text>
                            <Text strong style={{ fontSize: '15px' }}>{selectedStudent.class}</Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>البريد الإلكتروني</Text>
                            <Text strong style={{ fontSize: '15px' }}>{selectedStudent.email}</Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>الهاتف</Text>
                            <Text strong style={{ fontSize: '15px' }}>{selectedStudent.phone}</Text>
                          </Space>
                        </Col>
                      </Row>
                    </Space>
                  </Card>

                  {/* Stats */}
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
                          title="المتوسط الدراسي"
                          value={calculateAverageScore()}
                          suffix="%"
                          valueStyle={{ color: '#2563eb', fontSize: 'clamp(20px, 5vw, 28px)' }}
                          prefix={<TrophyOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="عدد المعلمين"
                          value={selectedStudent.teacherIds.length}
                          valueStyle={{ color: '#9333ea', fontSize: 'clamp(20px, 5vw, 28px)' }}
                          prefix={<TeamOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={12} lg={6}>
                      <Card>
                        <Statistic
                          title="الامتحانات"
                          value={results.length}
                          valueStyle={{ color: '#ca8a04', fontSize: 'clamp(20px, 5vw, 28px)' }}
                          prefix={<FileTextOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    {/* Recent Attendance */}
                    <Col xs={24} lg={12}>
                      <Card 
                        title={
                          <Space>
                            <CheckCircleOutlined style={{ color: '#16a34a' }} />
                            <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>سجل الحضور الأخير</Text>
                          </Space>
                        }
                        styles={{ body: { padding: '16px' } }}
                      >
                        {attendance.length === 0 ? (
                          <Empty 
                            description="لا يوجد سجل حضور"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {attendance.slice(0, 5).map((record, index) => (
                              <Card 
                                key={index} 
                                size="small"
                                style={{ background: '#f9fafb' }}
                                styles={{ body: { padding: '12px' } }}
                              >
                                <Row justify="space-between" align="middle">
                                  <Space size="small">
                                    <CalendarOutlined style={{ color: '#6b7280' }} />
                                    <Text style={{ fontSize: '13px' }}>
                                      {new Date(record.date).toLocaleDateString('ar-EG')}
                                    </Text>
                                  </Space>
                                  <Badge 
                                    status={getStatusColor(record.status) as any} 
                                    text={getStatusLabel(record.status)} 
                                  />
                                </Row>
                              </Card>
                            ))}
                          </Space>
                        )}
                      </Card>
                    </Col>

                    {/* Recent Exam Results */}
                    <Col xs={24} lg={12}>
                      <Card 
                        title={
                          <Space>
                            <TrophyOutlined style={{ color: '#2563eb' }} />
                            <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>نتائج الامتحانات الأخيرة</Text>
                          </Space>
                        }
                        styles={{ body: { padding: '16px' } }}
                      >
                        {results.length === 0 ? (
                          <Empty 
                            description="لا توجد نتائج امتحانات"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {results.slice(0, 5).map((result) => (
                              <Card 
                                key={result.id} 
                                size="small"
                                style={{ background: '#f9fafb' }}
                                styles={{ body: { padding: '12px' } }}
                              >
                                <Row justify="space-between" align="middle">
                                  <Space direction="vertical" size={0}>
                                    <Text strong style={{ fontSize: '14px' }}>امتحان</Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                                    </Text>
                                  </Space>
                                  <Text 
                                    strong 
                                    style={{ 
                                      fontSize: 'clamp(18px, 4vw, 24px)', 
                                      color: 'rgb(30, 103, 141)' 
                                    }}
                                  >
                                    {result.score}%
                                  </Text>
                                </Row>
                              </Card>
                            ))}
                          </Space>
                        )}
                      </Card>
                    </Col>
                  </Row>

                  {/* Full Attendance Table */}
                  <Card 
                    title={
                      <Space>
                        <CheckCircleOutlined style={{ color: '#16a34a' }} />
                        <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>سجل الحضور الكامل</Text>
                      </Space>
                    }
                  >
                    {attendance.length === 0 ? (
                      <Empty 
                        description="لا يوجد سجل حضور"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Table
                        columns={attendanceColumns}
                        dataSource={attendance.map((record, index) => ({
                          ...record,
                          key: index
                        }))}
                        pagination={{ 
                          pageSize: 10,
                          showSizeChanger: false,
                          responsive: true
                        }}
                        scroll={{ x: 500 }}
                        size="small"
                      />
                    )}
                  </Card>
                </>
              )}
            </>
          )}
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
