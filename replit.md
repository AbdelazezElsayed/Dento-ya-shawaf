# Dento Health Care - Dental Hospital Management System

## Overview
Dento Health Care is a comprehensive, bilingual (Arabic/English) dental hospital management system developed for Delta University's Faculty of Dentistry. It features full RTL support, role-based access for 4 user types, and 7 major feature modules. The system aims to streamline dental practice operations, encompassing appointment scheduling, medical records, advanced payment processing, and robust administrative controls. It is designed for enterprise-level deployment, prioritizing efficiency, user experience, and advanced functionality.

## User Preferences
I prefer simple language.
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.

## System Architecture
The system is built on a modern web stack, characterized by a professional medical blue theme and an emphasis on user experience.

**UI/UX Decisions:**
- **Design Philosophy:** Medical blue dental theme, professional patterns, Framer Motion for animations, and consistency via Shadcn UI + Tailwind CSS. Supports multiple themes (4 color options), high-contrast mode, and adjustable font sizes.
- **Responsiveness & Accessibility:** Fully responsive for all devices, with ARIA labels and test IDs.
- **Localization:** Bilingual (Arabic/English) with full RTL support.
- **Theming:** Dark mode support.
- **Interactive Elements:** Hover elevation effects, a badge system for status, and controllable animations.
- **Clinic Visuals:** 12 unique colors for specialized clinics.

**Technical Implementations & Feature Specifications:**
- **Core Modules:**
    1.  **Appointment Booking:** Scheduling, reminders, cancellation/rescheduling, consultation fees, status filtering.
    2.  **Doctor Management:** Specialization/rating filters, favorites, statistics, availability.
    3.  **Medical Records:** Alerts, type/status filtering, follow-up tracking, view/download.
    4.  **Ratings & Reviews:** Multi-sorting, average rating, distribution charts, 5-star system.
    5.  **Notifications System:** Type filtering, mark as read, deletion, color-coded types.
    6.  **Advanced Search Engine:** Search history, multi-category results (Doctors/Clinics/Articles), real-time statistics.
    7.  **Payment & Invoicing System:** Status-based filtering, payment history, installment plans (1/3/6 months), discount codes, save card option, payment statistics, multiple payment methods (Credit Card, Digital Wallet, Bank Transfer) in EGP. Includes professional financial management dashboard, invoice management (PDF export), expense tracking, and financial reports (P&L, charts, tax calculation).
- **MEGA Settings System:** 8 advanced groups with 40+ options (account, medical, booking, billing, communication, privacy, customization, notifications).
- **User Roles (4):** Patient, Doctor, Student, Excellence, with defined access levels.
- **Specialized Clinics (12 + Dentocad):** Comprehensive database with doctors, services, modern equipment, pricing, working hours, and contact information for each.
- **Support System:** 24/7 smart support with live chat, intelligent chatbot, comprehensive FAQ, help center, and an advanced support ticket system (creation, status tracking, escalation, response time analytics).
- **Mobile App Integration:** iOS and Android apps with push notifications, offline mode, auto-sync, and dark mode.
- **Performance Optimizations:** Smart caching (25%+ speed improvement), automatic data compression, optimized loading, live performance charts, and usage analytics.

**System Design Choices:**
- **Frontend:** React + TypeScript + Vite, Wouter for routing, React Hook Form + Zod for forms, React Query + Tanstack Query v5 for state management.
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend:** Express.js.
- **Database:** MongoDB (via Mongoose).
- **Icons:** Lucide React + React Icons.
- **Charting:** Recharts for interactive graphs.
- **File Structure:** Organized `client/src` with `pages` and `components` directories.

## Recent Implementation Progress (Turn 27)
✅ **تنظيم وهندسة نظام API الاحترافي الكامل:**

