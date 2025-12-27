'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole } from '@/types';
import { 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Popconfirm, 
  Card, 
  Statistic, 
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
  FilterOutlined 
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(users.filter(user => user.uid !== uid));
      message.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('حدث خطأ أثناء حذف المستخدم');
    }
  };

  const getRoleTag = (role: UserRole) => {
    const roleConfig = {
      super_admin: { color: 'red', label: 'مسؤول رئيسي' },
      teacher: { color: 'green', label: 'معلم' },
      student: { color: 'blue', label: 'طالب' },
      parent: { color: 'orange', label: 'ولي أمر' },
    };
    const config = roleConfig[role];
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns: ColumnType<User>[] = [
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
      title: 'الدور',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'مسؤول رئيسي', value: 'super_admin' },
        { text: 'معلم', value: 'teacher' },
        { text: 'طالب', value: 'student' },
        { text: 'ولي أمر', value: 'parent' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: UserRole) => getRoleTag(role),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: Date) => new Date(date).toLocaleDateString('ar-EG'),
      responsive: ['lg', 'xl'] as any,
    },
    {
      title: 'إجراءات',
      key: 'actions',
      fixed: 'left' as any,
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Link href={`/dashboard/super-admin/users/${record.uid}/edit`}>
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              size="small"
              style={{ padding: '0 8px', width: '100%', textAlign: 'right' }}
            >
              تعديل
            </Button>
          </Link>
          <Popconfirm
            title="حذف المستخدم"
            description="هل أنت متأكد من حذف هذا المستخدم؟"
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
                    <UserOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                    إدارة المستخدمين
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    عرض وإدارة جميع المستخدمين في النظام
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
                    إضافة مستخدم جديد
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>

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
                  placeholder="تصفية حسب الدور"
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value)}
                >
                  <Select.Option value="all">جميع الأدوار</Select.Option>
                  <Select.Option value="teacher">معلمين</Select.Option>
                  <Select.Option value="student">طلاب</Select.Option>
                  <Select.Option value="parent">أولياء أمور</Select.Option>
                  <Select.Option value="super_admin">مسؤولين</Select.Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Users Table */}
          <Card 
            styles={{ body: { padding: '0', overflow: 'hidden' } }}
            style={{ borderRadius: '8px' }}
          >
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="uid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `إجمالي ${total} مستخدم`,
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
                    <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
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
