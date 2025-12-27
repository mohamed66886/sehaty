# هيكل المشروع - Hesaty Platform

## 📁 Project Structure

```
حصتي/
│
├── .github/
│   └── copilot-instructions.md      # تعليمات GitHub Copilot
│
├── .vscode/
│   └── tasks.json                   # مهام VS Code
│
├── public/                          # ملفات عامة (صور، أيقونات)
│
├── scripts/
│   └── seed-data.ts                 # سكريبت لإضافة بيانات تجريبية
│
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── dashboard/               # لوحات التحكم
│   │   │   ├── super-admin/
│   │   │   │   ├── page.tsx        # لوحة تحكم المسؤول
│   │   │   │   ├── users/          # إدارة المستخدمين
│   │   │   │   ├── centers/        # إدارة المراكز
│   │   │   │   └── stats/          # الإحصائيات
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── page.tsx        # لوحة تحكم المعلم
│   │   │   │   ├── students/       # إدارة الطلاب
│   │   │   │   ├── attendance/     # تسجيل الحضور
│   │   │   │   ├── homework/       # إدارة الواجبات
│   │   │   │   └── exams/          # إدارة الامتحانات
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── page.tsx        # لوحة تحكم الطالب
│   │   │   │   ├── teachers/       # عرض المعلمين
│   │   │   │   ├── attendance/     # سجل الحضور
│   │   │   │   ├── homework/       # الواجبات
│   │   │   │   ├── exams/          # الامتحانات
│   │   │   │   └── results/        # النتائج
│   │   │   │
│   │   │   └── parent/
│   │   │       ├── page.tsx        # لوحة تحكم ولي الأمر
│   │   │       ├── children/       # متابعة الأبناء
│   │   │       ├── attendance/     # سجل الحضور
│   │   │       └── results/        # النتائج
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx            # صفحة تسجيل الدخول
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx            # صفحة التسجيل
│   │   │
│   │   ├── forgot-password/
│   │   │   └── page.tsx            # استرجاع كلمة المرور
│   │   │
│   │   ├── layout.tsx              # التخطيط الرئيسي
│   │   ├── page.tsx                # الصفحة الرئيسية
│   │   └── globals.css             # الأنماط العامة
│   │
│   ├── components/                  # مكونات React قابلة لإعادة الاستخدام
│   │   ├── DashboardLayout.tsx     # تخطيط لوحات التحكم
│   │   ├── Navigation.tsx          # القائمة الجانبية
│   │   ├── StatCard.tsx            # بطاقة إحصائيات
│   │   ├── LoadingSpinner.tsx      # مؤشر التحميل
│   │   └── ErrorMessage.tsx        # رسالة خطأ
│   │
│   ├── contexts/                    # React Contexts
│   │   └── AuthContext.tsx         # سياق المصادقة
│   │
│   ├── lib/                         # مكتبات مساعدة
│   │   └── firebase/
│   │       ├── config.ts           # إعداد Firebase
│   │       └── firestore.ts        # عمليات Firestore
│   │
│   └── types/                       # تعريفات TypeScript
│       └── index.ts                # جميع الأنواع
│
├── .env.example                     # مثال لملف البيئة
├── .env.local                       # ملف البيئة (غير مرفوع)
├── .eslintrc.json                   # إعدادات ESLint
├── .gitignore                       # ملفات Git المستثناة
├── CHANGELOG.md                     # سجل التغييرات
├── firebase.json                    # إعدادات Firebase
├── firestore.rules                  # قواعد أمان Firestore
├── next.config.js                   # إعدادات Next.js
├── package.json                     # تبعيات المشروع
├── postcss.config.js                # إعدادات PostCSS
├── README.md                        # التوثيق الرئيسي
├── SETUP.md                         # دليل الإعداد
├── tailwind.config.ts               # إعدادات Tailwind CSS
└── tsconfig.json                    # إعدادات TypeScript
```

---

## 📝 شرح المجلدات الرئيسية

### `/src/app` - صفحات التطبيق
يحتوي على جميع صفحات ومسارات التطبيق باستخدام Next.js 14 App Router.

**الميزات:**
- ✅ Server Components بشكل افتراضي
- ✅ Client Components حسب الحاجة
- ✅ Route Groups للتنظيم
- ✅ Dynamic Routes
- ✅ Loading و Error States

### `/src/components` - المكونات القابلة لإعادة الاستخدام
مكونات React مشتركة تُستخدم في أكثر من مكان.

