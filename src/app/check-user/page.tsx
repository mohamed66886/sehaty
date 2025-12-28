'use client';

import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect, useState } from 'react';

export default function CheckUserPage() {
  const { user, firebaseUser } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const studentQuery = query(usersRef, where('uid', '==', user.uid));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (!studentSnapshot.empty) {
          setStudentData(studentSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🔍 فحص بيانات المستخدم</h1>

        {/* Auth Context User */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">📱 بيانات AuthContext (user)</h2>
          {user ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>✅ المستخدم موجود:</strong> نعم</div>
              <div><strong>UID:</strong> {user.uid || '❌ غير موجود'}</div>
              <div><strong>الاسم:</strong> {user.name || '❌ غير موجود'}</div>
              <div><strong>البريد:</strong> {user.email || '❌ غير موجود'}</div>
              <div><strong>الدور:</strong> {user.role || '❌ غير موجود'}</div>
              <div><strong>الموبايل:</strong> {user.phone || '❌ غير موجود'}</div>
              <div className="mt-4">
                <strong>الكائن الكامل:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 overflow-x-auto text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-bold">❌ user غير موجود (null)</div>
          )}
        </div>

        {/* Firebase User */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-green-600">🔥 بيانات Firebase Auth (firebaseUser)</h2>
          {firebaseUser ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>✅ المستخدم موجود:</strong> نعم</div>
              <div><strong>UID:</strong> {firebaseUser.uid || '❌ غير موجود'}</div>
              <div><strong>البريد:</strong> {firebaseUser.email || '❌ غير موجود'}</div>
              <div><strong>Email Verified:</strong> {firebaseUser.emailVerified ? '✅ نعم' : '❌ لا'}</div>
            </div>
          ) : (
            <div className="text-red-600 font-bold">❌ firebaseUser غير موجود (null)</div>
          )}
        </div>

        {/* Firestore Student Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-purple-600">💾 بيانات Firestore (users collection)</h2>
          {studentData ? (
            <div className="space-y-2 font-mono text-sm">
              <div><strong>✅ البيانات موجودة:</strong> نعم</div>
              <div><strong>UID:</strong> {studentData.uid || '❌ غير موجود'}</div>
              <div><strong>الاسم:</strong> {studentData.name || '❌ غير موجود'}</div>
              <div><strong>البريد:</strong> {studentData.email || '❌ غير موجود'}</div>
              <div><strong>الدور:</strong> {studentData.role || '❌ غير موجود'}</div>
              <div><strong>الصف:</strong> {studentData.class || '❌ غير موجود'}</div>
              <div className={`font-bold ${studentData.teacherIds && studentData.teacherIds.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <strong>teacherIds:</strong> {
                  studentData.teacherIds && studentData.teacherIds.length > 0 
                    ? `✅ موجود (${studentData.teacherIds.length} معلم)` 
                    : '❌ غير موجود أو فارغ'
                }
              </div>
              {studentData.teacherIds && studentData.teacherIds.length > 0 && (
                <div className="mr-4">
                  {studentData.teacherIds.map((id: string, index: number) => (
                    <div key={index}>• {id}</div>
                  ))}
                </div>
              )}
              <div><strong>parentId:</strong> {studentData.parentId || '❌ غير موجود'}</div>
              <div className="mt-4">
                <strong>الكائن الكامل:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 overflow-x-auto text-xs">
                  {JSON.stringify(studentData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-bold">❌ لا توجد بيانات في Firestore</div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">🔧 التشخيص</h2>
          <div className="space-y-2">
            {!user && <div className="text-red-600">❌ المستخدم غير موجود في AuthContext</div>}
            {user && !user.uid && <div className="text-red-600">❌ الـ UID غير موجود في user object</div>}
            {user && user.role !== 'student' && (
              <div className="text-red-600">❌ الدور ليس &quot;student&quot; بل &quot;{user.role}&quot;</div>
            )}
            {!studentData && user?.uid && (
              <div className="text-red-600">❌ بيانات الطالب غير موجودة في Firestore</div>
            )}
            {studentData && (!studentData.teacherIds || studentData.teacherIds.length === 0) && (
              <div className="text-red-600">❌ الطالب ليس لديه معلمين (teacherIds فارغ)</div>
            )}
            {user && user.uid && user.role === 'student' && studentData && studentData.teacherIds && studentData.teacherIds.length > 0 && (
              <div className="text-green-600 font-bold">✅ كل شيء صحيح! يجب أن تعمل صفحة المعلمين</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/dashboard/student/teachers" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            الذهاب لصفحة المعلمين
          </a>
        </div>
      </div>
    </div>
  );
}
