'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Teacher } from '@/types';
import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Popconfirm, 
  Card, 
  Row, 
  Col,
  Typography,
  message,
  ConfigProvider
} from 'antd';
import { 
  UserOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SearchOutlined, 
  UserAddOutlined,
  BookOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const teachersRef = collection(db, 'users');
      const q = query(teachersRef, where('role', '==', 'teacher'));
      const snapshot = await getDocs(q);
      const teachersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Teacher[];
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('حدث خطأ أثناء تحميل المعلمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm) ||
      (teacher.subjects && teacher.subjects.some(subject => 
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm]);

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setTeachers(teachers.filter(teacher => teacher.uid !== uid));
      message.success('تم حذف المعلم بنجاح');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      message.error('حدث خطأ أثناء حذف المعلم');
    }
  };

  const columns: ColumnType<Teacher>[] = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'ar'),
      render: (name: string) => <Text strong>{name}</Text>,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md', 'lg', 'xl'] as any,
      ellipsis: true,
    },
    {
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'المواد',
      dataIndex: 'subjects',
      key: 'subjects',
      responsive: ['lg', 'xl'] as any,
      render: (subjects: string[]) => (
        <Space size={[0, 4]} wrap>
          {subjects && subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <Tag key={index} color="blue">{subject}</Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'عدد الطلاب',
      dataIndex: 'studentIds',
      key: 'studentIds',
      responsive: ['md', 'lg', 'xl'] as any,
      render: (studentIds: string[]) => (
        <Tag color="green" icon={<TeamOutlined />}>
          {studentIds?.length || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.studentIds?.length || 0) - (b.studentIds?.length || 0),
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
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Link href={`/dashboard/super-admin/teachers/${record.uid}`}>
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right' }}
            >
              عرض
            </Button>
          </Link>
          <Popconfirm
            title="حذف المعلم"
            description="هل أنت متأكد من حذف هذا المعلم؟"
            onConfirm={() => handleDelete(record.uid)}
            okText="نعم"
            cancelText="لا"
            okButtonProps={{ danger: true }}
            placement="topRight"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right' }}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
  ];

  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['super_admin']}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, rgb(30, 103, 141) 0%, rgb(40, 120, 160) 100%)', 
              border: 'none' 
            }}
            styles={{ body: { padding: '16px' } }}
          >
            <Row justify="space-between" align="middle" gutter={[12, 12]}>
              <Col xs={24} md={16}>
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
                    إدارة المعلمين
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    عرض وإدارة جميع المعلمين في النظام
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href="/dashboard/super-admin/users/new" style={{ width: '100%' }}>
                  <Button 
                    type="default" 
                    size="large" 
                    icon={<UserAddOutlined />}
                    block
                    style={{ 
                      background: 'white', 
                      color: 'rgb(30, 103, 141)',
                      fontWeight: '600',
                      height: '48px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    إضافة معلم جديد
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>

          {/* Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f0fdf4', 
                    color: '#16a34a', 
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
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Space>
                  <div style={{ 
                    padding: '12px', 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    borderRadius: '8px' 
                  }}>
                    <UserOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الطلاب</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {teachers.reduce((sum, t) => sum + (t.studentIds?.length || 0), 0)}
                    </Title>
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
                    <BookOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>المواد الدراسية</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {new Set(teachers.flatMap(t => t.subjects || [])).size}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Search */}
          <Card styles={{ body: { padding: '16px' } }}>
            <Input
              size="large"
              placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف أو المادة..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: '44px' }}
            />
          </Card>

          {/* Teachers Table */}
          <Card 
            styles={{ body: { padding: '0', overflow: 'hidden' } }}
            style={{ borderRadius: '8px' }}
          >
            <Table
              columns={columns}
              dataSource={filteredTeachers}
              rowKey="uid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `إجمالي ${total} معلم`,
                locale: {
                  items_per_page: '/ الصفحة',
                  jump_to: 'الذهاب إلى',
                  page: 'صفحة',
                },
                simple: isMobile,
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
