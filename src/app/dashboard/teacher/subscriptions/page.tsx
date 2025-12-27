'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PendingSubscription } from '@/types';
import { Check, X, Clock, User, Mail, Phone, BookOpen, Calendar } from 'lucide-react';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const loadSubscriptions = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const subsRef = collection(db, 'pendingSubscriptions');
      const q = query(subsRef, where('teacherId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as PendingSubscription[];

      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleApprove = async (subscriptionId: string) => {
    try {
      const subRef = doc(db, 'pendingSubscriptions', subscriptionId);
      await updateDoc(subRef, {
        status: 'approved',
        updatedAt: Timestamp.now(),
      });
      
      // تحديث القائمة المحلية
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'approved' as const, updatedAt: new Date() }
          : sub
      ));
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert('حدث خطأ أثناء الموافقة على الطلب');
    }
  };

  const handleReject = async (subscriptionId: string) => {
    const reason = prompt('اكتب سبب رفض الطلب (اختياري):');
    
    try {
      const subRef = doc(db, 'pendingSubscriptions', subscriptionId);
      await updateDoc(subRef, {
        status: 'rejected',
        rejectionReason: reason || 'لم يتم تحديد سبب',
        updatedAt: Timestamp.now(),
      });
      
      // تحديث القائمة المحلية
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'rejected' as const, updatedAt: new Date() }
          : sub
      ));
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  const approvedCount = subscriptions.filter(s => s.status === 'approved').length;
  const rejectedCount = subscriptions.filter(s => s.status === 'rejected').length;

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">طلبات الاشتراك</h1>
          <p className="text-gray-600 mt-1">مراجعة وإدارة طلبات الاشتراك من الطلاب</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <BookOpen className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">تمت الموافقة</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">تم الرفض</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل', count: subscriptions.length },
              { key: 'pending', label: 'قيد الانتظار', count: pendingCount },
              { key: 'approved', label: 'موافق عليها', count: approvedCount },
              { key: 'rejected', label: 'مرفوضة', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600">لم يتم العثور على طلبات اشتراك بهذا التصنيف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Student Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                      {subscription.studentName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{subscription.studentName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {subscription.status === 'pending' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={14} className="ml-1" />
                        قيد المراجعة
                      </span>
                    )}
                    {subscription.status === 'approved' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <Check size={14} className="ml-1" />
                        موافق عليه
                      </span>
                    )}
                    {subscription.status === 'rejected' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <X size={14} className="ml-1" />
                        مرفوض
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail size={16} className="text-gray-400" />
                      <span>{subscription.studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={16} className="text-gray-400" />
                      <span>{subscription.studentPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="font-semibold">{subscription.className}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className={subscription.emailVerified ? 'text-green-600 font-semibold' : 'text-red-600'}>
                        {subscription.emailVerified ? '✓ تم التحقق من البريد الإلكتروني' : '✗ لم يتم التحقق من البريد'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {subscription.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(subscription.id!)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <Check size={18} />
                      <span>موافقة</span>
                    </button>
                    <button
                      onClick={() => handleReject(subscription.id!)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <X size={18} />
                      <span>رفض</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
