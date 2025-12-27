'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
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
  Badge
} from 'antd';
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons';
import arEG from 'antd/locale/ar_EG';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!user?.uid) return;

    try {
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

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }));
  };

  const saveAttendance = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const attendanceRef = collection(db, 'attendance');
      const date = new Date(selectedDate);

      for (const student of students) {
        if (attendance[student.uid]) {
          await addDoc(attendanceRef, {
            studentId: student.uid,
            teacherId: user.uid,
            date: Timestamp.fromDate(date),
            status: attendance[student.uid],
            notes: notes[student.uid] || '',
            createdAt: Timestamp.now(),
          });
        }
      }

      message.success('تم حفظ الحضور بنجاح');
    } catch (error) {
      console.error('Error saving attendance:', error);
      message.error('حدث خطأ أثناء حفظ الحضور');
    } finally {
      setSaving(false);
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
                    <CheckCircleOutlined style={{ fontSize: 'clamp(24px, 5vw, 32px)' }} />
                    تسجيل الحضور
                  </Title>
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
                  disabled={Object.keys(attendance).length === 0}
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
            <Space style={{ width: '100%' }} size="middle">
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

          {/* Stats */}
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

          {/* Attendance List */}
          <Card 
            title={
              <Space>
                <UserOutlined />
                <Text strong>قائمة الطلاب ({students.length})</Text>
              </Space>
            }
            styles={{ body: { padding: '16px' } }}
          >
            {students.length === 0 ? (
              <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">لا يوجد طلاب</Text>
              </Space>
            ) : (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {students.map((student) => (
                  <Card
                    key={student.uid}
                    size="small"
                    styles={{ body: { padding: '12px' } }}
                    style={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: attendance[student.uid] ? '#f9fafb' : 'white'
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {/* Student Info */}
                      <Row justify="space-between" align="middle">
                        <Col>
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
                            <div>
                              <Text strong style={{ fontSize: '15px' }}>{student.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>{student.class}</Text>
                            </div>
                          </Space>
                        </Col>
                        <Col>
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
                        </Col>
                      </Row>

                      {/* Status Buttons */}
                      <Radio.Group
                        value={attendance[student.uid]}
                        onChange={(e) => handleStatusChange(student.uid, e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <Row gutter={[8, 8]}>
                          <Col xs={12} sm={6}>
                            <Radio.Button
                              value="present"
                              style={{
                                width: '100%',
                                textAlign: 'center',
                                height: '40px',
                                lineHeight: '40px',
                                background: attendance[student.uid] === 'present' ? '#16a34a' : '#f0fdf4',
                                color: attendance[student.uid] === 'present' ? 'white' : '#16a34a',
                                border: 'none',
                                fontWeight: '500'
                              }}
                            >
                              حاضر
                            </Radio.Button>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Radio.Button
                              value="absent"
                              style={{
                                width: '100%',
                                textAlign: 'center',
                                height: '40px',
                                lineHeight: '40px',
                                background: attendance[student.uid] === 'absent' ? '#dc2626' : '#fef2f2',
                                color: attendance[student.uid] === 'absent' ? 'white' : '#dc2626',
                                border: 'none',
                                fontWeight: '500'
                              }}
                            >
                              غائب
                            </Radio.Button>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Radio.Button
                              value="late"
                              style={{
                                width: '100%',
                                textAlign: 'center',
                                height: '40px',
                                lineHeight: '40px',
                                background: attendance[student.uid] === 'late' ? '#ca8a04' : '#fefce8',
                                color: attendance[student.uid] === 'late' ? 'white' : '#ca8a04',
                                border: 'none',
                                fontWeight: '500'
                              }}
                            >
                              متأخر
                            </Radio.Button>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Radio.Button
                              value="excused"
                              style={{
                                width: '100%',
                                textAlign: 'center',
                                height: '40px',
                                lineHeight: '40px',
                                background: attendance[student.uid] === 'excused' ? '#2563eb' : '#eff6ff',
                                color: attendance[student.uid] === 'excused' ? 'white' : '#2563eb',
                                border: 'none',
                                fontWeight: '500'
                              }}
                            >
                              بعذر
                            </Radio.Button>
                          </Col>
                        </Row>
                      </Radio.Group>

                      {/* Notes */}
                      {attendance[student.uid] && (
                        <Input
                          placeholder="ملاحظات (اختياري)"
                          value={notes[student.uid] || ''}
                          onChange={(e) => handleNoteChange(student.uid, e.target.value)}
                          size="large"
                          style={{ fontSize: '13px' }}
                        />
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            )}
          </Card>
        </Space>
      </DashboardLayout>
    </ConfigProvider>
  );
}
