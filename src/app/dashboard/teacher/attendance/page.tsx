'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, Timestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Student, Attendance } from '@/types';
import { 
  Button,
  Card, 
  Space, 
  DatePicker,
  Row, 
  Col,
  Typography,
  message,
  ConfigProvider,
  Input,
  Radio,
  Badge,
  Table,
  Modal,
  Empty,
  Select,
  Popconfirm
} from 'antd';
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SaveOutlined,
  UserOutlined,
  PlusOutlined,
  HistoryOutlined,
  EyeOutlined,
  FilterOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AttendanceRecord {
  id: string;
  date: Date;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  className?: string;
}

interface AttendanceDetail {
  studentId: string;
  studentName: string;
  className: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [hasApprovedSubscriptions, setHasApprovedSubscriptions] = useState(false);
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'new' | 'details'>('list');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetail[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadStudents = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // تحميل الطلاب المشتركين مع المدرس (approved subscriptions)
      const subsRef = collection(db, 'pendingSubscriptions');
      const subsQuery = query(
        subsRef, 
        where('teacherId', '==', user.uid),
        where('status', '==', 'approved')
      );
      const subsSnapshot = await getDocs(subsQuery);
      
      const approvedStudentIds = subsSnapshot.docs.map(doc => {
        const data = doc.data();
        // استخدام studentUid إذا كان موجوداً، وإلا studentId للتوافق
        return data.studentUid || data.studentId;
      }).filter(Boolean);
      
      setHasApprovedSubscriptions(approvedStudentIds.length > 0);
      
      if (approvedStudentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // تحميل بيانات الطلاب المشتركين
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const studentsData = usersSnapshot.docs
        .map(doc => ({
          ...doc.data(),
          uid: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }) as Student)
        .filter(student => 
          student.role === 'student' && 
          approvedStudentIds.includes(student.uid)
        );
      
      setStudents(studentsData);
      
      // استخراج الصفوف المتاحة
      const classes = [...new Set(studentsData.map(s => s.class).filter(Boolean))];
      setAvailableClasses(classes.sort());
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const loadAttendance = useCallback(async () => {
    if (!user?.uid || students.length === 0) return;

    try {
      const attendanceRef = collection(db, 'attendance');
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        attendanceRef,
        where('teacherId', '==', user.uid),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const snapshot = await getDocs(q);
      const attendanceData: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
      const notesData: Record<string, string> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        attendanceData[data.studentId] = data.status;
        if (data.notes) {
          notesData[data.studentId] = data.notes;
        }
      });

      setAttendance(attendanceData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  }, [user?.uid, students.length, selectedDate]);

  const loadAttendanceRecords = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('teacherId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      
      // تجميع السجلات حسب التاريخ
      const recordsByDate: Record<string, {
        present: number;
        absent: number;
        late: number;
        excused: number;
        students: Set<string>;
        date: Date;
        classes: Set<string>;
      }> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dateStr = new Date(data.date.toDate()).toISOString().split('T')[0];
        
        if (!recordsByDate[dateStr]) {
          recordsByDate[dateStr] = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            students: new Set(),
            date: data.date.toDate(),
            classes: new Set()
          };
        }
        
        recordsByDate[dateStr].students.add(data.studentId);
        const status = data.status as 'present' | 'absent' | 'late' | 'excused';
        recordsByDate[dateStr][status]++;
        
        // إضافة الصف إذا كان موجوداً
        if (data.className) {
          recordsByDate[dateStr].classes.add(data.className);
        }
      });
      
