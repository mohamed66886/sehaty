# نظام الاشتراك - Subscription System

## نظرة عامة
تم إضافة نظام اشتراك كامل يسمح للطلاب بالاشتراك مع المدرسين في الصفوف المختلفة.

## تدفق الاشتراك (Subscription Flow)

### 1. صفحة المدرسين (Teachers Landing Page)
- **المسار**: `/` (الصفحة الرئيسية - قسم المدرسين)
- **الملف**: `src/components/landing/Teachers.tsx`
- **الوظيفة**: عرض قائمة المدرسين مع إمكانية البحث
- **الإضافات الجديدة**:
  - زر "عرض التفاصيل والاشتراك" في كل كارت مدرس
  - يوجه المستخدم إلى صفحة تفاصيل المدرس

### 2. صفحة تفاصيل المدرس (Teacher Details Page)
- **المسار**: `/teacher/[id]`
- **الملف**: `src/app/teacher/[id]/page.tsx`
- **الوظيفة**: عرض تفاصيل المدرس والصفوف المتاحة
- **المحتوى**:
  - صورة وبيانات المدرس
  - الإحصائيات (التقييم، عدد الطلاب، الصفوف، الخبرة)
  - المؤهلات والخبرات
  - قائمة الصفوف المتاحة مع التفاصيل:
    - اسم الصف
    - المادة
    - المواعيد
    - المدة
    - السعر
    - عدد الطلاب المتاح/الحد الأقصى
    - زر الاشتراك (أو "الصف مكتمل" إذا امتلأ)

### 3. صفحة الاشتراك (Subscribe Page)
- **المسار**: `/subscribe?teacherId=[id]&classId=[id]`
- **الملف**: `src/app/subscribe/page.tsx`
- **الوظيفة**: نموذج تسجيل الطالب وإنشاء الحساب
- **المحتوى**:
  - **الجانب الأيسر**: ملخص الاشتراك (المدرس، الصف، السعر)
  - **الجانب الأيمن**: نموذج البيانات:
    - الاسم الكامل (مطلوب، 3 أحرف على الأقل)
    - البريد الإلكتروني (مطلوب، تحقق من الصيغة)
    - رقم الموبايل (مطلوب، يبدأ بـ 01 و 11 رقم)
    - كلمة المرور (مطلوبة، 6 أحرف على الأقل)
    - تأكيد كلمة المرور (مطلوب، يطابق كلمة المرور)
- **العملية**:
  1. التحقق من صحة البيانات
  2. إنشاء حساب Firebase Auth
  3. إرسال رسالة تأكيد البريد الإلكتروني
  4. حفظ بيانات الاشتراك في `pendingSubscriptions` collection
  5. التوجيه إلى صفحة تأكيد البريد

### 4. صفحة تأكيد البريد الإلكتروني (Email Verification Page)
- **المسار**: `/verify-email?email=[email]`
- **الملف**: `src/app/verify-email/page.tsx`
- **الوظيفة**: إرشاد المستخدم لتأكيد بريده الإلكتروني
- **المحتوى**:
  - أيقونة البريد
  - عنوان واضح
  - البريد الإلكتروني المرسل إليه
  - الخطوات المطلوبة (4 خطوات)
  - زر "تحقق من التأكيد"
  - زر "إعادة إرسال رسالة التأكيد" (مع عداد 60 ثانية)
  - رسائل النجاح/الخطأ
- **الميزات**:
  - التحقق التلقائي من حالة البريد
  - إعادة إرسال رسالة التأكيد
  - عداد تنازلي لمنع الإرسال المتكرر
  - تحديث حالة الاشتراك عند التأكيد
  - التوجيه التلقائي لصفحة النجاح

### 5. صفحة النجاح (Success Page)
- **المسار**: `/subscribe/success`
- **الملف**: `src/app/subscribe/success/page.tsx`
- **الوظيفة**: تأكيد نجاح الاشتراك وشرح الخطوات القادمة
- **المحتوى**:
  - أيقونة النجاح مع رسالة مبروك
  - تفاصيل الاشتراك (الاسم، المدرس، الصف، الحالة)
  - الخطوات القادمة:
    1. المراجعة من المدرس
    2. التواصل مع الطالب
    3. تفعيل الحساب
  - معلومات الاتصال (البريد والموبايل)
  - ملاحظة مهمة للمتابعة
  - أزرار:
    - الذهاب لتسجيل الدخول
    - تسجيل الخروج
    - العودة للصفحة الرئيسية

## قاعدة البيانات (Database Structure)

### مجموعة: `pendingSubscriptions`
```typescript
{
  studentUid: string;         // UID من Firebase Auth
  studentName: string;        // الاسم الكامل
  studentEmail: string;       // البريد الإلكتروني
  studentPhone: string;       // رقم الموبايل
  teacherId: string;          // UID المدرس
  teacherName: string;        // اسم المدرس
  classId: string;            // معرف الصف
  className: string;          // اسم الصف
  status: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;     // حالة تأكيد البريد
  emailVerifiedAt?: Date;     // تاريخ التأكيد
  createdAt: Timestamp;       // تاريخ الإنشاء
  reviewedAt?: Date;          // تاريخ المراجعة
  reviewedBy?: string;        // من راجع الطلب
  rejectionReason?: string;   // سبب الرفض (إن وجد)
}
```