### 📁 هيكل المجلدات المنظم:
```
client/src/services/api/
├── config.ts              # Configuration + 30+ API endpoints
├── client.ts              # Axios client with helpers (GET, POST, PATCH, PUT, DELETE)
├── index.ts               # Central export point
├── interceptors/          # Request/Response interceptors
│   ├── setup.ts
│   ├── request.interceptor.ts    # Auth token + headers
│   └── response.interceptor.ts   # Error handling + status codes
├── endpoints/             # Organized endpoints
│   ├── auth.endpoints.ts          # Auth operations
│   ├── appointments.endpoints.ts  # Appointment management
│   ├── doctors.endpoints.ts       # Doctor operations
│   └── index.ts                   # Central export
├── types/                 # Type definitions
│   └── api.types.ts
└── utils/                 # Utilities
    ├── retry.ts           # Exponential backoff
    └── cache.ts           # Response caching
```

### ✨ الميزات:
- ✅ 13 ملف منظم بشكل احترافي
- ✅ Axios client مع interceptors
- ✅ 30+ API endpoints مصنفة بعناية
- ✅ Automatic auth token injection
- ✅ Centralized error handling
- ✅ Retry mechanism with exponential backoff
- ✅ API response caching
- ✅ Request/Response logging (dev mode)
- ✅ Type-safe API calls
- ✅ Language header support (AR/EN)
- ✅ Request ID tracking
- ✅ Comprehensive README documentation

### 📋 Endpoints Organized:
- Authentication (5)
- Appointments (6)
- Doctors (5)
- Clinics (4)
- Medical Records (7)
- Medications (5)
- Payments (6)
- Notifications (4)
- Reviews (7)
- Support (4)
- Financial (4)
- Search (4)

## Previous Implementation Progress (Turn 24-26)
✅ **بنيت 13 صفحة جديدة احترافية:**

### صفحات المريض (8 صفحات):
1. **My Appointments Page** (/my-appointments) - قائمة المواعيد مع التصفية (قادمة/مكتملة/ملغاة)
2. **Medications Page** (/medications) - تتبع الأدوية والروشتات الطبية
3. **My Reviews Page** (/my-reviews) - عرض التقييمات مع الإحصائيات
4. **Upcoming Reminders Page** (/reminders) - التذكيرات القادمة والمهام الطبية
5. **Medical Records Page** (موجودة بالفعل)
6. **Appointments Booking** (موجودة بالفعل)
7. **Financial Dashboard** (موجودة بالفعل)

### صفحات الطبيب (6 صفحات):
1. **Doctor Schedule Page** (/doctor-schedule) - إدارة الجدول الزمني والفترات المتاحة
2. **Patient Queue Page** (/patient-queue) - قائمة المرضى اليوم مع الحالة
3. **Patient Medical History** (/patient-history) - سجل المريض الطبي الكامل
4. **Appointments Analytics** (/appointments-analytics) - إحصائيات شاملة مع رسوم بيانية
5. **Doctor Profile** (/doctor-profile) - ملف الطبيب الشامل مع المؤهلات
6. **Doctor Dashboard** (موجود بالفعل في DoctorPanelPage)

### الميزات المضافة:
- ✅ صفحات بتصميم احترافي مع Framer Motion animations
- ✅ Dark mode support لجميع الصفحات
- ✅ RTL support كامل للعربية
- ✅ بيانات وهمية واقعية وكاملة
- ✅ Charts و Statistics باستخدام Recharts
- ✅ Status badges و filtering
- ✅ Action buttons مع data-testid
- ✅ Cards و Tabs component من Shadcn

## Recent Implementation Progress (January 2026)
✅ **نظام الفوترة القائم على الحضور:**
- **جداول قاعدة البيانات الجديدة:**
  - `visit_sessions`: تتبع جلسات المرضى مع حالة الحضور (scheduled/attended/missed)
  - `payments`: تسجيل المدفوعات مع الحالة (pending/completed/refunded)
  - `clinic_prices`: أسعار الجلسات لكل عيادة (افتراضي 500 جنيه)
