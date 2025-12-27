// src/lib/firebase/firestore.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import type {
  User,
  Teacher,
  Student,
  Parent,
  Attendance,
  Homework,
  Exam,
  ExamResult,
  UserRole,
  Schedule,
} from '@/types';

// ================================
// USER OPERATIONS
// ================================

export async function createUser(uid: string, userData: Omit<User, 'uid' | 'createdAt'>) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    ...userData,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as User;
  }
  
  return null;
}

export async function updateUser(uid: string, userData: Partial<User>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, userData);
}

// ================================
// TEACHER OPERATIONS
// ================================

export async function createTeacher(
  uid: string,
  teacherData: Omit<Teacher, 'uid' | 'createdAt' | 'role'>
) {
  // Create user record
  await createUser(uid, {
    name: teacherData.name,
    role: 'teacher',
    phone: teacherData.phone,
    email: teacherData.email,
  });

  // Create teacher-specific record
  const teacherRef = doc(db, 'teachers', uid);
  await setDoc(teacherRef, {
    uid,
    subjects: teacherData.subjects,
    centerId: teacherData.centerId,
    studentIds: teacherData.studentIds || [],
    createdAt: serverTimestamp(),
  });
}

export async function getTeacher(uid: string): Promise<Teacher | null> {
  const teacherRef = doc(db, 'teachers', uid);
  const teacherSnap = await getDoc(teacherRef);
  
  if (teacherSnap.exists()) {
    const user = await getUser(uid);
    if (!user) return null;
    
    const data = teacherSnap.data();
    return {
      ...user,
      role: 'teacher',
      subjects: data.subjects || [],
      centerId: data.centerId,
      studentIds: data.studentIds || [],
    } as Teacher;
  }
  
  return null;
}

export async function addStudentToTeacher(teacherId: string, studentId: string) {
  const teacherRef = doc(db, 'teachers', teacherId);
  await updateDoc(teacherRef, {
    studentIds: arrayUnion(studentId),
  });
}

export async function removeStudentFromTeacher(teacherId: string, studentId: string) {
  const teacherRef = doc(db, 'teachers', teacherId);
  await updateDoc(teacherRef, {
    studentIds: arrayRemove(studentId),
  });
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const teachersSnapshot = await getDocs(collection(db, 'teachers'));
  const teachers: Teacher[] = [];
  
  for (const teacherDoc of teachersSnapshot.docs) {
    const user = await getUser(teacherDoc.id);
    if (user) {
      const data = teacherDoc.data();
      teachers.push({
        ...user,
        role: 'teacher',
        subjects: data.subjects || [],
        centerId: data.centerId,
        studentIds: data.studentIds || [],
        bio: data.bio,
        secretCode: data.secretCode,
        classCodes: data.classCodes,
        notificationSettings: data.notificationSettings,
        theme: data.theme,
      } as Teacher);
    }
  }
  
  return teachers;
}

// ================================
// STUDENT OPERATIONS (WITH RELATIONSHIP ENFORCEMENT)
// ================================

export async function createStudent(
  uid: string,
  studentData: Omit<Student, 'uid' | 'createdAt' | 'role'>
) {
  // VALIDATE: Student must have a parent
  if (!studentData.parentId) {
    throw new Error('Student must be linked to a parent');
  }

  // VALIDATE: Student must have at least one teacher
  if (!studentData.teacherIds || studentData.teacherIds.length === 0) {
    throw new Error('Student must be linked to at least one teacher');
  }

  // VALIDATE: Parent exists
  const parentRef = doc(db, 'parents', studentData.parentId);
  const parentSnap = await getDoc(parentRef);
  if (!parentSnap.exists()) {
    throw new Error('Parent does not exist');
  }

  // VALIDATE: All teachers exist
  for (const teacherId of studentData.teacherIds) {
    const teacherRef = doc(db, 'teachers', teacherId);
    const teacherSnap = await getDoc(teacherRef);
    if (!teacherSnap.exists()) {
      throw new Error(`Teacher ${teacherId} does not exist`);
    }
  }

  // Create user record
  await createUser(uid, {
    name: studentData.name,
    role: 'student',
    phone: studentData.phone,
    email: studentData.email,
  });

  // Create student-specific record
  const studentRef = doc(db, 'students', uid);
  await setDoc(studentRef, {
    uid,
    centerId: studentData.centerId,
    parentId: studentData.parentId,
    teacherIds: studentData.teacherIds,
    class: studentData.class,
    createdAt: serverTimestamp(),
  });

  // Update parent's studentIds array
  await updateDoc(parentRef, {
    studentIds: arrayUnion(uid),
  });

  // Update each teacher's studentIds array
  for (const teacherId of studentData.teacherIds) {
    await addStudentToTeacher(teacherId, uid);
  }
}

export async function getStudent(uid: string): Promise<Student | null> {
  const studentRef = doc(db, 'students', uid);
  const studentSnap = await getDoc(studentRef);
  
  if (studentSnap.exists()) {
    const user = await getUser(uid);
    if (!user) return null;
    
    const data = studentSnap.data();
    return {
      ...user,
      role: 'student',
      centerId: data.centerId,
      parentId: data.parentId,
      teacherIds: data.teacherIds || [],
      class: data.class,
    } as Student;
  }
  
  return null;
}

export async function getStudentsByParent(parentId: string): Promise<Student[]> {
  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, where('parentId', '==', parentId));
  const querySnapshot = await getDocs(q);
  
  const students: Student[] = [];
  for (const doc of querySnapshot.docs) {
    const student = await getStudent(doc.id);
    if (student) students.push(student);
  }
  
  return students;
}

