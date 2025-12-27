'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getHomeworkByStudent } from '@/lib/firebase/firestore';
import type { Homework } from '@/types';
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
  Tabs,
  Progress
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomework = async () => {
      if (!user?.uid) return;

      try {
        const homeworkList = await getHomeworkByStudent(user.uid);
        setHomework(homeworkList);
      } catch (error) {
        console.error('Error loading homework:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomework();
  }, [user]);

  const pendingHomework = homework.filter(hw => new Date(hw.deadline) > new Date());
  const completedHomework = homework.filter(hw => {
    const submission = hw.submissions?.find(s => s.studentId === user?.uid);
    return submission && (submission.status === 'submitted' || submission.status === 'graded');
  });
  const overdueHomework = homework.filter(hw => {
    const isOverdue = new Date(hw.deadline) < new Date();
    const submission = hw.submissions?.find(s => s.studentId === user?.uid);
    return isOverdue && (!submission || submission.status !== 'submitted');
  });

  const getSubmissionStatus = (hw: Homework) => {
    const submission = hw.submissions?.find(s => s.studentId === user?.uid);
    if (!submission) return { status: 'pending', text: 'لم يتم التسليم', color: 'default' };
    if (submission.status === 'graded') return { status: 'graded', text: 'تم التقييم', color: 'success' };
    if (submission.status === 'submitted') return { status: 'submitted', text: 'تم التسليم', color: 'processing' };
    return { status: 'pending', text: 'لم يتم التسليم', color: 'default' };
  };

  const renderHomeworkCard = (hw: Homework) => {
    const isOverdue = new Date(hw.deadline) < new Date();
    const submissionStatus = getSubmissionStatus(hw);
    const submission = hw.submissions?.find(s => s.studentId === user?.uid);

    return (
      <Card 
        key={hw.id}
        hoverable
        styles={{ body: { padding: '16px' } }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Title and Badge */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0, fontSize: 'clamp(15px, 4vw, 17px)' }}>
                {hw.title}
              </Title>
            </Col>
            <Col>
              <Badge 
                status={submissionStatus.color as any} 
                text={submissionStatus.text} 
              />
            </Col>
          </Row>

          {/* Description */}
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {hw.description}
          </Text>

          {/* Info */}
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12}>
              <Space size="small">
                <BookOutlined style={{ color: '#6b7280' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>{hw.subject}</Text>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space size="small">
                <CalendarOutlined style={{ color: isOverdue ? '#dc2626' : '#6b7280' }} />
                <Text style={{ fontSize: '13px', color: isOverdue ? '#dc2626' : undefined }}>
                  {new Date(hw.deadline).toLocaleDateString('ar-EG')}
                </Text>
              </Space>
            </Col>
          </Row>

          {/* Grade if graded */}
          {submission && submission.status === 'graded' && submission.grade !== undefined && (
            <Card style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <Row justify="space-between" align="middle">
                <Text strong>الدرجة</Text>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '20px', 
                    color: 'rgb(30, 103, 141)' 
                  }}
                >
                  {submission.grade} / 100
                </Text>
              </Row>
            </Card>
          )}
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
              background: 'linear-gradient(135deg, rgb(202, 138, 4) 0%, rgb(234, 179, 8) 100%)', 
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
                <FileTextOutlined style={{ marginLeft: '12px' }} />
                الواجبات المنزلية
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                متابعة واجباتك المنزلية
              </Text>
            </Space>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#ca8a04' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>معلقة</Text>
                  <Title level={3} style={{ margin: 0 }}>{pendingHomework.length}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>مكتملة</Text>
                  <Title level={3} style={{ margin: 0 }}>{completedHomework.length}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '32px', color: '#dc2626' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>متأخرة</Text>
                  <Title level={3} style={{ margin: 0 }}>{overdueHomework.length}</Title>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Homework Tabs */}
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
                defaultActiveKey="pending"
                items={[
                  {
                    key: 'pending',
                    label: `معلقة (${pendingHomework.length})`,
                    children: pendingHomework.length === 0 ? (
                      <Empty 
                        description="لا توجد واجبات معلقة"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {pendingHomework.map(hw => (
                          <Col key={hw.id} xs={24} sm={12} lg={8}>
                            {renderHomeworkCard(hw)}
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                  {
                    key: 'completed',
                    label: `مكتملة (${completedHomework.length})`,
                    children: completedHomework.length === 0 ? (
                      <Empty 
                        description="لا توجد واجبات مكتملة"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {completedHomework.map(hw => (
                          <Col key={hw.id} xs={24} sm={12} lg={8}>
                            {renderHomeworkCard(hw)}
                          </Col>
                        ))}
                      </Row>
                    ),
                  },
                  {
                    key: 'overdue',
                    label: `متأخرة (${overdueHomework.length})`,
                    children: overdueHomework.length === 0 ? (
                      <Empty 
                        description="لا توجد واجبات متأخرة"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {overdueHomework.map(hw => (
                          <Col key={hw.id} xs={24} sm={12} lg={8}>
                            {renderHomeworkCard(hw)}
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
