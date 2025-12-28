'use client';

import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect, useState } from 'react';

export default function DebugTeachersPage() {
  const { user } = useAuth();
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugData = async () => {
      if (!user?.uid) {
        setDebug({ error: 'No user UID' });
        setLoading(false);
        return;
      }

      try {
        const result: any = {
          step1_userUid: user.uid,
          step2_studentData: null,
          step3_teacherIds: [],
          step4_allTeachers: [],
          step5_teacherDocuments: [],
          step6_matchingTeachers: [],
          step7_subscriptions: [],
        };

        // Step 1: Get student data
        const usersRef = collection(db, 'users');
        const studentQuery = query(usersRef, where('uid', '==', user.uid));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (!studentSnapshot.empty) {
          const studentData = studentSnapshot.docs[0].data();
          result.step2_studentData = studentData;
          result.step3_teacherIds = studentData.teacherIds || [];

          // Step 2: Get all teachers
          const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
          const teachersSnapshot = await getDocs(teachersQuery);
          
          result.step4_allTeachers = teachersSnapshot.docs.map(doc => ({
            docId: doc.id,
            uid: doc.data().uid,
            name: doc.data().name,
            email: doc.data().email,
          }));

          // Step 3: Check each teacher document directly
          for (const teacherId of result.step3_teacherIds) {
            const teacherDoc = await getDoc(doc(db, 'users', teacherId));
            result.step5_teacherDocuments.push({
              teacherId: teacherId,
              exists: teacherDoc.exists(),
              data: teacherDoc.exists() ? teacherDoc.data() : null,
            });
          }

          // Step 4: Filter matching teachers
          result.step6_matchingTeachers = result.step4_allTeachers.filter((t: any) => 
            result.step3_teacherIds.includes(t.uid) || result.step3_teacherIds.includes(t.docId)
          );

          // Step 5: Get subscriptions
          const subsQuery = query(
            collection(db, 'pendingSubscriptions'),
            where('studentUid', '==', user.uid)
          );
          const subsSnapshot = await getDocs(subsQuery);
          result.step7_subscriptions = subsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        }

        setDebug(result);
      } catch (error: any) {
        setDebug({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    debugData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">🐛 فحص متقدم - صفحة المعلمين</h1>

        {/* Step 1 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-blue-600">1️⃣ معرف الطالب (User UID)</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step1_userUid, null, 2)}
          </pre>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-green-600">2️⃣ بيانات الطالب من Firestore</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step2_studentData, null, 2)}
          </pre>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-purple-600">
            3️⃣ teacherIds من بيانات الطالب
            {debug.step3_teacherIds?.length > 0 && (
              <span className="text-sm font-normal text-green-600 mr-2">
                ✅ {debug.step3_teacherIds.length} معلم
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step3_teacherIds, null, 2)}
          </pre>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-orange-600">
            4️⃣ جميع المعلمين في النظام (role = teacher)
            {debug.step4_allTeachers?.length > 0 && (
              <span className="text-sm font-normal text-green-600 mr-2">
                ✅ {debug.step4_allTeachers.length} معلم
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step4_allTeachers, null, 2)}
          </pre>
        </div>

        {/* Step 5 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">5️⃣ فحص مستندات المعلمين مباشرة</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step5_teacherDocuments, null, 2)}
          </pre>
        </div>

        {/* Step 6 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-pink-600">
            6️⃣ المعلمين المطابقين (Filtered)
            {debug.step6_matchingTeachers?.length > 0 ? (
              <span className="text-sm font-normal text-green-600 mr-2">
                ✅ {debug.step6_matchingTeachers.length} معلم
              </span>
            ) : (
              <span className="text-sm font-normal text-red-600 mr-2">
                ❌ لا يوجد مطابقات
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step6_matchingTeachers, null, 2)}
          </pre>
        </div>

        {/* Step 7 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-indigo-600">
            7️⃣ الاشتراكات (pendingSubscriptions)
            {debug.step7_subscriptions?.length > 0 && (
              <span className="text-sm font-normal text-green-600 mr-2">
                ✅ {debug.step7_subscriptions.length} اشتراك
              </span>
            )}
          </h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug.step7_subscriptions, null, 2)}
          </pre>
        </div>

        {/* Diagnosis */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">🔍 التحليل</h2>
          <div className="space-y-2 text-sm">
            {!debug.step3_teacherIds || debug.step3_teacherIds.length === 0 ? (
              <div className="text-red-600 font-bold">❌ الطالب ليس لديه teacherIds</div>
            ) : (
              <div className="text-green-600">✅ الطالب لديه {debug.step3_teacherIds.length} teacherIds</div>
            )}

            {debug.step4_allTeachers?.length === 0 ? (
              <div className="text-red-600 font-bold">❌ لا يوجد معلمين في النظام</div>
            ) : (
              <div className="text-green-600">✅ يوجد {debug.step4_allTeachers?.length} معلم في النظام</div>
            )}

            {debug.step5_teacherDocuments?.some((t: any) => !t.exists) && (
              <div className="text-red-600 font-bold">
                ❌ بعض المعلمين المذكورين في teacherIds غير موجودين في قاعدة البيانات
              </div>
            )}

            {debug.step6_matchingTeachers?.length === 0 && debug.step3_teacherIds?.length > 0 && (
              <div className="text-red-600 font-bold">
                ❌ المشكلة: teacherIds لا تطابق uid أو docId للمعلمين
                <div className="mt-2 text-xs">
                  <div>teacherIds: {JSON.stringify(debug.step3_teacherIds)}</div>
                  <div>المعلمين المتاحين (uid): {JSON.stringify(debug.step4_allTeachers?.map((t: any) => t.uid))}</div>
                  <div>المعلمين المتاحين (docId): {JSON.stringify(debug.step4_allTeachers?.map((t: any) => t.docId))}</div>
                </div>
              </div>
            )}

            {debug.step6_matchingTeachers?.length > 0 && (
              <div className="text-green-600 font-bold">
                ✅ تم العثور على {debug.step6_matchingTeachers.length} معلم مطابق
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/dashboard/student/teachers" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة لصفحة المعلمين
          </a>
        </div>
      </div>
    </div>
  );
}
