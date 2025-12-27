# ✅ Quick Start Checklist - Hesaty Platform

## 🎯 Current Status: Application Built ✅ | Firebase Setup Required ⚠️

---

## 📋 Firebase Setup Checklist (5-10 minutes)

### ☐ Step 1: Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add Project" or "إنشاء مشروع"
- [ ] Name it "Hesaty" (or any name you prefer)
- [ ] Accept terms and click "Continue"
- [ ] Choose whether to enable Google Analytics
- [ ] Wait for project creation

### ☐ Step 2: Enable Authentication
- [ ] In Firebase Console, go to "Authentication"
- [ ] Click "Get Started" or "البدء"
- [ ] Click on "Email/Password" provider
- [ ] Toggle "Enable" switch
- [ ] Click "Save" or "حفظ"

### ☐ Step 3: Create Firestore Database
- [ ] Go to "Firestore Database"
- [ ] Click "Create Database"
- [ ] Choose location (closest to your users)
- [ ] Start in **Test mode** (we'll secure it later)
- [ ] Click "Enable"

### ☐ Step 4: Enable Storage
- [ ] Go to "Storage"
- [ ] Click "Get Started"
- [ ] Use default rules (we'll update later)
- [ ] Click "Done"

### ☐ Step 5: Get Configuration
- [ ] Click on Settings icon (⚙️) → Project Settings
- [ ] Scroll down to "Your apps"
- [ ] Click Web icon (`</>`)
- [ ] Register app: name it "Hesaty Web"
- [ ] **COPY** the firebaseConfig object

### ☐ Step 6: Create .env.local File
- [ ] In project root, create file named `.env.local`
- [ ] Paste the following and replace with your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-actual-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

- [ ] Save the file

### ☐ Step 7: Restart Development Server
- [ ] Stop the current server (Ctrl+C or Cmd+C)
- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify no Firebase errors appear

---

## 🔐 Security Rules Setup (5 minutes)

### ☐ Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### ☐ Step 2: Login to Firebase
```bash
firebase login
```

### ☐ Step 3: Initialize Firestore
```bash
firebase init firestore
```
- [ ] Select "Use an existing project"
- [ ] Choose your Hesaty project
- [ ] Accept default firestore.rules path
- [ ] Accept default firestore.indexes.json path

### ☐ Step 4: Deploy Rules
```bash
firebase deploy --only firestore:rules
```

---

## 👤 Create First Admin User (3 minutes)

### ☐ Method 1: Via Firebase Console (Easier)

1. **Create Authentication User:**
   - [ ] Go to Firebase Console → Authentication → Users
   - [ ] Click "Add User"
   - [ ] Email: `admin@example.com` (or your email)
   - [ ] Password: `YourSecurePassword123!`
   - [ ] Click "Add User"
   - [ ] **COPY the UID** (important!)

2. **Create Firestore User Document:**
   - [ ] Go to Firestore Database
   - [ ] Click "Start Collection"
   - [ ] Collection ID: `users`
   - [ ] Document ID: [Paste the UID you copied]
   - [ ] Add fields:
     ```
     uid: "paste-the-uid-here"
     name: "المسؤول الرئيسي"
     role: "super_admin"
     email: "admin@example.com"
     phone: "0500000000"
     createdAt: [Click "Add field" → Type: timestamp → Click clock icon for current time]
     ```
   - [ ] Click "Save"

### ☐ Method 2: Via Script (Advanced)
- [ ] Update `scripts/seed-data.ts` with your Firebase config
- [ ] Run: `npx ts-node scripts/seed-data.ts`

---

## ✅ Test the Platform (5 minutes)

### ☐ Test Login
- [ ] Go to http://localhost:3000/login
- [ ] Enter admin credentials
- [ ] Should redirect to Super Admin dashboard

### ☐ Test Super Admin Dashboard
- [ ] Verify dashboard loads
- [ ] Check statistics display
- [ ] Test navigation menu

### ☐ Create Test Users
Create at least one of each:
- [ ] Parent user (via Firebase Console)
- [ ] Teacher user (via Firebase Console)
- [ ] Student user (via Firebase Console)
  - **Important:** Link student to parent and teacher!

---

## 🎨 Optional Customization

### ☐ Branding
- [ ] Update colors in `tailwind.config.ts`
- [ ] Add logo in `public/` folder
- [ ] Update site metadata in `src/app/layout.tsx`

### ☐ Sample Data
- [ ] Run seed script to add test data
- [ ] Or manually create via dashboards

---

## 🚀 Ready to Deploy?

### ☐ Pre-Deployment Checklist
- [ ] All Firebase services configured
- [ ] Security rules deployed
- [ ] Admin user created and tested
- [ ] Sample data added
- [ ] Environment variables set

### ☐ Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### ☐ Deploy to Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy --only hosting
```

---

## 📊 Status Check

```
✅ = Completed
⚠️ = Required
⏳ = In Progress
❌ = Not Started
```

| Task | Status |
|------|--------|
| Firebase Project Created | ☐ |
| Authentication Enabled | ☐ |
| Firestore Created | ☐ |
| Storage Enabled | ☐ |
| .env.local Created | ☐ |
| Security Rules Deployed | ☐ |
| Admin User Created | ☐ |
| Login Tested | ☐ |
| Platform Ready | ☐ |

---

## 🆘 Having Issues?

### "Firebase Configuration Error"
→ Check `.env.local` file exists and has correct values
→ Restart dev server after creating .env.local

### "Permission Denied"
→ Deploy Firestore rules: `firebase deploy --only firestore:rules`

### "Invalid API Key"
→ Verify NEXT_PUBLIC_FIREBASE_API_KEY in .env.local
→ Check Firebase Console for correct API key

### "Can't Create Student"
→ Ensure parent exists first
→ Ensure teacher exists first
→ Provide both parentId and teacherIds array

---

## 📚 Documentation Reference

- **Setup Guide:** `SETUP.md`
- **Firebase Setup:** `FIREBASE_SETUP_REQUIRED.md`
- **Full Docs:** `README.md`
- **Project Info:** `PROJECT_SUMMARY.md`

---

## 🎉 Once Complete

After checking all boxes above, you'll have:
- ✅ Fully functional educational platform
- ✅ Secure authentication system
- ✅ Role-based dashboards
- ✅ Ready for production use

---

**🚀 Start from Step 1 and check each box as you complete it!**

**Time Estimate:** 15-20 minutes total for complete setup

**Next:** See `PROJECT_SUMMARY.md` for full platform overview
