'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Users, Clock, Calendar, DollarSign, X } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  duration: string;
  price: string;
  studentsCount: number;
  maxStudents: number;
  isActive: boolean;
  teacherId: string;
  createdAt: Date;
}

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    schedule: '',
    duration: '',
    price: '',
    maxStudents: 30,
    isActive: true,
  });

  useEffect(() => {
    if (user?.uid) {
      loadClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadClasses = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('teacherId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      })) as ClassItem[];

      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) return;

    try {
      if (editingClass) {
        // Update existing class
        const classRef = doc(db, 'classes', editingClass.id);
        await updateDoc(classRef, {
          ...formData,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Add new class
        await addDoc(collection(db, 'classes'), {
          ...formData,
          teacherId: user.uid,
          studentsCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Reset form and reload
      setFormData({
        name: '',
        subject: '',
        schedule: '',
        duration: '',
        price: '',
        maxStudents: 30,
        isActive: true,
      });
      setEditingClass(null);
      setShowAddModal(false);
      loadClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('حدث خطأ أثناء حفظ الصف');
    }
  };

  const handleEdit = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      subject: classItem.subject,
      schedule: classItem.schedule,
      duration: classItem.duration,
      price: classItem.price,
      maxStudents: classItem.maxStudents,
      isActive: classItem.isActive,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصف؟')) return;

    try {
      await deleteDoc(doc(db, 'classes', classId));
      loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('حدث خطأ أثناء حذف الصف');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingClass(null);
    setFormData({
      name: '',
      subject: '',
      schedule: '',
      duration: '',
      price: '',
      maxStudents: 30,
      isActive: true,
    });
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة الصفوف</h1>
            <p className="text-gray-600 mt-1">إدارة وتنظيم الصفوف الدراسية</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-md"
          >
            <Plus size={20} />
            <span>إضافة صف جديد</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الصفوف</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الصفوف النشطة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((sum, c) => sum + c.studentsCount, 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الأماكن المتاحة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((sum, c) => sum + (c.maxStudents - c.studentsCount), 0)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">قائمة الصفوف</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">اسم الصف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المادة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الموعد</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">المدة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">السعر</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الطلاب</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{classItem.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{classItem.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{classItem.schedule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>{classItem.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <DollarSign size={16} />
                        <span>{classItem.price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {classItem.studentsCount}/{classItem.maxStudents}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {classItem.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          مكتمل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(classItem)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(classItem.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingClass ? 'تعديل الصف' : 'إضافة صف جديد'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم الصف *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="مثال: الصف الأول الثانوي - المجموعة A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المادة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="مثال: الرياضيات"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الموعد *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="مثال: السبت والثلاثاء - 4:00 مساءً"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    مدة الحصة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="مثال: ساعتان"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    السعر الشهري *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="مثال: 300 جنيه/شهر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحد الأقصى للطلاب *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    الصف نشط ومتاح للاشتراك
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    {editingClass ? 'حفظ التعديلات' : 'إضافة الصف'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
