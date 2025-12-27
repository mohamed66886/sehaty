'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student } from '@/types';
import { 
  Table, 
  Input, 
  Select,
  Button, 
  Space, 
  Tag, 
  Card, 
  Row, 
  Col,
  Typography,
  message,
  ConfigProvider
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined,
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import arEG from 'antd/locale/ar_EG';
import { CLASSES } from '@/lib/constants';

const { Title, Text } = Typography;

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.uid) return;

      try {
        // Get all students where teacherIds array contains this teacher's uid
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'student'));
        const snapshot = await getDocs(q);
        
        const studentsData = snapshot.docs
          .map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }) as Student)
          .filter(student => student.teacherIds?.includes(user.uid));
        
        setStudents(studentsData);
      } catch (error) {
        console.error('Error loading students:', error);
        message.error('حدث خطأ أثناء تحميل الطلاب');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [user?.uid]);

  useEffect(() => {
    let filtered = students;

    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, classFilter]);

  const getUniqueClasses = () => {
    return Array.from(new Set(students.map(s => s.class))).sort();
  };

  const columns: ColumnType<Student>[] = [
    {
      title: 'الطالب',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'ar'),
      render: (name: string, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </div>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'الصف',
      dataIndex: 'class',
      key: 'class',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
      render: (className: string) => <Tag color="blue">{className}</Tag>,
      filters: CLASSES.map(c => ({ text: c, value: c })),
      onFilter: (value, record) => record.class === value,
    },
    {
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg', 'xl'] as any,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: Date) => new Date(date).toLocaleDateString('ar-EG'),
      responsive: ['xl'] as any,
    },
    {
      title: 'إجراءات',
      key: 'actions',
      fixed: 'left' as any,
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Link href={`/dashboard/teacher/students/${record.uid}/attendance`}>
            <Button 
              type="link" 
              icon={<CheckCircleOutlined />} 
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right', color: '#16a34a' }}
            >
              الحضور
            </Button>
          </Link>
          <Link href={`/dashboard/teacher/students/${record.uid}/homework`}>
            <Button 
              type="link" 
              icon={<FileTextOutlined />} 
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right', color: '#2563eb' }}
            >
              الواجبات
            </Button>
          </Link>
          <Link href={`/dashboard/teacher/students/${record.uid}/exams`}>
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right', color: '#9333ea' }}
            >
              الامتحانات
            </Button>
          </Link>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
  ];

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', 
              border: 'none' 
            }}
            styles={{ body: { padding: '16px' } }}
          >
            <Space direction="vertical" size={4}>
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
                <TeamOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                طلابي
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                عرض وإدارة الطلاب المسجلين معك
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
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الطلاب</Text>
                    <Title level={3} style={{ margin: 0 }}>{students.length}</Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#dcfce7', 
                    color: '#16a34a', 
                    borderRadius: '8px' 
                  }}>
                    <BookOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>الصفوف الدراسية</Text>
                    <Title level={3} style={{ margin: 0 }}>{getUniqueClasses().length}</Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f3e8ff', 
                    color: '#9333ea', 
                    borderRadius: '8px' 
                  }}>
                    <UserOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>متوسط الطلاب/صف</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {getUniqueClasses().length > 0 
                        ? Math.round(students.length / getUniqueClasses().length)
                        : 0
                      }
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card styles={{ body: { padding: '16px' } }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Input
                  size="large"
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  style={{ height: '44px' }}
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  size="large"
                  style={{ width: '100%', height: '44px' }}
                  placeholder="تصفية حسب الصف"
                  value={classFilter}
                  onChange={(value) => setClassFilter(value)}
                >
                  <Select.Option value="all">جميع الصفوف</Select.Option>
                  {CLASSES.map(className => (
                    <Select.Option key={className} value={className}>
                      {className}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Students Table */}
          <Card 
            styles={{ body: { padding: '0', overflow: 'hidden' } }}
            style={{ borderRadius: '8px' }}
          >
            <Table
              columns={columns}
              dataSource={filteredStudents}
              rowKey="uid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `إجمالي ${total} طالب`,
                locale: {
                  items_per_page: '/ الصفحة',
                  jump_to: 'الذهاب إلى',
                  page: 'صفحة',
                },
                simple: window.innerWidth < 768,
                responsive: true,
              }}
              locale={{
                emptyText: (
                  <Space direction="vertical" size="large" style={{ padding: '40px 0' }}>
                    <TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <Text type="secondary">لا توجد نتائج</Text>
                  </Space>
                ),
              }}
              scroll={{ x: 'max-content' }}
              size="small"
              style={{ 
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}
            />
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
