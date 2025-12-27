# دليل الإعداد السريع - Hesaty Platform

## 📋 قبل البدء

تأكد من تثبيت:
- Node.js (v18 أو أحدث)
- npm أو yarn
- محرر نصوص (VS Code موصى به)

---

## 🚀 خطوات الإعداد

### 1️⃣ تثبيت الحزم

```bash
npm install
```

### 2️⃣ إعداد Firebase

#### أ. إنشاء مشروع Firebase

1. اذهب إلى: https://console.firebase.google.com/
2. اضغط "إضافة مشروع" (Add Project)
3. أدخل اسم المشروع: "Hesaty" أو أي اسم تريده
4. اضغط "متابعة" (Continue)
5. اختر إذا كنت تريد Google Analytics (اختياري)
6. اضغط "إنشاء المشروع" (Create Project)

#### ب. تفعيل Authentication

1. من القائمة الجانبية، اختر "Authentication"
2. اضغط "البدء" (Get Started)
3. اختر "Email/Password" من قائمة مزودي الخدمة
4. فعّل "Email/Password"
5. احفظ التغييرات

#### ج. إنشاء Firestore Database

1. من القائمة الجانبية، اختر "Firestore Database"
2. اضغط "إنشاء قاعدة بيانات" (Create Database)
3. اختر موقع قاعدة البيانات (أقرب موقع لك)
4. ابدأ في وضع الاختبار (Test Mode) - سنضبط القواعد لاحقاً
5. اضغط "تفعيل" (Enable)

#### د. إنشاء Storage

1. من القائمة الجانبية، اختر "Storage"
2. اضغط "البدء" (Get Started)
3. اختر موقع التخزين
4. اضغط "تم" (Done)

#### هـ. الحصول على بيانات الإعداد

1. اذهب إلى إعدادات المشروع (⚙️ > Project Settings)
2. في قسم "Your apps"، اختر "Web app" (أيقونة </>)
3. سجّل تطبيق جديد:
   - اسم التطبيق: "Hesaty Web"
   - اضغط "تسجيل التطبيق" (Register App)
4. انسخ بيانات `firebaseConfig`

### 3️⃣ إعداد ملف البيئة

1. انسخ ملف `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

2. افتح `.env.local` وضع بيانات Firebase التي نسختها:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### 4️⃣ رفع قواعد الأمان

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول إلى Firebase
firebase login

# تهيئة Firebase في المشروع
firebase init

# اختر:
# - Firestore
# - استخدم مشروع موجود (Use an existing project)
# - اختر المشروع الذي أنشأته
# - اقبل المسار الافتراضي لملف firestore.rules

# رفع القواعد
firebase deploy --only firestore:rules
```

### 5️⃣ تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

---

## 👤 إنشاء أول مستخدم (Super Admin)

لإنشاء أول مستخدم Super Admin، استخدم Firebase Console:

### الطريقة 1: عبر Firebase Console

1. اذهب إلى Firebase Console > Authentication
2. اضغط "Add User"
3. أدخل البريد الإلكتروني وكلمة المرور
4. احفظ المستخدم وانسخ UID

5. اذهب إلى Firestore Database
6. أنشئ مستند جديد في collection "users":
   - Document ID: استخدم UID الذي نسخته
   - الحقول:
     ```
     uid: "الـ UID الذي نسخته"
     name: "المسؤول الرئيسي"
     role: "super_admin"
     email: "admin@example.com"
     phone: "0123456789"
     createdAt: [Current timestamp]
     ```

### الطريقة 2: عبر كود مؤقت

أنشئ ملف `scripts/create-admin.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ضع بيانات Firebase هنا
const firebaseConfig = {
  // ... بيانات Firebase
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createSuperAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@example.com',
      'YourStrongPassword123!'
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: 'المسؤول الرئيسي',
      role: 'super_admin',
      email: 'admin@example.com',
      phone: '0123456789',
      createdAt: serverTimestamp(),
    });

    console.log('✅ تم إنشاء Super Admin بنجاح!');
    console.log('Email:', 'admin@example.com');
    console.log('UID:', userCredential.user.uid);
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

createSuperAdmin();
```

شغّل السكريبت:
```bash
npx ts-node scripts/create-admin.ts
```

---

## 📝 اختبار النظام

### 1. تسجيل الدخول كـ Super Admin

1. اذهب إلى: http://localhost:3000/login
2. سجّل دخول بحساب Super Admin
3. يجب أن تُحوّل تلقائياً إلى: `/dashboard/super-admin`

### 2. إنشاء ولي أمر

من لوحة تحكم Super Admin:
1. أنشئ مستخدم جديد بدور "parent"
2. سجّل البيانات في كل من:
   - `users` collection
   - `parents` collection

### 3. إنشاء معلم

1. أنشئ مستخدم جديد بدور "teacher"
2. سجّل البيانات في كل من:
   - `users` collection
   - `teachers` collection (مع subjects و centerId)

### 4. إنشاء طالب

**مهم:** الطالب يجب أن يرتبط بولي أمر ومعلم!

1. أنشئ مستخدم جديد بدور "student"
2. سجّل البيانات في كل من:
   - `users` collection
   - `students` collection مع:
     - `parentId`: UID ولي الأمر
     - `teacherIds`: مصفوفة تحتوي على UID معلم واحد على الأقل
3. سيتم تحديث:
   - `parents/{parentId}/studentIds` تلقائياً
   - `teachers/{teacherId}/studentIds` تلقائياً

---

## 🔍 استكشاف الأخطاء

### خطأ: "Cannot find module 'firebase'"
```bash
npm install
```

### خطأ: "process is not defined"
- تأكد من أن ملف `.env.local` موجود
- أعد تشغيل السيرفر

### خطأ: "Permission denied" في Firestore
- تأكد من رفع `firestore.rules`
- تحقق من دور المستخدم في قاعدة البيانات

### خطأ: "Student must have a parent"
- تأكد من أن `parentId` موجود
- تأكد من أن ولي الأمر موجود في قاعدة البيانات

### خطأ: "Firebase configuration error"
- تحقق من بيانات `.env.local`
- تأكد من صحة جميع المفاتيح

---

## 📦 البناء للإنتاج

```bash
# بناء المشروع
npm run build

# اختبار النسخة الإنتاجية محلياً
npm start
```

---

## 🚀 النشر

### Vercel (موصى به)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

### Firebase Hosting

```bash
# تهيئة Hosting
firebase init hosting

# بناء المشروع
npm run build

# النشر
firebase deploy --only hosting
```

---

## 📚 الخطوات التالية

1. ✅ أنشئ أول Super Admin
2. ✅ أنشئ بعض المستخدمين للاختبار
3. ✅ اختبر تسجيل الحضور
4. ✅ أنشئ واجب وامتحان
5. ✅ اختبر لوحات التحكم المختلفة

---

## 💡 نصائح

- احتفظ بنسخة احتياطية من بيانات Firebase
- استخدم Firebase Emulators للتطوير
- راجع قواعد الأمان بانتظام
- تابع Firebase usage limits
- اقرأ التوثيق الكامل في README.md

---

## 🆘 المساعدة

إذا واجهت مشكلة:
1. راجع قسم "استكشاف الأخطاء"
2. تحقق من console.log في المتصفح
3. راجع Firebase Console للأخطاء
4. افتح Issue على GitHub

---

**🎉 مبروك! جاهز للانطلاق!**
