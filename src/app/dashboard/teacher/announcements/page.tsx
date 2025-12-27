'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Megaphone, Plus, Calendar, Eye, Edit, Trash2, Users, X, Filter, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TeacherAnnouncementsPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    target: 'جميع الصفوف',
    priority: 'normal'
  });
  const [editMode, setEditMode] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Example announcements data
  interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
    target: string;
    views: number;
    priority: string;
    status: string;
    createdAt: string;
  }

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: 'تأجيل امتحان الرياضيات',
      content: 'تم تأجيل امتحان الرياضيات للصف الأول الثانوي من يوم الأحد إلى يوم الثلاثاء القادم. يرجى مراجعة الجدول الزمني الجديد على المنصة.',
      date: '2024-12-20',
      target: 'الصف الأول الثانوي',
      views: 45,
      priority: 'high',
      status: 'active',
      createdAt: '2024-12-19T10:30:00'
    },
    {
      id: 2,
      title: 'واجب جديد في الجبر',
      content: 'تم إضافة واجب جديد عن الجبر، يرجى تسليمه قبل نهاية الأسبوع. يمكن العثور على التفاصيل في قسم الواجبات.',
      date: '2024-12-18',
      target: 'جميع الصفوف',
      views: 78,
      priority: 'medium',
      status: 'active',
      createdAt: '2024-12-17T14:20:00'
    },
    {
      id: 3,
      title: 'مراجعة شاملة قبل الامتحانات',
      content: 'سيتم عقد حصة مراجعة شاملة يوم الخميس القادم الساعة 2 مساءً. سيتم التركيز على النقاط الصعبة في المنهج.',
      date: '2024-12-15',
      target: 'الصف الثالث الثانوي',
      views: 52,
      priority: 'high',
      status: 'active',
      createdAt: '2024-12-14T09:15:00'
    },
    {
      id: 4,
      title: 'تحديث المنصة التعليمية',
      content: 'تمت إضافة ميزات جديدة للمنصة التعليمية تشمل نظام تنبيهات محسن وإمكانية رفع ملفات أكبر.',
      date: '2024-12-10',
      target: 'جميع الصفوف',
      views: 120,
      priority: 'medium',
      status: 'active',
      createdAt: '2024-12-09T11:45:00'
    },
  ]);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredAnnouncements = activeFilter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === activeFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (editMode) {
        // Update existing announcement
        setAnnouncements(prev => prev.map(a => 
          a.id === editMode ? { 
            ...a,
            ...newAnnouncement, 
            id: editMode, 
            views: a.views, 
            date: new Date().toISOString().split('T')[0],
            status: a.status,
            createdAt: a.createdAt
          } : a
        ));
        setEditMode(null);
      } else {
        // Add new announcement
        const newAnn = {
          ...newAnnouncement,
          id: announcements.length + 1,
          views: 0,
          date: new Date().toISOString().split('T')[0],
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setAnnouncements(prev => [newAnn, ...prev]);
      }
      
      setNewAnnouncement({
        title: '',
        content: '',
        target: 'جميع الصفوف',
        priority: 'normal'
      });
      setIsSubmitting(false);
      setShowNewModal(false);
    }, 800);
  };

  const handleEdit = (announcement: Announcement) => {
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      priority: announcement.priority
    });
    setEditMode(announcement.id);
    setShowNewModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowNewModal(false);
    setEditMode(null);
    setNewAnnouncement({
      title: '',
      content: '',
      target: 'جميع الصفوف',
      priority: 'normal'
    });
  };

  const getPriorityInfo = (priority: string) => {
    const info: Record<string, { label: string; color: string; bg: string; text: string; border: string }> = {
      high: { label: 'هام', color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      medium: { label: 'متوسط', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      normal: { label: 'عادي', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
    };
    return info[priority] || info.normal;
  };

  const totalViews = announcements.reduce((acc, a) => acc + a.views, 0);
  const averageViews = announcements.length > 0 ? Math.round(totalViews / announcements.length) : 0;
  const highPriorityCount = announcements.filter(a => a.priority === 'high').length;

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">الإعلانات والتنبيهات</h1>
              <p className="text-gray-600 mt-2">إدارة جميع الإعلانات والإشعارات المرسلة للطلاب</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium w-full md:w-auto"
            >
              <Plus size={20} />
              <span>إعلان جديد</span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              الكل ({announcements.length})
            </button>
            <button
              onClick={() => setActiveFilter('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeFilter === 'high' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <span>هام</span>
              <span className="text-xs">({highPriorityCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'medium' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              متوسط
            </button>
          </div>
        </div>

        {/* Statistics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm md:text-base mb-1">إجمالي الإعلانات</p>
                <p className="text-2xl md:text-3xl font-bold">{announcements.length}</p>
                <p className="text-blue-200 text-xs md:text-sm mt-2">+2 هذا الأسبوع</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Megaphone size={isMobile ? 28 : 32} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm md:text-base mb-1">إجمالي المشاهدات</p>
                <p className="text-2xl md:text-3xl font-bold">{totalViews}</p>
                <p className="text-emerald-200 text-xs md:text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +12% عن الشهر الماضي
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Eye size={isMobile ? 28 : 32} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm md:text-base mb-1">متوسط المشاهدات</p>
                <p className="text-2xl md:text-3xl font-bold">{averageViews}</p>
                <p className="text-amber-200 text-xs md:text-sm mt-2">لكل إعلان</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users size={isMobile ? 28 : 32} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 md:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm md:text-base mb-1">نشط حالياً</p>
                <p className="text-2xl md:text-3xl font-bold">{announcements.filter(a => a.status === 'active').length}</p>
                <p className="text-purple-200 text-xs md:text-sm mt-2 flex items-center gap-1">
                  <CheckCircle size={14} />
                  جميع الإعلانات نشطة
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock size={isMobile ? 28 : 32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4 md:space-y-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 md:p-12 text-center">
              <Megaphone size={isMobile ? 48 : 64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">لا توجد إعلانات</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter !== 'all' 
                  ? `لا توجد إعلانات ذات أولوية "${activeFilter === 'high' ? 'هام' : 'متوسط'}"`
                  : 'ابدأ بإنشاء إعلان جديد للطلاب'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-md"
              >
                إنشاء أول إعلان
              </button>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => {
              const priorityInfo = getPriorityInfo(announcement.priority);
              return (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Announcement Icon and Priority Badge */}
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${priorityInfo.bg}`}>
                          <Megaphone 
                            size={isMobile ? 22 : 26} 
                            className={priorityInfo.text} 
                          />
                        </div>
                        
                        {/* Announcement Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{announcement.title}</h3>
                            <span className={`self-start md:self-center px-3 py-1 ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border} text-xs font-medium rounded-full border`}>
                              {priorityInfo.label}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4 md:mb-5 line-clamp-2">{announcement.content}</p>
                          
                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Calendar size={14} className="text-gray-600" />
                              </div>
                              <span>{new Date(announcement.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Users size={14} className="text-gray-600" />
                              </div>
                              <span>{announcement.target}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-1.5 rounded-lg">
                                <Eye size={14} className="text-gray-600" />
                              </div>
                              <span>{announcement.views} مشاهدة</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 md:gap-3 mt-4 md:mt-0">
                        <button 
                          onClick={() => handleEdit(announcement)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                          {!isMobile && <span>تعديل</span>}
                        </button>
                        <button 
                          onClick={() => handleDelete(announcement.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                          {!isMobile && <span>حذف</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New/Edit Announcement Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 md:p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
              {/* Modal Header */}
              <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {editMode ? 'تعديل الإعلان' : 'إعلان جديد'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              
              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-5 md:p-6 space-y-5 md:space-y-6 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      عنوان الإعلان
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="أدخل عنوان الإعلان"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      محتوى الإعلان
                    </label>
                    <textarea
                      rows={5}
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="أدخل محتوى الإعلان بالتفصيل..."
                      required
                    />
                    <p className="text-gray-500 text-sm mt-2">يمكنك استخدام علامات التنسيق الأساسية</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        الفئة المستهدفة
                      </label>
                      <select 
                        value={newAnnouncement.target}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, target: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="جميع الصفوف">جميع الصفوف</option>
                        <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                        <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                        <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                        <option value="المجموعة العلمية">المجموعة العلمية</option>
                        <option value="المجموعة الأدبية">المجموعة الأدبية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        مستوى الأولوية
                      </label>
                      <select 
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="normal">عادي</option>
                        <option value="medium">متوسط</option>
                        <option value="high">هام</option>
                      </select>
                      <div className={`mt-2 p-3 rounded-lg ${getPriorityInfo(newAnnouncement.priority).bg} ${getPriorityInfo(newAnnouncement.priority).text} text-sm`}>
                        {newAnnouncement.priority === 'high' && 'سيظهر هذا الإعلان في أعلى قائمة الطلاب'}
                        {newAnnouncement.priority === 'medium' && 'سيتم تمييز هذا الإعلان بلون مختلف'}
                        {newAnnouncement.priority === 'normal' && 'سيظهر هذا الإعلان كإشعار عادي'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="p-5 md:p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري النشر...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone size={18} />
                        <span>{editMode ? 'تحديث الإعلان' : 'نشر الإعلان'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
}