export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
  const studentsRef = collection(db, 'students');
  const q = query(studentsRef, where('teacherIds', 'array-contains', teacherId));
  const querySnapshot = await getDocs(q);
  
  const students: Student[] = [];
  for (const doc of querySnapshot.docs) {
    const student = await getStudent(doc.id);
    if (student) students.push(student);
  }
  
  return students;
}

// ================================
// PARENT OPERATIONS
// ================================

export async function createParent(
  uid: string,
  parentData: Omit<Parent, 'uid' | 'createdAt' | 'role' | 'studentIds'>
) {
  // Create user record
  await createUser(uid, {
    name: parentData.name,
    role: 'parent',
    phone: parentData.phone,
    email: parentData.email,
  });

  // Create parent-specific record
  const parentRef = doc(db, 'parents', uid);
  await setDoc(parentRef, {
    uid,
    studentIds: [],
    createdAt: serverTimestamp(),
  });
}

export async function getParent(uid: string): Promise<Parent | null> {
  const parentRef = doc(db, 'parents', uid);
  const parentSnap = await getDoc(parentRef);
  
  if (parentSnap.exists()) {
    const user = await getUser(uid);
    if (!user) return null;
    
    const data = parentSnap.data();
    return {
      ...user,
      role: 'parent',
      studentIds: data.studentIds || [],
    } as Parent;
  }
  
  return null;
}

// ================================
// ATTENDANCE OPERATIONS
// ================================

export async function createAttendance(attendanceData: Omit<Attendance, 'id' | 'createdAt'>) {
  const attendanceRef = collection(db, 'attendance');
  await addDoc(attendanceRef, {
    ...attendanceData,
    date: Timestamp.fromDate(attendanceData.date),
    createdAt: serverTimestamp(),
  });
}

export async function getAttendanceByStudent(
  studentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Attendance[]> {
  const attendanceRef = collection(db, 'attendance');
  let q = query(attendanceRef, where('studentId', '==', studentId));
  
  const querySnapshot = await getDocs(q);
  let attendanceRecords: Attendance[] = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Attendance[];

  // Filter by date range if provided
  if (startDate && endDate) {
    attendanceRecords = attendanceRecords.filter(
      record => record.date >= startDate && record.date <= endDate
    );
  }

  return attendanceRecords;
}

// ================================
// HOMEWORK OPERATIONS
// ================================

export async function createHomework(homeworkData: Omit<Homework, 'id' | 'createdAt'>) {
  const homeworkRef = collection(db, 'homework');
  const docRef = await addDoc(homeworkRef, {
    ...homeworkData,
    deadline: Timestamp.fromDate(homeworkData.deadline),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getHomeworkByStudent(studentId: string): Promise<Homework[]> {
  const homeworkRef = collection(db, 'homework');
  const q = query(homeworkRef, where('studentIds', 'array-contains', studentId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    deadline: doc.data().deadline?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Homework[];
}

export async function getHomeworkByTeacher(teacherId: string): Promise<Homework[]> {
  const homeworkRef = collection(db, 'homework');
  const q = query(homeworkRef, where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    deadline: doc.data().deadline?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Homework[];
}

// ================================
// EXAM OPERATIONS
// ================================

export async function createExam(examData: Omit<Exam, 'id' | 'createdAt'>) {
  const examRef = collection(db, 'exams');
  const docRef = await addDoc(examRef, {
    ...examData,
    startDate: Timestamp.fromDate(examData.startDate),
    endDate: Timestamp.fromDate(examData.endDate),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getExamsByStudent(studentId: string): Promise<Exam[]> {
  const examRef = collection(db, 'exams');
  const q = query(examRef, where('studentIds', 'array-contains', studentId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate(),
    endDate: doc.data().endDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Exam[];
}

// ================================
// EXAM RESULTS OPERATIONS
// ================================

export async function createExamResult(resultData: Omit<ExamResult, 'id'>) {
  const resultRef = collection(db, 'results');
  const docRef = await addDoc(resultRef, {
    ...resultData,
    submittedAt: Timestamp.fromDate(resultData.submittedAt),
    gradedAt: resultData.gradedAt ? Timestamp.fromDate(resultData.gradedAt) : null,
  });
  return docRef.id;
}

export async function getExamResultsByStudent(studentId: string): Promise<ExamResult[]> {
  const resultsRef = collection(db, 'results');
  const q = query(resultsRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate(),
    gradedAt: doc.data().gradedAt?.toDate(),
  })) as ExamResult[];
}

export async function getExamResult(
  studentId: string,
  examId: string
): Promise<ExamResult | null> {
  const resultsRef = collection(db, 'results');
  const q = query(
    resultsRef,
    where('studentId', '==', studentId),
    where('examId', '==', examId)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate(),
    gradedAt: doc.data().gradedAt?.toDate(),
  } as ExamResult;
}

// ================================
// SCHEDULE OPERATIONS
// ================================

export async function createSchedule(scheduleData: Omit<Schedule, 'id' | 'createdAt'>) {
  const scheduleRef = collection(db, 'schedules');
  const docRef = await addDoc(scheduleRef, {
    ...scheduleData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
  const scheduleRef = collection(db, 'schedules');
  const q = query(scheduleRef, where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Schedule[];
}

export async function updateSchedule(id: string, scheduleData: Partial<Schedule>) {
  const scheduleRef = doc(db, 'schedules', id);
  await updateDoc(scheduleRef, scheduleData);
}

export async function deleteSchedule(id: string) {
  const scheduleRef = doc(db, 'schedules', id);
  await deleteDoc(scheduleRef);
}
