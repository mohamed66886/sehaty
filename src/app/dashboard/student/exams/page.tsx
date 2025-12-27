'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getExamsByStudent } from '@/lib/firebase/firestore';
import type { Exam } from '@/types';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  ConfigProvider,
  Badge,
  Empty,
  Spin,
  Tabs
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function StudentExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      if (!user?.uid) return;

      try {
        const examsList = await getExamsByStudent(user.uid);
        setExams(examsList);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [user]);

  const upcomingExams = exams.filter(exam => new Date(exam.startDate) > new Date());
  const activeExams = exams.filter(exam => 
    new Date(exam.startDate) <= new Date() && new Date(exam.endDate) >= new Date()
  );
  const pastExams = exams.filter(exam => new Date(exam.endDate) < new Date());

  const renderExamCard = (exam: Exam) => {
    const isUpcoming = new Date(exam.startDate) > new Date();
    const isActive = new Date(exam.startDate) <= new Date() && new Date(exam.endDate) >= new Date();
    const isPast = new Date(exam.endDate) < new Date();

    return (
      <Card 
        key={exam.id}
        hoverable
        styles={{ body: { padding: '16px' } }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Title and Badge */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0, fontSize: 'clamp(15px, 4vw, 17px)' }}>
                {exam.title}
              </Title>
            </Col>
            <Col>
              {isUpcoming && <Badge status="processing" text="قادم" />}
              {isActive && <Badge status="success" text="نشط" />}
              {isPast && <Badge status="default" text="منتهي" />}
            </Col>
          </Row>

          {/* Subject */}
          <Space>
            <BookOutlined style={{ color: '#6b7280' }} />
            <Text type="secondary" style={{ fontSize: '14px' }}>{exam.subject}</Text>
          </Space>

          {/* Info */}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Space size="small">
                  <CalendarOutlined style={{ color: '#6b7280' }} />
                  <Text style={{ fontSize: '13px' }}>
                    من {new Date(exam.startDate).toLocaleDateString('ar-EG')}
                  </Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space size="small">
                  <CalendarOutlined style={{ color: '#6b7280' }} />
                  <Text style={{ fontSize: '13px' }}>
                    إلى {new Date(exam.endDate).toLocaleDateString('ar-EG')}
                  </Text>
                </Space>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col xs={12}>
                <Space size="small">
                  <ClockCircleOutlined style={{ color: '#6b7280' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {exam.duration} دقيقة
                  </Text>
                </Space>
              </Col>
              <Col xs={12}>
                <Space size="small">
                  <FileTextOutlined style={{ color: '#6b7280' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {exam.questions.length} سؤال
                  </Text>
                </Space>
              </Col>
            </Row>
          </Space>

          {/* Total Score */}
          <Card style={{ background: '#f9fafb', border: 'none' }}>
            <Row justify="space-between" align="middle">
              <Text type="secondary" style={{ fontSize: '13px' }}>الدرجة الكلية</Text>
              <Text strong style={{ fontSize: '18px', color: '#9333ea' }}>
                {exam.totalScore}
              </Text>
            </Row>
          </Card>
        </Space>
      </Card>
    );
  };

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['student']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(168, 85, 247) 100%)', 
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
                <BookOutlined style={{ marginLeft: '12px' }} />
                الامتحانات
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                جميع الامتحانات المجدولة لك
              </Text>
            </Space>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '32px', color: '#2563eb' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>قادمة</Text>
                  <Title level={3} style={{ margin: 0 }}>{upcomingExams.length}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>نشطة</Text>
                  <Title level={3} style={{ margin: 0 }}>{activeExams.length}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <BookOutlined style={{ fontSize: '32px', color: '#6b7280' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>منتهية</Text>
                  <Title level={3} style={{ margin: 0 }}>{pastExams.length}</Title>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Exams Tabs */}
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                  جاري التحميل...
                </Text>
              </div>
            ) : (
              <Tabs
                defaultActiveKey="upcoming"
                items={[
                  {
                    key: 'upcoming',
                    label: `قادمة (${upcomingExams.length})`,
                    children: upcomingExams.length === 0 ? (
                      <Empty 
                        description="لا توجد امتحانات قادمة"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {upcomingExams.map(exam => (
                          <Col key={exam.id} xs={24} sm={12} lg={8}>
                            {renderExamCard(exam)}
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                  {
                    key: 'active',
                    label: `نشطة (${activeExams.length})`,
                    children: activeExams.length === 0 ? (
                      <Empty 
                        description="لا توجد امتحانات نشطة"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {activeExams.map(exam => (
                          <Col key={exam.id} xs={24} sm={12} lg={8}>
                            {renderExamCard(exam)}
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                  {
                    key: 'past',
                    label: `منتهية (${pastExams.length})`,
                    children: pastExams.length === 0 ? (
                      <Empty 
                        description="لا توجد امتحانات منتهية"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {pastExams.map(exam => (
                          <Col key={exam.id} xs={24} sm={12} lg={8}>
                            {renderExamCard(exam)}
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
