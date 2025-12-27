/**
 * Sample Data Seed Script
 * 
 * This script creates sample data for testing the Hesaty platform.
 * Run this after creating your first Super Admin user.
 * 
 * Usage:
 * 1. Update Firebase config below
 * 2. Run: npx ts-node scripts/seed-data.ts
 * 
 * WARNING: This will add data to your Firebase project!
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// TODO: Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sample data
const sampleData = {
  parents: [
    { name: 'أحمد محمد', email: 'ahmad@example.com', phone: '0501234567' },
    { name: 'فاطمة علي', email: 'fatima@example.com', phone: '0509876543' },
  ],
  teachers: [
    { 
      name: 'محمد السعيد', 
      email: 'mohamed@example.com', 
      phone: '0502345678',
      subjects: ['الرياضيات', 'الفيزياء'],
      centerId: 'center1'
    },
    { 
      name: 'سارة أحمد', 
      email: 'sara@example.com', 
      phone: '0508765432',
      subjects: ['اللغة العربية', 'التاريخ'],
      centerId: 'center1'
    },
  ],
  students: [
    { 
      name: 'عمر أحمد', 
      email: 'omar@example.com', 
      phone: '0503456789',
      class: 'الصف الأول الثانوي',
      centerId: 'center1',
      parentIndex: 0,
      teacherIndices: [0, 1]
    },
    { 
      name: 'ليلى محمد', 
      email: 'layla@example.com', 
      phone: '0507654321',
      class: 'الصف الثاني الثانوي',
      centerId: 'center1',
      parentIndex: 1,
      teacherIndices: [0]
    },
  ]
};

async function createParent(parentData: any) {
  try {
    const password = 'Test123!';
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      parentData.email,
      password
    );

    const uid = userCredential.user.uid;

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: parentData.name,
      role: 'parent',
      email: parentData.email,
      phone: parentData.phone,
      createdAt: serverTimestamp(),
    });

    // Create parent document
    await setDoc(doc(db, 'parents', uid), {
      uid,
      studentIds: [],
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Created parent: ${parentData.name} (${parentData.email})`);
    return uid;
  } catch (error: any) {
    console.error(`❌ Error creating parent ${parentData.name}:`, error.message);
    return null;
  }
}

async function createTeacher(teacherData: any) {
  try {
    const password = 'Test123!';
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      teacherData.email,
      password
    );

    const uid = userCredential.user.uid;

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: teacherData.name,
      role: 'teacher',
      email: teacherData.email,
      phone: teacherData.phone,
      createdAt: serverTimestamp(),
    });

    // Create teacher document
    await setDoc(doc(db, 'teachers', uid), {
      uid,
      subjects: teacherData.subjects,
      centerId: teacherData.centerId,
      studentIds: [],
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Created teacher: ${teacherData.name} (${teacherData.email})`);
    return uid;
  } catch (error: any) {
    console.error(`❌ Error creating teacher ${teacherData.name}:`, error.message);
    return null;
  }
}

async function createStudent(studentData: any, parentIds: string[], teacherIds: string[]) {
  try {
    const password = 'Test123!';
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      studentData.email,
      password
    );

    const uid = userCredential.user.uid;
    const parentId = parentIds[studentData.parentIndex];
    const selectedTeacherIds = studentData.teacherIndices.map((i: number) => teacherIds[i]);

    if (!parentId) {
      throw new Error('Parent ID not found');
    }

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: studentData.name,
      role: 'student',
      email: studentData.email,
      phone: studentData.phone,
      createdAt: serverTimestamp(),
    });

    // Create student document
    await setDoc(doc(db, 'students', uid), {
      uid,
      centerId: studentData.centerId,
      parentId: parentId,
      teacherIds: selectedTeacherIds,
      class: studentData.class,
      createdAt: serverTimestamp(),
    });

    // Update parent's studentIds
    const parentRef = doc(db, 'parents', parentId);
    const parentDoc = await getDoc(parentRef);
    if (parentDoc.exists()) {
      const currentStudentIds = parentDoc.data().studentIds || [];
      await setDoc(parentRef, {
        studentIds: [...currentStudentIds, uid]
      }, { merge: true });
    }

    // Update teachers' studentIds
    for (const teacherId of selectedTeacherIds) {
      const teacherRef = doc(db, 'teachers', teacherId);
      const teacherDoc = await getDoc(teacherRef);
      if (teacherDoc.exists()) {
        const currentStudentIds = teacherDoc.data().studentIds || [];
        await setDoc(teacherRef, {
          studentIds: [...currentStudentIds, uid]
        }, { merge: true });
      }
    }

    console.log(`✅ Created student: ${studentData.name} (${studentData.email})`);
    return uid;
  } catch (error: any) {
    console.error(`❌ Error creating student ${studentData.name}:`, error.message);
    return null;
  }
}

async function seedData() {
  console.log('🌱 Starting data seeding...\n');

  // Create parents
  console.log('📝 Creating parents...');
  const parentIds: string[] = [];
  for (const parent of sampleData.parents) {
    const parentId = await createParent(parent);
    if (parentId) parentIds.push(parentId);
  }
  console.log();

  // Create teachers
  console.log('👨‍🏫 Creating teachers...');
  const teacherIds: string[] = [];
  for (const teacher of sampleData.teachers) {
    const teacherId = await createTeacher(teacher);
    if (teacherId) teacherIds.push(teacherId);
  }
  console.log();

  // Create students
  console.log('🎓 Creating students...');
  const studentIds: string[] = [];
  for (const student of sampleData.students) {
    const studentId = await createStudent(student, parentIds, teacherIds);
    if (studentId) studentIds.push(studentId);
  }
  console.log();

  console.log('✅ Data seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   Parents: ${parentIds.length}`);
  console.log(`   Teachers: ${teacherIds.length}`);
  console.log(`   Students: ${studentIds.length}`);
  console.log();
  console.log('🔑 Default password for all users: Test123!');
  console.log();
  console.log('👤 Sample accounts:');
  sampleData.parents.forEach(p => console.log(`   Parent: ${p.email}`));
  sampleData.teachers.forEach(t => console.log(`   Teacher: ${t.email}`));
  sampleData.students.forEach(s => console.log(`   Student: ${s.email}`));
  
  process.exit(0);
}

// Import getDoc
import { getDoc } from 'firebase/firestore';

// Run the seed
seedData().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
