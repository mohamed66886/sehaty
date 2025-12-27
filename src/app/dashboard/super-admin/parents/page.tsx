'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Parent, Student } from '@/types';
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
  ConfigProvider,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SearchOutlined, 
  UserAddOutlined,
  UserSwitchOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import arEG from 'antd/locale/ar_EG';

const { Title, Text } = Typography;

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredParents(parents);
      return;
    }

    const filtered = parents.filter(parent =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm)
    );
    setFilteredParents(filtered);
  }, [parents, searchTerm]);

  const loadData = async () => {
    try {
      const usersRef = collection(db, 'users');
      
      // Load parents
      const parentsQuery = query(usersRef, where('role', '==', 'parent'));
      const parentsSnapshot = await getDocs(parentsQuery);
      const parentsData = parentsSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Parent[];
      setParents(parentsData);

      // Load students
      const studentsQuery = query(usersRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData: Record<string, Student> = {};
      studentsSnapshot.docs.forEach(doc => {
        studentsData[doc.id] = doc.data() as Student;
      });
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getParentStudents = (parent: Parent): Student[] => {
    if (!parent.studentIds) return [];
    return parent.studentIds
      .map(id => students[id])
      .filter(Boolean);
  };

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setParents(parents.filter(parent => parent.uid !== uid));
      message.success('تم حذف ولي الأمر بنجاح');
    } catch (error) {
      console.error('Error deleting parent:', error);
      message.error('حدث خطأ أثناء حذف ولي الأمر');
    }
  };

  const columns: ColumnType<Parent>[] = [
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
      title: 'الهاتف',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['sm', 'md', 'lg', 'xl'] as any,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'عدد الأبناء',
      dataIndex: 'studentIds',
      key: 'studentIds',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any,
      render: (studentIds: string[], record) => {
        const parentStudents = getParentStudents(record);
        return (
          <Tooltip 
            title={
              parentStudents.length > 0 ? (
                <div>
                  {parentStudents.map(s => (
                    <div key={s.uid}>{s.name} - {s.class}</div>
                  ))}
                </div>
              ) : 'لا يوجد أبناء'
            }
          >
            <Tag color="orange" icon={<TeamOutlined />}>
              {studentIds?.length || 0}
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => (a.studentIds?.length || 0) - (b.studentIds?.length || 0),
    },
    {
      title: 'الأبناء',
      dataIndex: 'studentIds',
      key: 'children',
      responsive: ['lg', 'xl'] as any,
      render: (studentIds: string[], record) => {
        const parentStudents = getParentStudents(record);
        if (parentStudents.length === 0) {
          return <Text type="secondary">لا يوجد أبناء</Text>;
        }
        return (
          <Space size={[0, 4]} wrap>
            {parentStudents.slice(0, 2).map(student => (
              <Tag key={student.uid} color="blue">
                {student.name}
              </Tag>
            ))}
            {parentStudents.length > 2 && (
              <Tag>+{parentStudents.length - 2}</Tag>
            )}
          </Space>
        );
      },
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
          <Link href={`/dashboard/super-admin/parents/${record.uid}`}>
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
            title="حذف ولي الأمر"
            description="هل أنت متأكد من حذف ولي الأمر؟"
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
                    <UserSwitchOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                    إدارة أولياء الأمور
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    عرض وإدارة جميع أولياء الأمور في النظام
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
                    إضافة ولي أمر جديد
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
                    background: '#fef3c7', 
                    color: '#d97706', 
                    borderRadius: '8px' 
                  }}>
                    <UserSwitchOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي أولياء الأمور</Text>
                    <Title level={3} style={{ margin: 0 }}>{parents.length}</Title>
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
                    <TeamOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>إجمالي الطلاب</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {parents.reduce((sum, p) => sum + (p.studentIds?.length || 0), 0)}
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
                    background: '#dcfce7', 
                    color: '#16a34a', 
                    borderRadius: '8px' 
                  }}>
                    <UserOutlined style={{ fontSize: '24px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>متوسط عدد الأبناء</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {parents.length > 0 
                        ? (parents.reduce((sum, p) => sum + (p.studentIds?.length || 0), 0) / parents.length).toFixed(1)
                        : 0
                      }
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
              placeholder="البحث بالاسم أو البريد الإلكتروني أو الهاتف..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ height: '44px' }}
            />
          </Card>

          {/* Parents Table */}
          <Card 
            styles={{ body: { padding: '0', overflow: 'hidden' } }}
            style={{ borderRadius: '8px' }}
          >
            <Table
              columns={columns}
              dataSource={filteredParents}
              rowKey="uid"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `إجمالي ${total} ولي أمر`,
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
                    <UserSwitchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
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
