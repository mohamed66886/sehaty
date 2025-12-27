# Firestore Index Required

## مطلوب إنشاء Index في Firestore

لكي تعمل صفحة تفاصيل الحضور بشكل صحيح، يجب إنشاء Index في Firestore.

### الخطوات:

1. افتح الرابط التالي لإنشاء الـ Index تلقائياً:
   
   **🔗 [إنشاء Index للحضور](https://console.firebase.google.com/v1/r/project/skarkna2/firestore/indexes?create_composite=Cktwcm9qZWN0cy9za2Fya25hMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYXR0ZW5kYW5jZS9pbmRleGVzL18QARoNCgl0ZWFjaGVySWQQARoICgRkYXRlEAEaDAoIX19uYW1lX18QAQ)**

2. اضغط على زر "Create Index" أو "إنشاء الفهرس"

3. انتظر حتى يتم إنشاء الفهرس (قد يستغرق بضع دقائق)

4. بعد الانتهاء، جرب عرض تفاصيل الحضور مرة أخرى

### تفاصيل الـ Index:

- **Collection**: `attendance`
- **Fields**:
  - `teacherId` (Ascending)
  - `date` (Ascending)
  - `__name__` (Ascending)

### سبب الخطأ:

الخطأ يحدث عند محاولة عرض تفاصيل سجل حضور معين، حيث يتم البحث في collection `attendance` باستخدام:
- `teacherId` (للمدرس الحالي)
- `date` (للتاريخ المحدد)
- مع ترتيب النتائج

Firestore يتطلب إنشاء Index مركب (Composite Index) عند استخدام أكثر من حقل في الاستعلام.

### بديل مؤقت (إذا لم تستطع إنشاء الـ Index الآن):

يمكنك استخدام الكود البديل التالي في function `handleViewRecord`:

```typescript
// بدلاً من استخدام date range query
// يمكنك تحميل جميع السجلات ثم تصفيتها محلياً
const q = query(
  attendanceRef,
  where('teacherId', '==', user?.uid)
);

const snapshot = await getDocs(q);

// تصفية محلية حسب التاريخ
const details: AttendanceDetail[] = snapshot.docs
  .filter(doc => {
    const recordDate = doc.data().date.toDate();
    return recordDate >= startOfDay && recordDate <= endOfDay;
  })
  .map(doc => {
    const data = doc.data();
    return {
      studentId: data.studentId,
      studentName: data.studentName || 'غير محدد',
      className: data.className || 'غير محدد',
      status: data.status,
      notes: data.notes || ''
    };
  });
```

---

**ملاحظة**: إنشاء الـ Index هو الحل الأمثل والموصى به لأداء أفضل.
