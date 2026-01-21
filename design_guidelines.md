# Design Guidelines: Dental Hospital Management System

## Design Approach

**Selected Approach**: Design System (Material Design adapted for healthcare)
**Justification**: This is a utility-focused, information-dense medical application requiring stability, efficiency, and clear data hierarchy. Material Design provides robust patterns for dashboards, data tables, and form inputs essential for clinical environments.

**Key Design Principles**:
- Clinical efficiency and quick data access
- Clear information hierarchy for medical records
- Professional, trustworthy medical aesthetic
- RTL (Right-to-Left) layout for Arabic interface
- Accessibility for healthcare professionals across experience levels

---

## Core Design Elements

### A. Typography

**Font Family**: 
- Primary: 'Cairo' or 'IBM Plex Sans Arabic' (Google Fonts) for Arabic interface
- Fallback: System fonts

**Type Scale**:
- Page Headers: text-3xl md:text-4xl, font-bold (Medical record titles, dashboard headers)
- Section Headers: text-xl md:text-2xl, font-semibold (Clinic names, patient sections)
- Subsection Headers: text-lg, font-medium (Treatment plan sections, report categories)
- Body Text: text-base, font-normal (Patient details, medical descriptions)
- Small Text: text-sm (Metadata, timestamps, status labels)
- Micro Text: text-xs (Table headers, footnotes)

**Hierarchy Application**:
- Dashboard cards: Medium weight headers with regular body text
- Data tables: Bold column headers, regular row data
- Forms: Medium weight labels, regular inputs

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** (p-2, m-4, gap-6, space-y-8, py-12, px-16)

**Grid Structure**:
- Sidebar: Fixed 280px width (w-70) on desktop, collapsible on mobile
- Main Content: flex-1 with max-w-7xl container
- Cards Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

**Responsive Breakpoints**:
- Mobile: Single column, bottom navigation
- Tablet (md:): Two-column grids, side navigation appears
- Desktop (lg:): Full sidebar + multi-column data displays

**Container Structure**:
- Dashboard: Full-width sections with inner max-w-7xl
- Forms: max-w-2xl centered containers
- Data Tables: Full-width with horizontal scroll on mobile

---

### C. Component Library

#### 1. Login Page
- **Layout**: Centered card (max-w-md) on gradient medical background
- **User Type Selector**: Large radio button cards with icons (grid-cols-2 gap-4)
- **Form**: Generous spacing (space-y-6), large touch targets (h-12)
- **Submit Button**: Full width (w-full), prominent height (h-12)

#### 2. Dashboard Layout
- **Sidebar (RTL - Right side)**:
  - Fixed navigation with nested clinic menu
  - Active states with subtle background treatment
  - Icons with text labels (gap-3)
  - Collapsible clinic submenu (transition-all)
  
- **Top Navigation Bar**:
  - User profile dropdown (left side for RTL)
  - Notifications badge
  - Height: h-16
  - Shadow: shadow-md

- **Main Content Area**:
  - Stats Cards Grid: 3-4 columns showing key metrics (Recent Patients, Pending Reports, Today's Appointments)
  - Quick Actions: Prominent action buttons (gap-4)
  - Recent Activity Feed: List of latest updates

#### 3. Medical Clinics Section
- **Clinic Cards**: 
  - Grid layout (lg:grid-cols-2 xl:grid-cols-3)
  - Card structure: Icon + Title + Patient Count + Quick Actions
  - Hover elevation effect
  - Padding: p-6

- **Clinic Detail Page**:
  - Breadcrumb navigation (mb-6)
  - Tabs for different views (Patients / Treatment Plans / Reports)
  - Data table with sorting/filtering
  - Action buttons aligned to table

#### 4. Patient Management
- **Patient List Table**:
  - Columns: Patient ID, Name, Last Visit, Status, Actions
  - Row height: h-14 for comfortable scanning
  - Alternating row backgrounds for readability
  - Fixed header on scroll

- **Patient Detail View**:
  - Two-column layout (md:grid-cols-3)
  - Left: Patient info card (md:col-span-1)
  - Right: Tabbed content area (md:col-span-2) for Treatment Plans / Reports / History

#### 5. Treatment Plans
- **Plan Card Structure**:
  - Timeline visualization with vertical connector lines
  - Step cards (p-4 rounded-lg border)
  - Status indicators (badges)
  - Expandable details sections

#### 6. Reports Section
- **Report List**:
  - Card-based layout with preview
  - Date sorting and filtering
  - Category badges (Diagnosis / Progress / Final)
  
- **Report Detail**:
  - Full-width document view
  - Print/Export actions in header
  - Signature sections for approval workflow

#### 7. Forms
- **Consistent Form Pattern**:
  - Label above input (mb-2)
  - Input height: h-11
  - Focus states with border accent
  - Helper text below (text-sm, mt-1)
  - Form sections with dividers (border-t, pt-6, mt-6)

- **Required Field Indicator**: Asterisk (*) next to label
- **Error States**: Red border + error message below
- **Success States**: Green border with checkmark icon

#### 8. Data Visualization
- **Stats Cards**: Large number (text-3xl font-bold) + label + trend indicator
- **Charts**: Use chart.js for appointment trends, treatment statistics
- **Progress Bars**: For treatment plan completion

#### 9. Role-Based Elements
- **Doctor View**: Full CRUD controls, approval buttons
- **Student View**: Read + limited edit, submit for approval
- **Patient View**: Read-only with download capabilities
- **Access Denied State**: Clear messaging with appropriate icon

---

### D. Animations

**Minimal, Purpose-Driven Motion**:
- Page transitions: None (instant navigation for clinical efficiency)
- Sidebar toggle: transition-transform duration-300
- Dropdown menus: transition-all duration-200
- Modal overlays: Fade in (opacity) only
- Hover states: Subtle scale or shadow (no elaborate animations)
- Form validation: Immediate feedback without animation delays

**Avoid**: Scroll-triggered animations, loading spinners longer than 300ms, decorative motion

---

## Images

**Medical Context Imagery**:
1. **Login Page Background**: Subtle medical pattern or blurred dental clinic environment (low opacity overlay)
2. **Empty States**: Friendly medical illustrations (e.g., clipboard for no patients, calendar for no appointments)
3. **Patient Records**: Placeholder avatars (medical professional icons)
4. **Clinic Headers**: Small medical instrument icons representing each clinic type

**No Hero Images**: This is a dashboard application focused on data, not marketing

---

## RTL (Right-to-Left) Considerations

- Sidebar positioned on **right side**
- Text alignment: **text-right** by default
- Navigation icons on **left of text**
- Form labels **above inputs** (not left-aligned)
- Table actions column on **left side**
- Dropdown menus expand **leftward**
- Use `dir="rtl"` on HTML tag
- Mirror horizontal padding/margin as needed

---

## Accessibility & Clinical Standards

- High contrast text (WCAG AA minimum)
- Clear focus indicators for keyboard navigation
- ARIA labels for all interactive elements
- Error messages with sufficient color contrast
- Touch targets minimum 44x44px
- Consistent tab order through forms
- Screen reader support for data tables
- Success/error states with icons + text (not color alone)