## الأنواع المضافة (New Types)

### في `src/types/index.ts`:
- `PendingSubscription`: نوع بيانات الاشتراك المعلق
- `Class`: نوع بيانات الصف

## الأيقونات المضافة (New Icons)

### في `src/components/icons/Icons.tsx`:
- `UserIcon`: أيقونة المستخدم
- `MailIcon`: أيقونة البريد
- `ClockIcon`: أيقونة الساعة
- `AlertIcon`: أيقونة التنبيه

## الصفحات المنشأة (Created Pages)

1. ✅ `/teacher/[id]/page.tsx` - صفحة تفاصيل المدرس
2. ✅ `/subscribe/page.tsx` - صفحة الاشتراك
3. ✅ `/verify-email/page.tsx` - صفحة تأكيد البريد
4. ✅ `/subscribe/success/page.tsx` - صفحة النجاح

## الملفات المعدلة (Modified Files)

1. ✅ `src/components/landing/Teachers.tsx` - إضافة زر الاشتراك
2. ✅ `src/types/index.ts` - إضافة الأنواع الجديدة
3. ✅ `src/components/icons/Icons.tsx` - إضافة الأيقونات الجديدة

## التحقق من البيانات (Validation)

### نموذج الاشتراك:
- **الاسم**: مطلوب، 3 أحرف على الأقل
- **البريد**: مطلوب، تحقق من صيغة البريد الإلكتروني
- **الموبايل**: مطلوب، يبدأ بـ 01 ويحتوي على 11 رقم
- **كلمة المرور**: مطلوبة، 6 أحرف على الأقل
- **تأكيد كلمة المرور**: مطلوب، يطابق كلمة المرور

## معالجة الأخطاء (Error Handling)

### أخطاء Firebase Auth:
- `auth/email-already-in-use`: البريد مستخدم بالفعل
- `auth/weak-password`: كلمة المرور ضعيفة
- `auth/too-many-requests`: طلبات كثيرة جداً

### رسائل الأخطاء بالعربية:
جميع رسائل الأخطاء معروضة بالعربية مع شرح واضح

## الميزات الإضافية (Additional Features)

1. **البحث في المدرسين**: إمكانية البحث بالاسم أو المادة
2. **تصميم متجاوب**: يعمل على جميع أحجام الشاشات
3. **رسوم متحركة**: تأثيرات بصرية جميلة
4. **Loading States**: حالات التحميل واضحة
5. **رسائل النجاح والخطأ**: feedback واضح للمستخدم

## الخطوات القادمة للتطوير (Future Development)

1. **لوحة تحكم المدرس**: صفحة لمراجعة طلبات الاشتراك
2. **إشعارات**: إشعارات للمدرس عند طلب اشتراك جديد
3. **الدفع**: إضافة نظام الدفع الإلكتروني
4. **التقويم**: عرض مواعيد الصفوف في تقويم
5. **الرسائل**: نظام رسائل بين المدرس والطالب
6. **التقارير**: تقارير شاملة عن الاشتراكات

## ملاحظات الأمان (Security Notes)

1. **Firebase Auth**: استخدام نظام مصادقة آمن
2. **Email Verification**: التأكد من البريد الإلكتروني
3. **Firestore Rules**: يجب إضافة قواعد الأمان في `firestore.rules`
4. **Password**: الحد الأدنى 6 أحرف (يمكن زيادته)

## قواعد Firestore المطلوبة (Required Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pending Subscriptions - يمكن للمستخدم قراءة وكتابة اشتراكه فقط
    match /pendingSubscriptions/{subscriptionId} {
      allow read: if request.auth != null && 
        (request.auth.uid == subscriptionId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
      
      allow create: if request.auth != null && 
        request.auth.uid == subscriptionId &&
        request.resource.data.studentUid == request.auth.uid;
      
      allow update: if request.auth != null && 
        (request.auth.uid == subscriptionId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'teacher']);
      
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
  }
}
```

## التشغيل والاختبار (Running and Testing)

1. تأكد من تشغيل Firebase في المشروع
2. شغل السيرفر: `npm run dev`
3. افتح الصفحة الرئيسية
4. اذهب لقسم المدرسين
5. اضغط على "عرض التفاصيل والاشتراك"
6. اختر صف واضغط "اشترك الآن"
7. املأ البيانات واضغط "تأكيد الاشتراك"
8. تابع عملية التأكيد

## الدعم والمساعدة (Support)

للمزيد من المعلومات أو المساعدة، راجع:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- ملفات المشروع الأخرى: `PROJECT_SUMMARY.md`, `START_HERE.md`
