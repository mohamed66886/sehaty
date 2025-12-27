'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getExamResultsByStudent } from '@/lib/firebase/firestore';
import type { ExamResult } from '@/types';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  ConfigProvider,
  Empty,
  Spin,
  Table,
  Progress,
  Statistic
} from 'antd';
import {
  TrophyOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!user?.uid) return;

      try {
        const resultsList = await getExamResultsByStudent(user.uid);
        setResults(resultsList);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user]);

  const calculateStats = () => {
    if (results.length === 0) return { average: 0, highest: 0, lowest: 0, total: 0 };
    
    const scores = results.map(r => r.score);
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return { average, highest, lowest, total: results.length };
  };

  const stats = calculateStats();

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#16a34a';
    if (score >= 75) return '#2563eb';
    if (score >= 60) return '#ca8a04';
    return '#dc2626';
  };

  const columns = [
    {
      title: 'الامتحان',
      dataIndex: 'examTitle',
      key: 'examTitle',
      render: (text: string) => (
        <Space>
          <BookOutlined style={{ color: '#6b7280' }} />
          <Text strong>{text || 'امتحان'}</Text>
        </Space>
      ),
    },
    {
      title: 'التاريخ',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: Date) => (
        <Space size="small">
          <CalendarOutlined style={{ color: '#6b7280' }} />
          <Text>{new Date(date).toLocaleDateString('ar-EG')}</Text>
        </Space>
      ),
      sorter: (a: ExamResult, b: ExamResult) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    },
    {
      title: 'الدرجة',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Text 
              strong 
              style={{ 
                fontSize: '18px',
                color: getScoreColor(score)
              }}
            >
              {score}%
            </Text>
          </Row>
          <Progress 
            percent={score} 
            strokeColor={getScoreColor(score)}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
      sorter: (a: ExamResult, b: ExamResult) => b.score - a.score,
    },
    {
      title: 'الحالة',
      key: 'status',
      render: (_: any, record: ExamResult) => {
        if (record.score >= 90) return <Text style={{ color: '#16a34a' }}>ممتاز</Text>;
        if (record.score >= 75) return <Text style={{ color: '#2563eb' }}>جيد جداً</Text>;
        if (record.score >= 60) return <Text style={{ color: '#ca8a04' }}>جيد</Text>;
        return <Text style={{ color: '#dc2626' }}>يحتاج تحسين</Text>;
      },
    },
  ];

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['student']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(59, 130, 246) 100%)', 
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
                <TrophyOutlined style={{ marginLeft: '12px' }} />
                النتائج والدرجات
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                متابعة نتائج امتحاناتك وأدائك الأكاديمي
              </Text>
            </Space>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="المتوسط العام"
                  value={stats.average}
                  suffix="%"
                  valueStyle={{ 
                    color: getScoreColor(stats.average),
                    fontSize: 'clamp(20px, 5vw, 28px)' 
                  }}
                  prefix={<TrophyOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="أعلى درجة"
                  value={stats.highest}
                  suffix="%"
                  valueStyle={{ 
                    color: '#16a34a',
                    fontSize: 'clamp(20px, 5vw, 28px)' 
                  }}
                  prefix={<RiseOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="أقل درجة"
                  value={stats.lowest}
                  suffix="%"
                  valueStyle={{ 
                    color: '#dc2626',
                    fontSize: 'clamp(20px, 5vw, 28px)' 
                  }}
                  prefix={<FallOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="عدد الامتحانات"
                  value={stats.total}
                  valueStyle={{ 
                    color: '#2563eb',
                    fontSize: 'clamp(20px, 5vw, 28px)' 
                  }}
                  prefix={<CheckCircleOutlined style={{ fontSize: 'clamp(18px, 4vw, 24px)' }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Performance Chart */}
          {results.length > 0 && (
            <Card 
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#2563eb' }} />
                  <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>الأداء الأكاديمي</Text>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Row justify="space-between">
                      <Text type="secondary">متوسط الدرجات</Text>
                      <Text strong style={{ fontSize: '16px', color: getScoreColor(stats.average) }}>
                        {stats.average}%
                      </Text>
                    </Row>
                    <Progress 
                      percent={stats.average} 
                      strokeColor={getScoreColor(stats.average)}
                      strokeWidth={12}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          {/* Results Table */}
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: '#2563eb' }} />
                <Text strong style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>سجل النتائج</Text>
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                  جاري التحميل...
                </Text>
              </div>
            ) : results.length === 0 ? (
              <Empty 
                description="لا توجد نتائج حتى الآن"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={results.map((result) => ({
                  ...result,
                  key: result.id
                }))}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `الإجمالي: ${total} نتيجة`,
                  responsive: true
                }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
