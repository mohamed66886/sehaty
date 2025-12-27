'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student, Parent, Teacher } from '@/types';
import { 
  Table, 
  Input, 
  Select,
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
  TeamOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import arEG from 'antd/locale/ar_EG';
import { CLASSES } from '@/lib/constants';

const { Title, Text } = Typography;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Record<string, Parent>>({});
  const [teachers, setTeachers] = useState<Record<string, Teacher>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load students
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(studentsRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Student[];
      setStudents(studentsData);

      // Load parents
      const parentsQuery = query(studentsRef, where('role', '==', 'parent'));
      const parentsSnapshot = await getDocs(parentsQuery);
      const parentsData: Record<string, Parent> = {};
      parentsSnapshot.docs.forEach(doc => {
        parentsData[doc.id] = doc.data() as Parent;
      });
      setParents(parentsData);

      // Load teachers
      const teachersQuery = query(studentsRef, where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersData: Record<string, Teacher> = {};
      teachersSnapshot.docs.forEach(doc => {
        teachersData[doc.id] = doc.data() as Teacher;
      });
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setStudents(students.filter(student => student.uid !== uid));
      message.success('تم حذف الطالب بنجاح');
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('حدث خطأ أثناء حذف الطالب');
    }
  };

  const columns: ColumnType<Student>[] = [
    {
      title: 'الاسم',
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
      title: 'ولي الأمر',
      dataIndex: 'parentId',
      key: 'parentId',
      responsive: ['md', 'lg', 'xl'] as any,
      render: (parentId: string) => {
        const parent = parents[parentId];
        if (!parent) return <Text type="secondary">غير محدد</Text>;
        return (
          <div>
            <Text strong style={{ fontSize: '13px' }}>{parent.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{parent.phone}</Text>
          </div>
        );
      },
    },
    {
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg', 'xl'] as any,
    },
    {
      title: 'المعلمين',
      dataIndex: 'teacherIds',
      key: 'teacherIds',
      responsive: ['sm', 'md', 'lg', 'xl'] as any,
      render: (teacherIds: string[]) => (
        <Tag color="green" icon={<TeamOutlined />}>
          {teacherIds?.length || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.teacherIds?.length || 0) - (b.teacherIds?.length || 0),
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
          <Link href={`/dashboard/super-admin/students/${record.uid}`}>
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
            title="حذف الطالب"
            description="هل أنت متأكد من حذف هذا الطالب؟"
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
                    إدارة الطلاب
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    عرض وإدارة جميع الطلاب في النظام
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
                    إضافة طالب جديد
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
                    background: '#f3e8ff', 
                    color: '#9333ea', 
                    borderRadius: '8px' 
                  }}>
                    <UserOutlined style={{ fontSize: '24px' }} />
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
                    background: '#dbeafe', 
                    color: '#2563eb', 
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
                    background: '#fef3c7', 
                    color: '#d97706', 
                    borderRadius: '8px' 
                  }}>
                    <UserSwitchOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>أولياء الأمور</Text>
                    <Title level={3} style={{ margin: 0 }}>{Object.keys(parents).length}</Title>
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
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف أو الصف..."
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
                simple: isMobile,
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
