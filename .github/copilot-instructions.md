# Copilot Instructions for Hesaty Platform

## Project Overview
This is an educational platform called "Hesaty" (حصتي) built with Next.js 14, TypeScript, Tailwind CSS, and Firebase. The platform manages educational centers with role-based access for super admins, teachers, students, and parents.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage, Analytics)
- RTL (Right-to-Left) support for Arabic

## Key Principles

### 1. Relationship Enforcement
**CRITICAL:** Always enforce these relationships in code:
- Every student MUST have a parentId (required)
- Every student MUST have at least one teacherId (required)
- Validate relationships before creating students
- Update parent.studentIds and teacher.studentIds arrays when linking

### 2. Role-Based Access Control
Always check user roles before allowing access:
- super_admin: Full system access
- teacher: Access only to linked students
- student: Access only to own data
- parent: Access only to their children's data

### 3. Arabic-First UI
- All user-facing text should be in Arabic
- Use RTL layout (direction: rtl)
- Use Cairo font for Arabic text
- Keep code comments and variable names in English

### 4. Firebase Best Practices
- Use Firestore batch operations when updating multiple documents
- Always use serverTimestamp() for createdAt fields
- Handle Firestore timestamps properly (convert to Date)
- Implement proper error handling for Firebase operations

### 5. Type Safety
- Always use TypeScript interfaces from @/types
- No 'any' types unless absolutely necessary
- Properly type all Firebase data
- Use proper type guards

### 6. Code Organization
```
src/
├── app/              # Next.js 14 App Router pages
├── components/       # Reusable React components
├── contexts/         # React Context (Auth, etc.)
├── lib/
│   └── firebase/    # Firebase config and services
└── types/           # TypeScript type definitions
```

## Code Examples

### Creating a Student (with relationship enforcement)
```typescript
// CORRECT - Always validate relationships
async function createStudent(data) {
  // Validate parent exists
  if (!data.parentId) {
    throw new Error('Student must have a parent');
  }
  
  // Validate at least one teacher
  if (!data.teacherIds || data.teacherIds.length === 0) {
    throw new Error('Student must have at least one teacher');
  }
  
  // Create student and update relationships
  // ... rest of the code
}

// WRONG - No validation
async function createStudent(data) {
  await setDoc(doc(db, 'students', uid), data);
}
```

### Checking Permissions
```typescript
// CORRECT - Check if teacher can access student
const teacher = await getTeacher(teacherId);
if (!teacher.studentIds.includes(studentId)) {
  throw new Error('Access denied');
}

// CORRECT - Check if parent can access student
const student = await getStudent(studentId);
if (student.parentId !== parentId) {
  throw new Error('Access denied');
}
```

### UI Components
```typescript
// Use Arabic text and RTL
<div className="text-right">
  <h2>الطلاب</h2>
  <p>قائمة الطلاب المسجلين</p>
</div>

// Use Tailwind utility classes
<button className="btn-primary">
  إضافة طالب
</button>
```

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">جاري التحميل...</p>
    </div>
  );
}
```

### Error Handling
```typescript
try {
  await someFirebaseOperation();
} catch (error) {
  console.error('Operation failed:', error);
  setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
}
```

### Date Formatting
```typescript
// Use Arabic locale
new Date(timestamp).toLocaleDateString('ar-EG')
```

## Security Rules
Always implement Firestore security rules that:
- Enforce authentication
- Check user roles
- Validate relationships
- Prevent unauthorized access

## Testing Checklist
When implementing features, verify:
- [ ] Relationships are enforced
- [ ] Role-based access works correctly
- [ ] Arabic text displays properly (RTL)
- [ ] Loading states are shown
- [ ] Error handling is implemented
- [ ] TypeScript types are correct
- [ ] Firestore rules allow the operation
- [ ] Mobile responsive design works

## Performance
- Use React.memo for expensive components
- Implement pagination for large lists
- Use Firestore queries efficiently
- Lazy load images and heavy components

## Accessibility
- Use semantic HTML
- Add proper ARIA labels in Arabic
- Ensure keyboard navigation works
- Maintain good color contrast

## Additional Resources
- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs
