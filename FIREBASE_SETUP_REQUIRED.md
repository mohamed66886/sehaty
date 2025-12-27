# 🚨 IMPORTANT: Firebase Setup Required

## The application is running but needs Firebase configuration!

### Quick Setup (5 minutes):

#### 1️⃣ Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name: **Hesaty** (or any name)
4. Click Continue → Create Project

#### 2️⃣ Enable Firebase Services

**Authentication:**
- Go to Authentication → Get Started
- Enable "Email/Password"

**Firestore:**
- Go to Firestore Database → Create Database
- Start in **test mode** (we'll update rules later)
- Choose your region

**Storage:**
- Go to Storage → Get Started
- Use default security rules

#### 3️⃣ Get Firebase Config

1. Go to Project Settings (⚙️ icon)
2. Scroll to "Your apps" section
3. Click Web icon (`</>`)
4. Register app name: **Hesaty Web**
5. Copy the `firebaseConfig` object

#### 4️⃣ Update .env.local File

Open or create `.env.local` in the project root and paste your config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

#### 5️⃣ Restart Development Server

After saving `.env.local`:
1. Stop the dev server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Open: http://localhost:3000

---

## 📋 Next Steps After Firebase Setup:

### Deploy Firestore Security Rules

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore only)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Create First Super Admin User

Use Firebase Console → Authentication → Add User:
- Email: admin@example.com
- Password: YourStrongPassword123!

Then in Firestore, create:
- Collection: `users`
- Document ID: [the UID from Authentication]
- Fields:
  ```
  uid: "the-uid-here"
  name: "المسؤول الرئيسي"
  role: "super_admin"
  email: "admin@example.com"
  phone: "0123456789"
  createdAt: [current timestamp]
  ```

---

## 🎯 Quick Reference

- **Firebase Console:** https://console.firebase.google.com/
- **Setup Guide:** See `SETUP.md` for detailed instructions
- **Documentation:** See `README.md` for full documentation

---

## ❓ Need Help?

If you encounter issues:
1. Check that all environment variables are correct
2. Ensure Firebase services are enabled
3. Restart the dev server after changing .env.local
4. Check browser console for detailed errors

---

**Current Status:** ✅ Application is built and running
**Required:** 🔧 Firebase configuration needed to continue