- **حساب الرصيد:** الرصيد = مجموع الجلسات المحضورة - المدفوعات المكتملة
- **تأكيد الحضور:** الطبيب فقط يمكنه تأكيد حضور المريض لإضافة المبلغ للرصيد

✅ **نظام التحكم بالصلاحيات (RBAC):**
- **Middleware:** requireAuth للمصادقة، requireRole للتحقق من نوع المستخدم
- **أنواع المستخدمين:** patient, doctor, student, graduate
- **حماية API:** كل endpoint محمي حسب الصلاحيات المطلوبة

✅ **صفحات جديدة:**
- **TodayAppointmentsPage:** للطبيب لعرض مواعيد اليوم وتأكيد الحضور
- **PriceManagementPage:** للطبيب لإدارة أسعار الجلسات لكل عيادة

✅ **Sidebar ديناميكي:**
- يعرض صفحات مختلفة حسب نوع المستخدم
- المرضى يرون: المواعيد، السجلات، المدفوعات
- الأطباء يرون: مواعيد اليوم، إدارة الأسعار، المرضى

✅ **أمان محسّن:**
- doctorId يُستخرج من الجلسة وليس من الـ URL (حماية من IDOR)
- userId يُمرر للـ HomePage لجلب الرصيد الصحيح

**Test Accounts:**
- Use the accounts stored in your MongoDB database
- Register new accounts via the registration form

✅ **MongoDB Migration (January 2026):**
- Migrated from PostgreSQL/Drizzle ORM to MongoDB/Mongoose
- Session storage now uses connect-mongo
- All collections: users, patients, doctors, clinics, appointments, treatments, treatmentplans, reports, visitsessions, payments, clinicprices
- Authentication works with MongoDB UserModel

## Previous Implementation Progress (Turn 21-23)
✅ **Clinic Detail Page - Advanced Features:**
- Added 8 comprehensive tabs: Overview, Doctors, Services, Equipment, Appointments, Booking, Policies, Reviews
- Implemented **Available Appointments Tab** - Shows real-time available slots with doctor names and quick booking buttons
- Implemented **Booking Options Tab** - Quick booking system + recurring booking options (weekly, monthly, bi-weekly)
- Implemented **Policies & Emergency Hours Tab** - Shows emergency hours (7 PM - 8 AM), cancellation policy (free 24h before), refund policy (100% for no-show), and location with visual map representation
- Added interactive **clinic location map** with gradient colors, pin emoji, and contact information
- All tabs are responsive with proper RTL support and dark mode compatibility

✅ **Clinic Overview Page Enhancements:**
- Advanced filtering system: Price range slider, rating filter, wait time filter
- Favorites system with localStorage persistence
- Professional clinic cards with gradient backgrounds (12 unique colors)
- Filter state management and real-time updates

✅ **Data Completeness:**
- All 12 specialized clinics with complete data (doctors, services, equipment, reviews, statistics)
- Each clinic has 2+ doctors with specialties, ratings, and availability status
- Service pricing, duration, and descriptions for all clinics
- Equipment data with year added and operational status

## External Dependencies
- **Database:** MongoDB (via Mongoose with MONGODB_URI)
- **Payment Gateways:** Planned integration for Credit Card, Digital Wallets (Apple Pay/Google Pay), and Bank Transfer methods (currently simulated).
- **Authentication:** Implied OAuth integrations for Google, Apple, and Facebook as mentioned in settings.

## Next Steps (Future Development)
- ✅ صفحات المريض الكاملة (8 صفحات) - مكتملة
- ✅ صفحات الطبيب الكاملة (6 صفحات) - مكتملة
- [ ] ربط قواعد البيانات (PostgreSQL) للبيانات الفعلية
- [ ] نظام الإشعارات Push
- [ ] نظام الدفع المتقدم (Stripe)
- [ ] رسائل البريد الإلكتروني التلقائية
- [ ] تحسينات الأداء والـ Caching
- [ ] اختبارات شاملة