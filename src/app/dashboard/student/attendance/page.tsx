'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceByStudent } from '@/lib/firebase/firestore';
import type { Attendance } from '@/types';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space,
  ConfigProvider,
  Badge,
  Table,
  Empty,
  Spin,
  DatePicker,
  Select
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadAttendance = async () => {
      if (!user?.uid) return;

      try {
        const attendanceList = await getAttendanceByStudent(user.uid);
        setAttendance(attendanceList);
        setFilteredAttendance(attendanceList);
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [user]);

  const calculateStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, rate };
  };

  const stats = calculateStats();

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

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    if (value === 'all') {
      setFilteredAttendance(attendance);
    } else {
      setFilteredAttendance(attendance.filter(a => a.status === value));
    }
  };

  const columns = [
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => (
        <Space>
          <CalendarOutlined style={{ color: '#6b7280' }} />
          <Text>{new Date(date).toLocaleDateString('ar-EG')}</Text>
        </Space>
      ),
      sorter: (a: Attendance, b: Attendance) => 
        new Date(b.date).getTime() - new Date(a.date).getTime(),
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
      filters: [
        { text: 'حاضر', value: 'present' },
        { text: 'غائب', value: 'absent' },
        { text: 'متأخر', value: 'late' },
        { text: 'غياب بعذر', value: 'excused' },
      ],
      onFilter: (value: any, record: Attendance) => record.status === value,
    },
    {
      title: 'ملاحظات',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {notes || '-'}
        </Text>
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
              background: 'linear-gradient(135deg, rgb(22, 163, 74) 0%, rgb(34, 197, 94) 100%)', 
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
                <CheckCircleOutlined style={{ marginLeft: '12px' }} />
                سجل الحضور
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(14px, 3vw, 16px)' }}>
                متابعة حضورك اليومي
              </Text>
            </Space>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>معدل الحضور</Text>
                  <Title level={3} style={{ margin: 0, color: '#16a34a' }}>{stats.rate}%</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>حاضر</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats.present}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CloseCircleOutlined style={{ fontSize: '32px', color: '#dc2626' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>غائب</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats.absent}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#ca8a04' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>متأخر</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats.late}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <FileTextOutlined style={{ fontSize: '32px', color: '#2563eb' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>بعذر</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats.excused}</Title>
                </Space>
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card>
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'center' }}>
                  <CalendarOutlined style={{ fontSize: '32px', color: '#6b7280' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>الإجمالي</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats.total}</Title>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Filter */}
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>تصفية حسب الحالة</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    size="large"
                  >
                    <Select.Option value="all">الكل</Select.Option>
                    <Select.Option value="present">حاضر</Select.Option>
                    <Select.Option value="absent">غائب</Select.Option>
                    <Select.Option value="late">متأخر</Select.Option>
                    <Select.Option value="excused">غياب بعذر</Select.Option>
                  </Select>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Attendance Table */}
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ display: 'block', marginTop: '16px' }}>
                  جاري التحميل...
                </Text>
              </div>
            ) : filteredAttendance.length === 0 ? (
              <Empty 
                description="لا يوجد سجل حضور"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredAttendance.map((record, index) => ({
                  ...record,
                  key: index
                }))}
                pagination={{ 
                  pageSize: 15,
                  showSizeChanger: true,
                  showTotal: (total) => `الإجمالي: ${total} سجل`,
                  responsive: true
                }}
                scroll={{ x: 600 }}
              />
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