**أمثلة:**
- DashboardLayout: تخطيط موحد لجميع لوحات التحكم
- StatCard: بطاقة عرض إحصائيات
- Navigation: القائمة الجانبية
- Forms: نماذج إدخال موحدة

### `/src/contexts` - React Contexts
إدارة الحالة العامة للتطبيق.

**Contexts:**
- AuthContext: إدارة المصادقة والمستخدم الحالي
- ThemeContext: إدارة السمات (مستقبلي)
- NotificationContext: إدارة الإشعارات (مستقبلي)

### `/src/lib/firebase` - Firebase Services
جميع العمليات المتعلقة بـ Firebase.

**الملفات:**
- `config.ts`: إعداد وتهيئة Firebase
- `firestore.ts`: عمليات قاعدة البيانات (CRUD)
- `auth.ts`: عمليات المصادقة (مستقبلي)
- `storage.ts`: عمليات التخزين (مستقبلي)

### `/src/types` - TypeScript Types
تعريفات الأنواع لجميع البيانات.

**الأنواع الرئيسية:**
- User, Teacher, Student, Parent
- Attendance, Homework, Exam, ExamResult
- Notification, Center

---

## 🎨 معايير الكود

### تسمية الملفات
- **Components:** PascalCase (مثل: `DashboardLayout.tsx`)
- **Pages:** kebab-case (مثل: `forgot-password/page.tsx`)
- **Utils:** camelCase (مثل: `formatDate.ts`)
- **Types:** PascalCase (مثل: `UserTypes.ts`)

### تنظيم الكود
```typescript
// 1. Imports
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Student } from '@/types';

// 2. Types & Interfaces
interface Props {
  student: Student;
}

// 3. Component
export default function StudentCard({ student }: Props) {
  // 4. Hooks
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // 5. Functions
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}

// 7. Helper Components (if needed)
function HelperComponent() {
  return <div>Helper</div>;
}
```

### التعليقات
```typescript
// استخدم تعليقات بالعربية للأجزاء المعقدة
// Use English comments for technical details

/**
 * Creates a new student with required relationships
 * يُنشئ طالب جديد مع العلاقات المطلوبة
 * 
 * @param studentData - بيانات الطالب
 * @param parentId - معرّف ولي الأمر (إجباري)
 * @param teacherIds - معرّفات المعلمين (إجباري)
 */
async function createStudent(...) {
  // ...
}
```

---

## 🔐 الأمان

### Environment Variables
```
.env.local (محلي فقط - غير مرفوع على Git)
├── NEXT_PUBLIC_* (متاح في الـ Client)
└── * (متاح في الـ Server فقط)
```

### Firestore Rules
```
firestore.rules
├── Helper Functions (التحقق من الأدوار)
├── Collection Rules (قواعد المجموعات)
└── Access Control (التحكم في الوصول)
```

### Client-side Protection
```typescript
// في DashboardLayout.tsx
useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  } else if (user && !allowedRoles.includes(user.role)) {
    router.push('/unauthorized');
  }
}, [user, loading]);
```

---

## 🧪 الاختبار

### دليل الاختبار
1. **Unit Tests:** لكل دالة في `firestore.ts`
2. **Integration Tests:** لعمليات متعددة
3. **E2E Tests:** للمسارات الرئيسية
4. **Manual Testing:** باستخدام `seed-data.ts`

---

## 📦 البناء والنشر

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment
- Vercel (موصى به)
- Firebase Hosting
- أي خدمة تدعم Next.js

---

## 🔄 سير عمل التطوير

1. **Feature Branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Development:**
   - اكتب الكود
   - اختبر محلياً
   - راجع الأخطاء

3. **Commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Pull Request:**
   - افتح PR
   - راجع التعليقات
   - دمج في main

---

## 📚 الموارد المفيدة

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Docs](https://react.dev)

---

## 🎯 أفضل الممارسات

### Performance
- ✅ استخدم React.memo للمكونات الثقيلة
- ✅ استخدم useCallback و useMemo
- ✅ تحميل البيانات بشكل متوازي
- ✅ Lazy loading للصور والمكونات

### Accessibility
- ✅ استخدم HTML دلالي
- ✅ أضف ARIA labels
- ✅ دعم لوحة المفاتيح
- ✅ نسب التباين المناسبة

### Code Quality
- ✅ استخدم TypeScript بشكل صارم
- ✅ لا تستخدم 'any' إلا للضرورة
- ✅ اكتب تعليقات مفيدة
- ✅ تابع معايير ESLint

---

**تم التحديث:** 26 ديسمبر 2025
