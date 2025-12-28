'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  GraduationCap,
  Clock,
  Award,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

interface Exam {
  id: string;
  teacherId: string;
  title: string;
  classId: string; // معرف الصف
  className: string; // اسم الصف
  duration: number; // in minutes
  totalMarks: number;
  startDate: Date; // تاريخ ووقت البداية
  endDate: Date; // تاريخ ووقت النهاية
  questions: ExamQuestion[];
  createdAt: Date;
}

interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  marks: number;
}

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  isActive: boolean;
}

export default function TeacherExamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const fetchClasses = async () => {
    if (!user?.uid) return;

    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('teacherId', '==', user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClassItem[];

      setClasses(data.filter((c) => c.isActive));
    } catch (error) {
      console.error('خطأ في جلب الصفوف:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch exams for this teacher only
      const examsQuery = query(
        collection(db, 'exams'),
        orderBy('createdAt', 'desc')
      );
      const examsSnapshot = await getDocs(examsQuery);
      const examsData = examsSnapshot.docs
        .filter((doc) => doc.data().teacherId === user?.uid)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date(),
        })) as Exam[];
      setExams(examsData);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchData();
      fetchClasses();
    }
  }, [user, fetchData, fetchClasses]);

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      form.setFieldsValue({
        title: exam.title,
        classId: exam.classId,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        startDateTime: dayjs(exam.startDate),
        endDateTime: dayjs(exam.endDate),
      });
    } else {
      setEditingExam(null);
      const now = dayjs();
      const later = dayjs().add(2, 'hour');
      form.setFieldsValue({
        title: '',
        classId: undefined,
        duration: 60,
        totalMarks: 100,
        startDateTime: now,
        endDateTime: later,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (!user) return;

    // Validate dates
    const startDateTime = values.startDateTime.toDate();
    const endDateTime = values.endDateTime.toDate();

    if (endDateTime <= startDateTime) {
      Modal.error({
        title: 'خطأ',
        content: 'تاريخ ووقت النهاية يجب أن يكون بعد تاريخ ووقت البداية',
        okText: 'حسناً',
      });
      return;
    }

    setLoading(true);

    try {
      const selectedClass = classes.find((c) => c.id === values.classId);

      const examData = {
        teacherId: user.uid,
        title: values.title,
        classId: values.classId,
        className: selectedClass?.name || '',
        duration: values.duration,
        totalMarks: values.totalMarks,
        startDate: startDateTime,
        endDate: endDateTime,
      };

      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), examData);
      } else {
        await addDoc(collection(db, 'exams'), {
          ...examData,
          questions: [],
          createdAt: new Date(),
        });
      }

      await fetchData();
      handleCloseModal();

      Modal.success({
        title: 'نجح',
        content: editingExam
          ? 'تم تحديث الامتحان بنجاح'
          : 'تم إضافة الامتحان بنجاح',
        okText: 'حسناً',
      });
    } catch (error) {
      console.error('خطأ في حفظ الامتحان:', error);
      Modal.error({
        title: 'خطأ',
        content: 'فشل حفظ الامتحان. يرجى المحاولة مرة أخرى.',
        okText: 'حسناً',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا الامتحان؟ لا يمكن التراجع عن هذا الإجراء.',
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          await deleteDoc(doc(db, 'exams', examId));
          await fetchData();
          Modal.success({
            title: 'نجح',
            content: 'تم حذف الامتحان بنجاح',
            okText: 'حسناً',
          });
        } catch (error) {
          console.error('خطأ في حذف الامتحان:', error);
          Modal.error({
            title: 'خطأ',
            content: 'فشل حذف الامتحان. يرجى المحاولة مرة أخرى.',
            okText: 'حسناً',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || exam.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              إدارة الامتحانات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء وإدارة امتحاناتك
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة امتحان
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث في الامتحانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="input w-full"
            >
              <option value="">كل الصفوف</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterClass
                ? 'لا توجد امتحانات تطابق البحث'
                : 'لم يتم إنشاء أي امتحانات بعد'}
            </p>
            {!searchTerm && !filterClass && (
              <button
                onClick={() => handleOpenModal()}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إنشاء أول امتحان
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="card">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {exam.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      الصف: {exam.className}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      المدة: {exam.duration} دقيقة
                    </p>
                    <p className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      الدرجة الكلية: {exam.totalMarks}
                    </p>
                    <p className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      الأسئلة: {exam.questions?.length || 0}
                    </p>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs">
                        <strong>البداية:</strong>{' '}
                        {new Date(exam.startDate).toLocaleString('ar-EG')}
                      </p>
                      <p className="text-xs">
                        <strong>النهاية:</strong>{' '}
                        {new Date(exam.endDate).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/teacher/exams/${exam.id}`)
                    }
                    className="btn btn-primary flex-1 text-sm"
                  >
                    إدارة الأسئلة
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/teacher/exams/${exam.id}/results`)
                    }
                    className="btn btn-secondary flex items-center justify-center gap-1 px-3"
                    title="عرض النتائج"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(exam)}
                    className="btn btn-secondary flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={
          <span className="text-xl font-bold">
            {editingExam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
          </span>
        }
        open={showModal}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
        centered
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-6"
          initialValues={{
            duration: 60,
            totalMarks: 100,
          }}
        >
          <Form.Item
            name="title"
            label={<span className="font-semibold">اسم الامتحان</span>}
            rules={[{ required: true, message: 'يرجى إدخال اسم الامتحان' }]}
          >
            <Input
              size="large"
              placeholder="مثال: امتحان الرياضيات - الفصل الأول"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="classId"
            label={<span className="font-semibold">الصف</span>}
            rules={[{ required: true, message: 'يرجى اختيار الصف' }]}
          >
            <Select
              size="large"
              placeholder="اختر الصف"
              className="w-full"
              showSearch
              optionFilterProp="children"
              notFoundContent={
                classes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">لا توجد صفوف متاحة</p>
                    <Button
                      type="link"
                      onClick={() => {
                        handleCloseModal();
                        router.push('/dashboard/teacher/classes');
                      }}
                    >
                      إضافة صف جديد
                    </Button>
                  </div>
                ) : null
              }
            >
              {classes.map((classItem) => (
                <Select.Option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.subject}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label={<span className="font-semibold">المدة (دقيقة)</span>}
              rules={[{ required: true, message: 'يرجى إدخال المدة' }]}
            >
              <InputNumber
                size="large"
                min={1}
                className="w-full rounded-lg"
                placeholder="60"
              />
            </Form.Item>

            <Form.Item
              name="totalMarks"
              label={<span className="font-semibold">الدرجة الكلية</span>}
              rules={[{ required: true, message: 'يرجى إدخال الدرجة الكلية' }]}
            >
              <InputNumber
                size="large"
                min={1}
                className="w-full rounded-lg"
                placeholder="100"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="startDateTime"
            label={<span className="font-semibold">تاريخ ووقت البداية</span>}
            rules={[
              { required: true, message: 'يرجى اختيار تاريخ ووقت البداية' },
            ]}
          >
            <DatePicker
              size="large"
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full rounded-lg"
              placeholder="اختر التاريخ والوقت"
            />
          </Form.Item>

          <Form.Item
            name="endDateTime"
            label={<span className="font-semibold">تاريخ ووقت النهاية</span>}
            rules={[
              { required: true, message: 'يرجى اختيار تاريخ ووقت النهاية' },
            ]}
          >
            <DatePicker
              size="large"
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full rounded-lg"
              placeholder="اختر التاريخ والوقت"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button
                size="large"
                onClick={handleCloseModal}
                className="min-w-[100px]"
              >
                إلغاء
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="min-w-[100px] bg-primary-600 hover:bg-primary-700"
              >
                {editingExam ? 'تحديث' : 'إضافة'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