      // تحويل إلى مصفوفة وترتيبها حسب التاريخ (الأحدث أولاً)
      const records: AttendanceRecord[] = Object.entries(recordsByDate)
        .map(([dateStr, data]) => ({
          id: dateStr,
          date: data.date,
          totalStudents: data.students.size,
          present: data.present,
          absent: data.absent,
          late: data.late,
          excused: data.excused,
          className: Array.from(data.classes).join(', ') || 'غير محدد'
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadStudents();
    loadAttendanceRecords();
  }, [loadStudents, loadAttendanceRecords]);

  useEffect(() => {
    if (viewMode === 'new') {
      loadAttendance();
    }
  }, [loadAttendance, viewMode]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }));
  };

  const saveAttendance = async () => {
    if (!user?.uid) return;
    
    if (!selectedClass) {
      message.error('يجب اختيار الصف أولاً');
      return;
    }

    setSaving(true);
    try {
      const attendanceRef = collection(db, 'attendance');
      const date = new Date(selectedDate);
      
      console.log('💾 بدء حفظ الحضور للتاريخ:', selectedDate);
      console.log('� الصف المختار:', selectedClass);
      console.log('�👥 عدد الطلاب في الصف:', filteredStudents.length);
      console.log('✅ حضور مسجل:', Object.keys(attendance).length);

      for (const student of filteredStudents) {
        if (attendance[student.uid]) {
          const attendanceData = {
            studentId: student.uid,
            studentName: student.name,
            className: selectedClass,
            teacherId: user.uid,
            date: Timestamp.fromDate(date),
            status: attendance[student.uid],
            notes: notes[student.uid] || '',
            createdAt: Timestamp.now(),
          };
          
          console.log('📝 حفظ حضور:', student.name, attendanceData.status);
          await addDoc(attendanceRef, attendanceData);
        }
      }

      message.success('تم حفظ الحضور بنجاح');
      setAttendance({});
      setNotes({});
      setSelectedClass('');
      
      console.log('🔄 إعادة تحميل السجلات...');
      // إعادة تحميل السجلات
      await loadAttendanceRecords();
      
      // الانتقال لعرض القائمة
      setViewMode('list');
    } catch (error) {
      console.error('Error saving attendance:', error);
      message.error('حدث خطأ أثناء حفظ الحضور');
    } finally {
      setSaving(false);
    }
  };

  const handleNewAttendance = () => {
    setAttendance({});
    setNotes({});
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedClass('');
    setViewMode('new');
  };

  const handleViewRecord = async (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setViewMode('details');
    
    // تحميل تفاصيل الحضور لهذا اليوم
    try {
      const attendanceRef = collection(db, 'attendance');
      
      // استخدام query بسيط بدون composite index
      const q = query(
        attendanceRef,
        where('teacherId', '==', user?.uid)
      );
      
      const snapshot = await getDocs(q);
      
      // تصفية النتائج محلياً بدلاً من Firestore
      const startOfDay = new Date(record.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(record.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const details: AttendanceDetail[] = snapshot.docs
        .filter(doc => {
          const recordDate = doc.data().date.toDate();
          return recordDate >= startOfDay && recordDate <= endOfDay;
        })
        .map(doc => {
          const data = doc.data();
          return {
            studentId: data.studentId,
            studentName: data.studentName || 'غير محدد',
            className: data.className || 'غير محدد',
            status: data.status,
            notes: data.notes || ''
          };
        });
      
      setAttendanceDetails(details);
    } catch (error) {
      console.error('Error loading attendance details:', error);
      message.error('حدث خطأ أثناء تحميل التفاصيل');
    }
  };

  const handleDeleteRecord = async (dateStr: string) => {
    if (!user?.uid) return;

    try {
      // تحميل جميع سجلات الحضور للمدرس أولاً ثم التصفية محلياً
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('teacherId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      
      // تصفية السجلات حسب التاريخ محلياً
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      
      const recordsToDelete = snapshot.docs.filter(doc => {
        const recordDate = doc.data().date.toDate();
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });
      
      // حذف السجلات المصفاة
      const deletePromises = recordsToDelete.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      message.success('تم حذف سجل الحضور بنجاح');
      loadAttendanceRecords();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      message.error('حدث خطأ أثناء حذف السجل');
    }
  };

  const getStats = () => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    const excused = Object.values(attendance).filter(s => s === 'excused').length;
    return { present, absent, late, excused };
  };

  const stats = getStats();

  // تصفية الطلاب حسب الصف المختار
  const filteredStudents = selectedClass 
    ? students.filter(student => student.class === selectedClass)
    : [];

  const attendanceColumns = [
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => (
        <Space>
          <CalendarOutlined style={{ color: 'rgb(30, 103, 141)' }} />
          <Text strong>{new Date(date).toLocaleDateString('ar-EG', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </Space>
      ),
    },
    {
      title: 'الصف',
      dataIndex: 'className',
      key: 'className',
      render: (className: string) => (
        <Badge count={className} style={{ backgroundColor: '#2563eb' }} />
      ),
    },
    {
      title: 'عدد الطلاب',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      render: (total: number) => (
        <Badge count={total} showZero style={{ backgroundColor: '#6b7280' }} />
      ),
    },
    {
      title: 'حاضر',
      dataIndex: 'present',
      key: 'present',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#16a34a' }} />
      ),
    },
    {
      title: 'غائب',
      dataIndex: 'absent',
      key: 'absent',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#dc2626' }} />
      ),
    },
    {
      title: 'متأخر',
      dataIndex: 'late',
      key: 'late',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#ca8a04' }} />
      ),
    },
    {
      title: 'بعذر',
      dataIndex: 'excused',
      key: 'excused',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#2563eb' }} />
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: any, record: AttendanceRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewRecord(record)}
          >
            عرض التفاصيل
          </Button>
          <Popconfirm
            title="حذف سجل الحضور"
            description="هل أنت متأكد من حذف هذا السجل؟"
            onConfirm={() => handleDeleteRecord(record.id)}
            okText="نعم"
            cancelText="لا"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fixOldStudents = async () => {
    if (!user?.uid) return;

    setFixing(true);
    try {
      // الحصول على جميع الاشتراكات الموافق عليها
      const subsRef = collection(db, 'pendingSubscriptions');
      const subsQuery = query(
        subsRef,
        where('teacherId', '==', user.uid),
        where('status', '==', 'approved')
      );
      const subsSnapshot = await getDocs(subsQuery);

      let created = 0;

      for (const subDoc of subsSnapshot.docs) {
        const subData = subDoc.data();
        const studentUid = subData.studentUid || subData.studentId;

        if (!studentUid) continue;

        try {
          // التحقق من وجود الطالب في جدول users
          const userRef = doc(db, 'users', studentUid);
          const usersQuery = query(collection(db, 'users'), where('__name__', '==', studentUid));
          const userSnapshot = await getDocs(usersQuery);

          if (userSnapshot.empty) {
            // إنشاء سجل جديد للطالب
            await setDoc(userRef, {
              name: subData.studentName || 'بدون اسم',
              email: subData.studentEmail || '',
              phone: subData.studentPhone || '',
              role: 'student',
              class: subData.className || '',
              teacherIds: [user.uid],
              centerId: '',
              parentId: '',
              createdAt: Timestamp.now(),
            });
            created++;
          }
        } catch (error) {
          console.error('Error processing student:', error);
        }
      }

      message.success(`تم إضافة ${created} طالب بنجاح!`);
      
      // إعادة تحميل الطلاب
      loadStudents();
    } catch (error) {
      console.error('Error fixing students:', error);
      message.error('حدث خطأ أثناء إصلاح البيانات');
    } finally {
      setFixing(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <ConfigProvider locale={arEG} direction="rtl">
        <DashboardLayout allowedRoles={['teacher']}>
          <Space direction="vertical" size="large" style={{ width: '100%', display: 'block' }}>
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
                  <Space direction="vertical" size={4} style={{ display: 'block' }}>
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
                      <HistoryOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                      سجلات الحضور
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                      عرض جميع سجلات الحضور السابقة
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="default"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleNewAttendance}
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
                    إضافة سجل حضور جديد
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Attendance Records Table */}
            <Card>
              {attendanceRecords.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="لا توجد سجلات حضور سابقة"
                  style={{ padding: '40px 20px' }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleNewAttendance}
                    style={{ fontSize: 'clamp(14px, 3vw, 16px)', height: '44px' }}
                  >
                    إضافة أول سجل حضور
                  </Button>
                </Empty>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }}>
                    <Table
                      columns={attendanceColumns}
                      dataSource={attendanceRecords}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `إجمالي ${total} سجل`,
                      }}
                    />
                  </div>

                  {/* Mobile Card View */}
                  <div style={{ display: window.innerWidth < 768 ? 'block' : 'none', padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {attendanceRecords.map((record) => (
                        <Card 
                          key={record.id}
                          size="small"
                          style={{ 
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Date and Class */}
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Space>
                                <CalendarOutlined style={{ color: 'rgb(30, 103, 141)', fontSize: '18px' }} />
                                <Text strong style={{ fontSize: '15px' }}>
                                  {new Date(record.date).toLocaleDateString('ar-EG', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </Text>
                              </Space>
                              <Badge 
                                count={record.className} 
                                style={{ backgroundColor: '#2563eb', marginRight: '8px' }} 
                              />
                            </Space>

                            {/* Stats Grid */}
                            <Row gutter={[8, 8]} style={{ width: '100%' }}>
                              <Col span={6}>
                                <div style={{ 
                                  textAlign: 'center', 
                                  padding: '8px', 
                                  background: '#f0fdf4', 
                                  borderRadius: '6px',
                                  border: '1px solid #86efac'
                                }}>
                                  <CheckCircleOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
                                  <div style={{ marginTop: '4px' }}>
                                    <Text strong style={{ fontSize: '16px', color: '#16a34a' }}>
                                      {record.present}
                                    </Text>
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '11px' }}>حاضر</Text>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ 
                                  textAlign: 'center', 
                                  padding: '8px', 
                                  background: '#fef2f2', 
                                  borderRadius: '6px',
                                  border: '1px solid #fca5a5'
                                }}>
                                  <CloseCircleOutlined style={{ fontSize: '20px', color: '#dc2626' }} />
                                  <div style={{ marginTop: '4px' }}>
                                    <Text strong style={{ fontSize: '16px', color: '#dc2626' }}>
                                      {record.absent}
                                    </Text>
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '11px' }}>غائب</Text>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ 
                                  textAlign: 'center', 
                                  padding: '8px', 
                                  background: '#fefce8', 
                                  borderRadius: '6px',
                                  border: '1px solid #fde047'
                                }}>
                                  <ClockCircleOutlined style={{ fontSize: '20px', color: '#ca8a04' }} />
                                  <div style={{ marginTop: '4px' }}>
                                    <Text strong style={{ fontSize: '16px', color: '#ca8a04' }}>
                                      {record.late}
                                    </Text>
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '11px' }}>متأخر</Text>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ 
                                  textAlign: 'center', 
                                  padding: '8px', 
                                  background: '#eff6ff', 
                                  borderRadius: '6px',
                                  border: '1px solid #93c5fd'
                                }}>
                                  <ExclamationCircleOutlined style={{ fontSize: '20px', color: '#2563eb' }} />
                                  <div style={{ marginTop: '4px' }}>
                                    <Text strong style={{ fontSize: '16px', color: '#2563eb' }}>
                                      {record.excused}
                                    </Text>
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '11px' }}>بعذر</Text>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            </Row>

                            {/* Total Students */}
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '8px', 
                              background: '#f9fafb', 
                              borderRadius: '6px' 
                            }}>
                              <Space>
                                <UserOutlined style={{ color: '#6b7280' }} />
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  إجمالي الطلاب: <Text strong>{record.totalStudents}</Text>
                                </Text>
                              </Space>
                            </div>

                            {/* Action Buttons */}
                            <Row gutter={[8, 8]} style={{ width: '100%' }}>
                              <Col span={12}>
                                <Button
                                  type="primary"
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewRecord(record)}
                                  block
                                  size="large"
                                  style={{ 
                                    background: 'rgb(30, 103, 141)',
                                    height: '44px',
                                    fontSize: '14px'
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                              </Col>
                              <Col span={12}>
                                <Popconfirm
                                  title="حذف سجل الحضور"
                                  description="هل أنت متأكد من حذف هذا السجل؟"
                                  onConfirm={() => handleDeleteRecord(record.id)}
                                  okText="نعم"
                                  cancelText="لا"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    block
                                    size="large"
                                    style={{ 
                                      height: '44px',
                                      fontSize: '14px'
                                    }}
                                  >
                                    حذف السجل
                                  </Button>
                                </Popconfirm>
                              </Col>
                            </Row>
                          </Space>
                        </Card>
                      ))}
                    </div>

                    {/* Mobile Pagination Info */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      margin: '12px 0 0'
                    }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        إجمالي {attendanceRecords.length} سجل حضور
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Space>
        </DashboardLayout>
      </ConfigProvider>
    );
  }

  // Details View - عرض تفاصيل الحضور
  if (viewMode === 'details') {
    if (!selectedRecord) return null;
    
    const detailsColumns = [
      {
        title: 'اسم الطالب',
        dataIndex: 'studentName',
        key: 'studentName',
        render: (name: string) => (
          <Space>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {name.charAt(0)}
            </div>
            <Text strong>{name}</Text>
          </Space>
        ),
      },
      {
        title: 'الصف',
        dataIndex: 'className',
        key: 'className',
        render: (className: string) => (
          <Text type="secondary">{className}</Text>
        ),
      },
      {
        title: 'الحالة',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const statusConfig = {
            present: { text: 'حاضر', color: 'success' as const },
            absent: { text: 'غائب', color: 'error' as const },
            late: { text: 'متأخر', color: 'warning' as const },
            excused: { text: 'بعذر', color: 'processing' as const }
          };
          const config = statusConfig[status as keyof typeof statusConfig];
          return <Badge status={config.color} text={config.text} />;
        },
      },
      {
        title: 'ملاحظات',
        dataIndex: 'notes',
        key: 'notes',
        render: (notes: string) => (
          <Text type="secondary">{notes || '-'}</Text>
        ),
      },
    ];

    return (
      <ConfigProvider locale={arEG} direction="rtl">
        <DashboardLayout allowedRoles={['teacher']}>
          <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
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
                  <Space direction="vertical" size={4} style={{ display: 'flex' }}>
                    <Space>
                      <Button 
                        type="text" 
                        icon={<HistoryOutlined style={{ color: 'white' }} />} 
                        onClick={() => setViewMode('list')}
                        style={{ color: 'white', padding: '4px' }}
                      />
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
                        <CalendarOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                        تفاصيل الحضور
                      </Title>
                    </Space>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                      {new Date(selectedRecord.date).toLocaleDateString('ar-EG', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Stats Summary */}
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>حاضر</Text>
                    <Title level={3} style={{ margin: 0, color: '#16a34a' }}>{selectedRecord.present}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <CloseCircleOutlined style={{ fontSize: '32px', color: '#dc2626' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>غائب</Text>
                    <Title level={3} style={{ margin: 0, color: '#dc2626' }}>{selectedRecord.absent}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <ClockCircleOutlined style={{ fontSize: '32px', color: '#ca8a04' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>متأخر</Text>
                    <Title level={3} style={{ margin: 0, color: '#ca8a04' }}>{selectedRecord.late}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#2563eb' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>بعذر</Text>
                    <Title level={3} style={{ margin: 0, color: '#2563eb' }}>{selectedRecord.excused}</Title>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Students Details Table */}
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  <Text strong style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                    قائمة الطلاب ({attendanceDetails.length})
                  </Text>
                </Space>
              }
            >
              {/* Desktop Table View */}
              <div style={{ display: isMobile ? 'none' : 'block' }}>
                <Table
                  columns={detailsColumns}
                  dataSource={attendanceDetails}
                  rowKey="studentId"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `إجمالي ${total} طالب`,
                  }}
                  locale={{
                    emptyText: 'لا توجد بيانات'
                  }}
                />
              </div>

              {/* Mobile Card View */}
              <div style={{ display: isMobile ? 'block' : 'none', padding: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {attendanceDetails.map((detail) => (
                    <Card 
                      key={detail.studentId}
                      size="small"
                      style={{ 
                        border: '1px solid #e5e7eb',
                        background: detail.status === 'present' ? '#f0fdf4' : 
                                   detail.status === 'absent' ? '#fef2f2' : 
                                   detail.status === 'late' ? '#fefce8' : '#eff6ff'
                      }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* Student Info */}
                        <Space align="center" style={{ width: '100%' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#dbeafe',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            flexShrink: 0
                          }}>
                            {detail.studentName.charAt(0)}
                          </div>
                          <Space direction="vertical" size={2} style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: '15px' }}>{detail.studentName}</Text>
                            <Text type="secondary" style={{ fontSize: '13px' }}>{detail.className}</Text>
                          </Space>
                        </Space>

                        {/* Status Badge */}
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          background: 'white', 
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {detail.status === 'present' && (
                            <Space>
                              <CheckCircleOutlined style={{ fontSize: '20px', color: '#16a34a' }} />
                              <Text strong style={{ fontSize: '15px', color: '#16a34a' }}>حاضر</Text>
                            </Space>
                          )}
                          {detail.status === 'absent' && (
                            <Space>
                              <CloseCircleOutlined style={{ fontSize: '20px', color: '#dc2626' }} />
                              <Text strong style={{ fontSize: '15px', color: '#dc2626' }}>غائب</Text>
                            </Space>
                          )}
                          {detail.status === 'late' && (
                            <Space>
                              <ClockCircleOutlined style={{ fontSize: '20px', color: '#ca8a04' }} />
                              <Text strong style={{ fontSize: '15px', color: '#ca8a04' }}>متأخر</Text>
                            </Space>
                          )}
                          {detail.status === 'excused' && (
                            <Space>
                              <ExclamationCircleOutlined style={{ fontSize: '20px', color: '#2563eb' }} />
                              <Text strong style={{ fontSize: '15px', color: '#2563eb' }}>بعذر</Text>
                            </Space>
                          )}
                        </div>

                        {/* Notes */}
                        {detail.notes && (
                          <div style={{ 
                            padding: '10px', 
                            background: 'white', 
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              📝 {detail.notes}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>

                {/* Mobile Pagination Info */}
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  margin: '12px 0 0'
                }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    إجمالي {attendanceDetails.length} طالب
                  </Text>
                </div>
              </div>
            </Card>
          </Space>
        </DashboardLayout>
      </ConfigProvider>
    );
  }

  // New Attendance Form View
  return (
    <ConfigProvider locale={arEG} direction="rtl">
      <DashboardLayout allowedRoles={['teacher']}>
        <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
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
                <Space direction="vertical" size={4} style={{ display: 'flex' }}>
                  <Space>
                    <Button 
                      type="text" 
                      icon={<HistoryOutlined style={{ color: 'white' }} />} 
                      onClick={() => setViewMode('list')}
                      style={{ color: 'white', padding: '4px' }}
                    />
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
                      <CheckCircleOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                      سجل حضور جديد
                    </Title>
                  </Space>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 'clamp(13px, 3vw, 15px)' }}>
                    تسجيل حضور وغياب الطلاب
                  </Text>
                </Space>
              </Col>
              <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="default"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={saving}
                  disabled={!selectedClass || Object.keys(attendance).length === 0}
                  onClick={saveAttendance}
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
                  {saving ? 'جاري الحفظ...' : 'حفظ الحضور'}
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Date Selector */}
          <Card styles={{ body: { padding: '16px' } }}>
            <Space style={{ width: '100%', display: 'flex' }} size="middle">
              <CalendarOutlined style={{ fontSize: '24px', color: 'rgb(30, 103, 141)' }} />
              <DatePicker
                size="large"
                value={dayjs(selectedDate)}
                onChange={(date) => setSelectedDate(date?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0])}
                format="YYYY-MM-DD"
                placeholder="اختر التاريخ"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                style={{ flex: 1, height: '44px' }}
              />
            </Space>
          </Card>

          {/* Class Filter */}
          <Card styles={{ body: { padding: '16px' } }}>
            <div style={{ width: '100%' }}>
              <Space style={{ marginBottom: '12px' }}>
                <FilterOutlined style={{ fontSize: '24px', color: 'rgb(30, 103, 141)' }} />
                <Text strong style={{ fontSize: '16px' }}>اختر الصف *</Text>
              </Space>
              <Select
                size="large"
                placeholder="اختر الصف لتسجيل الحضور"
                value={selectedClass || undefined}
                onChange={(value) => {
                  setSelectedClass(value);
                  setAttendance({});
                  setNotes({});
                }}
                style={{ width: '100%', height: '44px' }}
                options={availableClasses.map(cls => ({
                  label: cls,
                  value: cls
                }))}
              />
              {!selectedClass && (
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  ⚠️ يجب اختيار ا��صف أولاً لتتمكن من تسجيل الحضور
                </Text>
              )}
              {selectedClass && (
                <Text type="success" style={{ fontSize: '13px', color: '#16a34a' }}>
                  ✓ تم اختيار الصف: {selectedClass} - عدد الطلاب: {filteredStudents.length}
                </Text>
              )}
            </div>
          </Card>

          {/* Stats */}
          {selectedClass && (
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: '32px', color: '#16a34a' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>حاضر</Text>
                    <Title level={3} style={{ margin: 0, color: '#16a34a' }}>{stats.present}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <CloseCircleOutlined style={{ fontSize: '32px', color: '#dc2626' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>غائب</Text>
                    <Title level={3} style={{ margin: 0, color: '#dc2626' }}>{stats.absent}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <ClockCircleOutlined style={{ fontSize: '32px', color: '#ca8a04' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>متأخر</Text>
                    <Title level={3} style={{ margin: 0, color: '#ca8a04' }}>{stats.late}</Title>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center' }}>
                    <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#2563eb' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>بعذر</Text>
                    <Title level={3} style={{ margin: 0, color: '#2563eb' }}>{stats.excused}</Title>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}

          {/* Attendance Table - Mobile Responsive */}
          <Card 
            title={
              <Space>
                <UserOutlined />
                <Text strong style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                  {selectedClass 
                    ? `طلاب الصف ${selectedClass} (${filteredStudents.length})` 
                    : `إجمالي الطلاب (${students.length})`
                  }
                </Text>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            {!selectedClass ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div>
                  <FilterOutlined style={{ fontSize: 'clamp(36px, 10vw, 48px)', color: '#d9d9d9' }} />
                  <Title level={4} style={{ color: '#6b7280', fontSize: 'clamp(16px, 4vw, 20px)', margin: '16px 0 8px' }}>اختر الصف أولاً</Title>
                  <Text type="secondary" style={{ fontSize: 'clamp(13px, 3vw, 14px)' }}>يجب اختيار الصف من القائمة أعلاه لتسجيل الحضور</Text>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div>
                  <UserOutlined style={{ fontSize: 'clamp(36px, 10vw, 48px)', color: '#d9d9d9' }} />
                  <Text type="secondary" style={{ fontSize: 'clamp(13px, 3vw, 14px)', display: 'block', marginTop: '16px' }}>لا يوجد طلاب في هذا الصف</Text>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop View - Hidden on Mobile */}
                <div style={{ overflowX: 'auto', display: isMobile ? 'none' : 'block' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <tr>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          الطالب
                        </th>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          الصف
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          الحالة
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          حاضر
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          غائب
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          متأخر
                        </th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          بعذر
                        </th>
                        <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                          ملاحظات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr 
                          key={student.uid}
                          style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            background: attendance[student.uid] ? '#f9fafb' : 'white',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '16px' }}>
                            <Space>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#dbeafe',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '16px'
                              }}>
                                {student.name.charAt(0)}
                              </div>
                              <Text strong style={{ fontSize: '14px' }}>{student.name}</Text>
                            </Space>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Text type="secondary" style={{ fontSize: '13px' }}>{student.class}</Text>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {attendance[student.uid] === 'present' && (
                              <Badge status="success" text="حاضر" />
                            )}
                            {attendance[student.uid] === 'absent' && (
                              <Badge status="error" text="غائب" />
                            )}
                            {attendance[student.uid] === 'late' && (
                              <Badge status="warning" text="متأخر" />
                            )}
                            {attendance[student.uid] === 'excused' && (
                              <Badge status="processing" text="بعذر" />
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Radio
                              checked={attendance[student.uid] === 'present'}
                              onChange={() => handleStatusChange(student.uid, 'present')}
                              style={{
                                transform: 'scale(1.3)',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Radio
                              checked={attendance[student.uid] === 'absent'}
                              onChange={() => handleStatusChange(student.uid, 'absent')}
                              style={{
                                transform: 'scale(1.3)',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Radio
                              checked={attendance[student.uid] === 'late'}
                              onChange={() => handleStatusChange(student.uid, 'late')}
                              style={{
                                transform: 'scale(1.3)',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Radio
                              checked={attendance[student.uid] === 'excused'}
                              onChange={() => handleStatusChange(student.uid, 'excused')}
                              style={{
                                transform: 'scale(1.3)',
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px', minWidth: '200px' }}>
                            {attendance[student.uid] && (
                              <Input
                                placeholder="ملاحظات"
                                value={notes[student.uid] || ''}
                                onChange={(e) => handleNoteChange(student.uid, e.target.value)}
                                size="middle"
                                style={{ fontSize: '13px' }}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Card-based Layout */}
                <div style={{ display: isMobile ? 'block' : 'none', padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredStudents.map((student) => (
                      <Card 
                        key={student.uid}
                        size="small"
                        style={{ 
                          background: attendance[student.uid] ? '#f9fafb' : 'white',
                          border: attendance[student.uid] ? '1px solid #e5e7eb' : '1px solid #e5e7eb'
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {/* Student Info */}
                          <Space align="center" style={{ width: '100%' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: '#dbeafe',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              flexShrink: 0
                            }}>
                              {student.name.charAt(0)}
                            </div>
                            <Space direction="vertical" size={2} style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: '15px' }}>{student.name}</Text>
                              <Text type="secondary" style={{ fontSize: '13px' }}>{student.class}</Text>
                            </Space>
                          </Space>

                          {/* Status Badge */}
                          {attendance[student.uid] && (
                            <div style={{ textAlign: 'center', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                              {attendance[student.uid] === 'present' && (
                                <Badge status="success" text="حاضر" style={{ fontSize: '14px' }} />
                              )}
                              {attendance[student.uid] === 'absent' && (
                                <Badge status="error" text="غائب" style={{ fontSize: '14px' }} />
                              )}
                              {attendance[student.uid] === 'late' && (
                                <Badge status="warning" text="متأخر" style={{ fontSize: '14px' }} />
                              )}
                              {attendance[student.uid] === 'excused' && (
                                <Badge status="processing" text="بعذر" style={{ fontSize: '14px' }} />
                              )}
                            </div>
                          )}

                          {/* Radio Buttons Grid */}
                          <Row gutter={[8, 8]} style={{ width: '100%' }}>
                            <Col span={12}>
                              <Button
                                type={attendance[student.uid] === 'present' ? 'primary' : 'default'}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleStatusChange(student.uid, 'present')}
                                block
                                size="large"
                                style={{
                                  background: attendance[student.uid] === 'present' ? '#16a34a' : 'white',
                                  borderColor: attendance[student.uid] === 'present' ? '#16a34a' : '#d9d9d9',
                                  color: attendance[student.uid] === 'present' ? 'white' : '#000',
                                  height: '44px',
                                  fontSize: '14px'
                                }}
                              >
                                حاضر
                              </Button>
                            </Col>
                            <Col span={12}>
                              <Button
                                type={attendance[student.uid] === 'absent' ? 'primary' : 'default'}
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleStatusChange(student.uid, 'absent')}
                                block
                                size="large"
                                danger={attendance[student.uid] === 'absent'}
                                style={{
                                  background: attendance[student.uid] === 'absent' ? '#dc2626' : 'white',
                                  borderColor: attendance[student.uid] === 'absent' ? '#dc2626' : '#d9d9d9',
                                  color: attendance[student.uid] === 'absent' ? 'white' : '#000',
                                  height: '44px',
                                  fontSize: '14px'
                                }}
                              >
                                غائب
                              </Button>
                            </Col>
                            <Col span={12}>
                              <Button
                                type={attendance[student.uid] === 'late' ? 'primary' : 'default'}
                                icon={<ClockCircleOutlined />}
                                onClick={() => handleStatusChange(student.uid, 'late')}
                                block
                                size="large"
                                style={{
                                  background: attendance[student.uid] === 'late' ? '#ca8a04' : 'white',
                                  borderColor: attendance[student.uid] === 'late' ? '#ca8a04' : '#d9d9d9',
                                  color: attendance[student.uid] === 'late' ? 'white' : '#000',
                                  height: '44px',
                                  fontSize: '14px'
                                }}
                              >
                                متأخر
                              </Button>
                            </Col>
                            <Col span={12}>
                              <Button
                                type={attendance[student.uid] === 'excused' ? 'primary' : 'default'}
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => handleStatusChange(student.uid, 'excused')}
                                block
                                size="large"
                                style={{
                                  background: attendance[student.uid] === 'excused' ? '#2563eb' : 'white',
                                  borderColor: attendance[student.uid] === 'excused' ? '#2563eb' : '#d9d9d9',
                                  color: attendance[student.uid] === 'excused' ? 'white' : '#000',
                                  height: '44px',
                                  fontSize: '14px'
                                }}
                              >
                                بعذر
                              </Button>
                            </Col>
                          </Row>

                          {/* Notes Input */}
                          {attendance[student.uid] && (
                            <Input.TextArea
                              placeholder="ملاحظات (اختياري)"
                              value={notes[student.uid] || ''}
                              onChange={(e) => handleNoteChange(student.uid, e.target.value)}
                              rows={2}
                              style={{ fontSize: '14px', marginTop: '8px' }}
                            />
                          )}
                        </Space>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
