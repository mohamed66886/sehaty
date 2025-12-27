// src/types/index.ts

export type UserRole = 'super_admin' | 'teacher' | 'student' | 'parent';

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  createdAt: Date;
  photoURL?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  centerId: string;
  studentIds: string[];
  bio?: string;
  secretCode?: string;
  classCodes?: Array<{
    id: string;
    name: string;
    code: string;
    studentsCount: number;
    lastModified: string;
    isActive: boolean;
  }>;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    assignments: boolean;
    announcements: boolean;
    messages: boolean;
    grades: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
}

export interface Student extends User {
  role: 'student';
  centerId: string;
  parentId: string; // REQUIRED
  teacherIds: string[]; // REQUIRED (one or more)
  class: string;
}

export interface Parent extends User {
  role: 'parent';
  studentIds: string[]; // one or more students
}

export interface Attendance {
  id?: string;
  studentId: string;
  teacherId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: Date;
}

export interface Homework {
  id?: string;
  teacherId: string;
  studentIds: string[];
  title: string;
  description: string;
  deadline: Date;
  subject: string;
  createdAt: Date;
  submissions?: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  studentId: string;
  submittedAt?: Date;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  fileUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Exam {
  id?: string;
  teacherId: string;
  studentIds: string[];
  title: string;
  subject: string;
  questions: Question[];
  totalScore: number;
  duration: number; // in minutes
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface ExamResult {
  id?: string;
  studentId: string;
  examId: string;
  score: number;
  answers: Record<string, string>;
  submittedAt: Date;
  gradedAt?: Date;
  feedback?: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface Center {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface ScheduleClass {
  time: string;
  subject: string;
  grade: string;
  room: string;
  students: number;
}

export interface Schedule {
  id?: string;
  teacherId: string;
  day: string;
  classes: ScheduleClass[];
  createdAt: Date;
}

export interface PendingSubscription {
  id?: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  status: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  duration: string;
  price: string;
  studentsCount: number;
  maxStudents: number;
  available: boolean;
  teacherId: string;
}
