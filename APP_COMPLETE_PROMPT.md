# Wardaty (وردية) - Complete Application Prompt

## Executive Summary
**Wardaty** is a comprehensive women's wellness super-app that combines menstrual cycle tracking, beauty routine management, Islamic fasting (Qada) tracking, and multi-generational family health management. Built with React, TypeScript, and Tailwind CSS, it features a sophisticated persona-based theming system that adapts the entire interface to match the user's life stage and needs.

---

## Application Overview

### Purpose
Wardaty empowers women to take control of their health, beauty, and spiritual wellness through intelligent tracking, personalized insights, and culturally-sensitive features designed specifically for Muslim women and their families.

### Target Audience
- **Primary**: Muslim women aged 15-45 across all life stages
- **Secondary**: Male partners supporting their significant other's health journey
- **Tertiary**: Mothers managing health for multiple daughters

### Unique Value Propositions
1. **Persona-Driven Experience**: Entire app theme changes based on life stage (Single, Married, Mother, Partner)
2. **Cultural Sensitivity**: Full RTL support, Arabic language, Hijri calendar integration
3. **Holistic Wellness**: Combines cycle tracking, beauty routines, fasting management, and family health
4. **Multi-Generational**: Mothers can track multiple daughters' cycles and health data
5. **Partner Inclusion**: Dedicated partner view with respectful, supportive interface

---

## Core Features

### 1. Menstrual Cycle Tracking
**Purpose**: Accurately predict and track menstrual cycles with intelligent insights

**Key Functionality**:
- Period start/end date logging
- Flow intensity tracking (Light, Medium, Heavy, Spotting)
- Cycle length calculation and prediction
- Ovulation and fertile window predictions
- PMS symptom tracking
- Mood and energy level logging
- Historical cycle calendar view
- Cycle statistics and trends

**Visual Design**:
- Calendar heat map showing period days in accent colors
- Progress rings for cycle phase visualization
- Color-coded phase indicators (Period: Red, Ovulation: Green, Fertile: Yellow, PMS: Purple)
- Smooth animations for date selection and phase transitions

### 2. Beauty Routine Management
**Purpose**: Track and optimize beauty routines based on cycle phase hormones

**Key Functionality**:
- Phase-specific beauty recommendations (Menstrual, Follicular, Ovulation, Luteal)
- Custom beauty categories (Skincare, Haircare, Nails, Body Care, Makeup)
- Routine scheduling with time-of-day preferences
- Product tracking with notes and images
- Completion logging and streak tracking
- Smart reminders based on cycle phase
- Beauty calendar with upcoming actions

**Visual Design**:
- Category cards with custom icons and colors
- Progress bars for routine completion
- Phase-specific gradient backgrounds
- Glass-morphism effects on action cards
- Smooth hover animations and transitions

### 3. Fasting (Qada) Tracker
**Purpose**: Help Muslim women track and complete missed fasting days

**Key Functionality**:
- Automatic Qada day calculation based on period history
- Manual adjustment for custom scenarios
- Day-by-day completion tracking
- Progress visualization
- Ramadan countdown integration
- Historical fasting logs
- Multi-year tracking

**Visual Design**:
- Circular progress indicator showing remaining days
- Calendar grid with completed/pending indicators
- Islamic-inspired color palette (emerald greens, golds)
- Hijri date display alongside Gregorian

### 4. Pregnancy & Postpartum Tracking
**Purpose**: Support pregnant women and new mothers with specialized tracking

**Key Functionality**:
- Pregnancy mode toggle
- Week-by-week pregnancy tracking
- Due date calculator (LMP or EDD method)
- Appointment scheduling
- Medication tracking
- Weight logging
- Pregnancy notes journal
- Postpartum recovery tracking
- Breastfeeding duration tracking

**Visual Design**:
- Baby growth visualization
- Week progress with milestone highlights
- Soft, nurturing color palette
- Calendar view with appointment markers

### 5. Mother's Features (Daughters Management)
**Purpose**: Enable mothers to track health data for multiple daughters

**Key Functionality**:
- Add/manage multiple daughter profiles
- Track each daughter's cycle independently
- Monitor cycle start age and development
- Pregnancy tracking for adult daughters
- Separate Qada tracking per daughter
- Privacy-focused daughter data management

**Visual Design**:
- Daughter profile cards with avatars
- Individual status indicators
- Multi-tab navigation for switching between daughters
- Color-coded data per daughter

### 6. Partner View
**Purpose**: Allow male partners to understand and support their partner's cycle

**Key Functionality**:
- Secure link sharing with privacy controls
- Cycle phase visualization (with optional details hiding)
- Mood and symptom insights
- Upcoming event alerts (period, ovulation)
- Shared calendar for appointments
- Privacy settings for sensitive data

**Visual Design**:
- Masculine color palette (deep blues, purples)
- Simplified, respectful interface
- Clear information hierarchy
- Educational tooltips about cycle phases

### 7. Health Insights & Analytics
**Purpose**: Provide actionable insights based on tracking data

**Key Functionality**:
- Cycle regularity analysis
- Symptom pattern recognition
- Mood trend visualization
- Beauty routine effectiveness tracking
- Correlations between cycle phase and mood/energy
- Exportable health reports
- PDF generation for doctor visits

**Visual Design**:
- Interactive charts using Recharts
- Gradient-filled area charts
- Bar charts for comparisons
- Trend lines with annotations
- Responsive dashboard layout

### 8. Articles & Educational Content
**Purpose**: Educate users about cycle health, beauty, and wellness

**Key Functionality**:
- Categorized articles (Cycle Health, Beauty, Pregnancy, Religious)
- Multilingual content (Arabic/English)
- Bookmarking system
- Search and filtering
- Reference links to medical sources

**Visual Design**:
- Magazine-style article cards
- High-quality imagery
- Readable typography with proper line spacing
- Category tags with color coding

---

## Persona System

### Persona 1: Single (أعزب)
**User Profile**: Young unmarried women (15-30 years old)

**Psychological Traits**: Self-discovery, personal growth, independence, optimism

**Primary Use Cases**:
- Track cycle for health awareness
- Build beauty routines
- Manage Qada fasting
- Learn about cycle health

**Color Palette**:
```css
--primary: hsl(335, 70%, 60%);        /* Romantic Rose Pink */
--primary-foreground: hsl(0, 0%, 100%);
--accent: hsl(280, 60%, 65%);         /* Soft Lavender Purple */
--accent-foreground: hsl(0, 0%, 100%);
```

**Gradients**:
- Primary: Rose pink to deep purple
- Accent: Soft lavender to light purple
- Glow: Pink radial (40% opacity)

**Visual Mood**: Youthful, vibrant, dreamy, empowering, blooming

**UI Characteristics**:
- Playful micro-interactions
- Gradient backgrounds on hero sections
- Soft shadows and rounded corners
- Emphasis on self-care features

---

### Persona 2: Married (متزوجة)
**User Profile**: Married women (25-40 years old)

**Psychological Traits**: Partnership, intimacy, balance, maturity

**Primary Use Cases**:
- Share cycle info with partner
- Track fertility for family planning
- Maintain beauty routines
- Coordinate schedules with partner

**Color Palette**:
```css
--primary: hsl(340, 75%, 65%);        /* Warm Coral Pink */
--primary-foreground: hsl(0, 0%, 100%);
--accent: hsl(20, 85%, 60%);          /* Golden Peach */
--accent-foreground: hsl(0, 0%, 100%);
```

**Gradients**:
- Primary: Coral pink to sunset orange
- Accent: Golden peach to warm amber
- Glow: Warm coral radial (40% opacity)

**Visual Mood**: Nurturing, connected, warm, intimate, glowing

**UI Characteristics**:
- Warm sunset-inspired transitions
- Partner sharing features prominent
- Sophisticated card designs
- Focus on fertility insights

---

### Persona 3: Mother (أم)
**User Profile**: Mothers with daughters (30-50 years old)

**Psychological Traits**: Caring, protective, organized, multi-tasking

**Primary Use Cases**:
- Manage own cycle and pregnancy
- Track multiple daughters' cycles
- Monitor postpartum recovery
- Coordinate family health appointments

**Color Palette**:
```css
--primary: hsl(150, 45%, 55%);        /* Sage Green */
--primary-foreground: hsl(0, 0%, 100%);
--accent: hsl(200, 60%, 60%);         /* Sky Blue */
--accent-foreground: hsl(0, 0%, 100%);
```

**Gradients**:
- Primary: Sage green to forest green
- Accent: Sky blue to ocean blue
- Glow: Gentle green radial (35% opacity)

**Visual Mood**: Calm, grounded, protective, peaceful, growth-oriented

**UI Characteristics**:
- Nature-inspired palette
- Multi-view dashboards (mother + daughters)
- Organized tabular layouts
- Practical, information-dense design

---

### Persona 4: Partner (شريك)
**User Profile**: Male partners (25-45 years old)

**Psychological Traits**: Supportive, understanding, respectful, curious

**Primary Use Cases**:
- Understand partner's cycle phases
- Receive mood and symptom insights
- Coordinate schedules
- Learn how to provide support

**Color Palette**:
```css
--primary: hsl(220, 70%, 55%);        /* Deep Ocean Blue */
--primary-foreground: hsl(0, 0%, 100%);
--accent: hsl(260, 60%, 60%);         /* Royal Purple */
--accent-foreground: hsl(0, 0%, 100%);
```

**Gradients**:
- Primary: Ocean blue to navy
- Accent: Royal purple to deep violet
- Glow: Blue radial (35% opacity)

**Visual Mood**: Strong, supportive, reliable, respectful, engaged

**UI Characteristics**:
- Masculine yet empathetic design
- Simplified interface (no TMI)
- Educational tooltips
- Clear call-to-actions for support

---

## Design System

### Typography
**Primary Font**: System default
- Arabic: Tajawal (weights 400-700)
- English: Inter/SF Pro (weights 400-700)

**Hierarchy**:
```css
/* Headings */
h1: 2.5rem (40px), font-weight: 700, line-height: 1.2
h2: 2rem (32px), font-weight: 600, line-height: 1.3
h3: 1.5rem (24px), font-weight: 600, line-height: 1.4
h4: 1.25rem (20px), font-weight: 500, line-height: 1.5

/* Body */
body: 1rem (16px), font-weight: 400, line-height: 1.6
small: 0.875rem (14px), font-weight: 400, line-height: 1.5
```

**RTL Support**: Full bidirectional text support with automatic icon flipping

---

### Color System

#### Semantic Tokens (Shared Across All Personas)
```css
/* Backgrounds */
--background: [persona-specific]
--foreground: [persona-specific]

/* UI Elements */
--card: [persona-specific]
--card-foreground: [persona-specific]
--popover: [persona-specific]
--popover-foreground: [persona-specific]

/* Interactive Elements */
--primary: [persona-specific]
--primary-foreground: [persona-specific]
--secondary: [persona-specific]
--secondary-foreground: [persona-specific]
--accent: [persona-specific]
--accent-foreground: [persona-specific]

/* Borders & Inputs */
--border: [persona-specific]
--input: [persona-specific]
--ring: [persona-specific]
```

#### Functional Colors (Same Across All Personas)
```css
/* Cycle Phases */
--period: hsl(0, 65%, 55%);        /* Red */
--ovulation: hsl(142, 70%, 45%);   /* Green */
--fertile: hsl(45, 90%, 55%);      /* Yellow */
--pms: hsl(280, 60%, 55%);         /* Purple */

/* System Feedback */
--success: hsl(142, 76%, 36%);
--warning: hsl(45, 93%, 47%);
--error: hsl(0, 84%, 60%);
--info: hsl(220, 70%, 55%);
```

---

### Component Styling

#### Cards
```css
/* Base Card */
border-radius: 12px;
background: hsl(var(--card));
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
padding: 1.5rem;
transition: all 0.2s ease;

/* Glass Card */
background: rgba(255,255,255,0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255,255,255,0.2);
```

#### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
color: hsl(var(--primary-foreground));
border-radius: 8px;
padding: 0.75rem 1.5rem;
font-weight: 500;
transition: all 0.2s ease;

/* Hover State */
transform: scale(1.02);
box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
```

#### Inputs
```css
/* Text Input */
border: 1px solid hsl(var(--border));
border-radius: 8px;
padding: 0.75rem 1rem;
background: hsl(var(--background));

/* Focus State */
border-color: hsl(var(--primary));
box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
```

---

### Iconography
**Library**: Lucide React
**Standard Size**: 24px (1.5rem)
**Weights**: Regular (2px stroke width)

**Icon Usage**:
- Navigation: Calendar, Home, User, Settings
- Actions: Plus, Check, X, Edit, Trash
- Status: CheckCircle, AlertCircle, Info
- Cycle: Circle, DropletIcon, Heart
- Beauty: Sparkles, Flower, Sun

---

### Shadows & Effects

```css
/* Elegant Shadow */
box-shadow: 0 10px 30px -10px hsl(var(--primary) / 0.3);

/* Glow Effect */
box-shadow: 0 0 40px hsl(var(--primary) / 0.4);

/* Glass Effect */
backdrop-filter: blur(8px);
background: rgba(255,255,255,0.1);
border: 1px solid rgba(255,255,255,0.2);

/* Subtle Inner Shadow */
box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
```

---

### Animations

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: fade-in 0.3s ease-out;

/* Scale In */
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
animation: scale-in 0.2s ease-out;

/* Hover Scale */
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}

/* Slide In */
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
animation: slide-in-right 0.3s ease-out;
```

---

## Key Screens & User Flows

### 1. Onboarding Flow
**Steps**:
1. **Welcome Screen**: App logo, tagline, "Get Started" CTA
2. **Persona Selection**: Choose from 4 personas with descriptions
3. **Language Selection**: Arabic or English
4. **Cycle Setup**: Enter last period start date and average cycle length
5. **Account Creation**: Email/password signup (auto-confirm enabled)

**Visual Design**:
- Full-screen immersive cards
- Progress dots at bottom
- Smooth page transitions
- Persona-specific colors preview on selection

---

### 2. Home Dashboard
**Layout**: 
- Top: Header with persona indicator, date, notifications
- Middle: Cycle status widget (large, prominent)
- Grid: 4-6 widgets (Beauty, Fasting, Mood, Predictions, etc.)
- Bottom: Navigation bar (5 icons)

**Widgets**:
- **Cycle Status**: Current phase, days until next period, progress ring
- **Beauty Actions**: Today's routines with completion checkboxes
- **Fasting Qada**: Days remaining, progress bar
- **Mood Tracker**: Quick mood logging
- **Upcoming Events**: Calendar appointments
- **Health Insights**: Latest predictions or tips

**Interactions**:
- Tap widget to expand to full feature
- Swipe to refresh data
- Long-press for quick actions

---

### 3. Calendar View
**Layout**:
- Month selector at top
- Calendar grid (7 columns × 5-6 rows)
- Day details sheet (bottom drawer)

**Visual Elements**:
- Period days: Red accent background
- Ovulation days: Green dot indicator
- Fertile window: Yellow tint
- PMS days: Purple tint
- Beauty actions: Small dot badge
- Appointments: Icon badge

**Interactions**:
- Tap day to open details sheet
- Swipe months left/right
- Pinch to zoom to year view
- Tap "Today" to return to current date

---

### 4. Beauty Planner
**Layout**:
- Phase tabs at top (Menstrual, Follicular, Ovulation, Luteal)
- Category cards (Skincare, Haircare, etc.)
- Action list per category
- Floating "Add Action" button

**Action Card**:
- Checkbox for completion
- Title and time of day
- Category icon and color
- Tap to expand for notes/products

**Interactions**:
- Swipe action to complete/delete
- Long-press to reschedule
- Drag to reorder
- Tap category to filter

---

### 5. Statistics & Insights
**Layout**:
- Time range selector (Week, Month, 3M, 6M, Year)
- Scrollable charts section
- Insight cards with recommendations

**Charts**:
- Cycle length line chart with trend
- Mood bar chart by phase
- Symptom frequency heatmap
- Beauty routine completion progress
- Weight tracking (if pregnant)

**Insights**:
- "Your cycles are getting more regular"
- "You tend to feel energetic during ovulation"
- "Skincare completion is highest on weekends"

---

### 6. Settings & Profile
**Sections**:
- **Account**: Name, email, password, delete account
- **Preferences**: Language, theme (light/dark), persona
- **Notifications**: Toggle for period reminders, beauty reminders, etc.
- **Privacy**: Partner sharing settings, data visibility
- **Cycle Settings**: Average length, period duration
- **Pregnancy Mode**: Toggle on/off, calculation method
- **Data Export**: Download CSV/PDF reports
- **Subscription**: Premium features (future)
- **About**: Version, privacy policy, terms, support

---

## Technical Architecture

### Frontend Stack
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM 6.x
- **Charts**: Recharts 2.x
- **Date Handling**: date-fns 4.x
- **Internationalization**: i18next + react-i18next

### Backend Stack (Lovable Cloud / Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (profile pictures, product images)
- **Edge Functions**: Deno-based serverless functions
- **Realtime**: Supabase Realtime for live updates

### Database Schema
**Core Tables**:
- `profiles`: User profile data (persona, theme, locale, pregnancy status)
- `cycles`: Menstrual cycle records (start_date, end_date, length)
- `cycle_days`: Daily logs (date, flow, mood, symptoms)
- `beauty_categories`: Custom beauty categories
- `beauty_actions`: Scheduled beauty routines
- `fasting_entries`: Qada fasting completion logs
- `daughters`: Daughter profiles for mother persona
- `daughter_cycles`: Cycle records for daughters
- `pregnancy_appointments`: Pregnancy-related appointments
- `pregnancy_medicines`: Medication tracking during pregnancy
- `pregnancy_weight_logs`: Weight tracking during pregnancy
- `pregnancy_notes`: Pregnancy journal entries
- `share_links`: Partner sharing links with privacy settings
- `articles`: Educational content
- `bookmarks`: User-saved articles

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Users can only access their own data
- Partners can access shared data based on privacy settings
- Mothers can access daughter data they created

### Authentication Flow
1. User signs up with email/password
2. Auto-confirm email (no verification required)
3. Profile created automatically in `profiles` table
4. Default persona set to "single"
5. User redirected to onboarding to set persona and cycle data

### Data Persistence Strategy
- **Local Storage**: Theme preference, language, last viewed date
- **Database**: All user data (cycles, beauty, fasting, etc.)
- **Caching**: React Query for optimistic updates and cache management
- **Sync**: Real-time updates for shared partner data

---

## User Experience Principles

### 1. Persona-First Design
Every screen adapts its colors, tone, and content based on the selected persona. The theme system is not just visual—it influences copy, feature prominence, and recommended actions.

### 2. Respectful Privacy
- Partner view respects user privacy with granular controls
- Option to hide specific symptoms or details
- No data shared without explicit consent
- Clear visual indicators when data is shared

### 3. Cultural Sensitivity
- Full RTL support for Arabic language
- Hijri calendar alongside Gregorian
- Islamic terminology (Qada, Ramadan, etc.)
- Modest color palette and imagery
- Prayer times integration (future feature)

### 4. Progressive Disclosure
- Start with simple tracking (cycle, mood)
- Gradually introduce advanced features (beauty phases, predictions)
- Contextual tooltips and onboarding hints
- "Learn More" links to articles

### 5. Accessibility
- WCAG AA color contrast ratios
- Keyboard navigation support
- Screen reader friendly labels
- Sufficient touch target sizes (44×44px minimum)
- Focus indicators on all interactive elements

### 6. Performance
- Lazy loading for images and heavy components
- Code splitting by route
- Optimistic UI updates
- Skeleton loaders for async content
- PWA capabilities for offline access

---

## Microinteractions & Delight

### Subtle Animations
- Button hover: Scale 1.02 + shadow increase
- Card hover: Lift effect with shadow
- Checkbox: Checkmark draw animation
- Toggle: Smooth slide with color transition
- Page transitions: Fade + slight vertical movement

### Haptic Feedback (Mobile)
- Checkbox completion
- Button press
- Error shake animation
- Success vibration

### Celebration Moments
- Cycle streak milestone (e.g., "10 cycles tracked!")
- Beauty routine completion streak
- All Qada days completed
- First partner connection

### Loading States
- Skeleton screens matching content layout
- Shimmer effect on placeholders
- Smooth transition to actual content
- Progress indicators for long operations

---

## Responsive Design

### Breakpoints
```css
sm: 640px    /* Small tablets */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach
- Base styles optimized for mobile (320px+)
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Bottom navigation on mobile, sidebar on desktop

### Tablet Adaptations (768px+)
- Two-column grid for widgets
- Larger calendar grid
- Sidebar navigation instead of bottom nav
- Modal dialogs instead of bottom sheets

### Desktop Enhancements (1024px+)
- Three-column dashboard layout
- Persistent sidebar with expanded labels
- Hover states and tooltips
- Keyboard shortcuts
- Multi-panel views (e.g., calendar + day details side-by-side)

---

## Content Strategy

### Tone of Voice
- **Empowering**: "You're in control of your health"
- **Supportive**: "We're here to help you understand your body"
- **Non-judgmental**: "Every body is different"
- **Educational**: "Did you know...?"
- **Celebratory**: "Amazing streak! Keep it up!"

### Persona-Specific Messaging
- **Single**: Focus on self-discovery, personal growth
- **Married**: Emphasize partnership, intimacy
- **Mother**: Highlight caregiving, multi-generational health
- **Partner**: Use supportive, educational language

### Error Messages
- Friendly and actionable
- Avoid technical jargon
- Suggest next steps
- Examples:
  - ❌ "Invalid date format"
  - ✅ "Please enter a date in the format DD/MM/YYYY"

---

## Future Roadmap

### Phase 2 Features (Next 3-6 Months)
- AI-powered cycle predictions using ML
- Symptom correlation insights
- Medication reminder system
- Export data to PDF for doctor visits
- Apple Health / Google Fit integration
- Push notifications for reminders
- Dark mode improvements
- More article content

### Phase 3 Features (6-12 Months)
- Community forum (anonymous)
- Chat with health experts
- Customizable widgets
- Smart watch app (Apple Watch, Wear OS)
- Telemedicine integration
- Fertility tracking with BBT
- Advanced analytics dashboard
- Subscription/Premium tier

### Phase 4 Features (12+ Months)
- AI chatbot for health questions
- Meal planning based on cycle phase
- Workout routines optimized for hormones
- Mental health tracking and resources
- Social sharing (anonymized insights)
- Multi-language support (Urdu, Turkish, French)
- White-label version for clinics

---

## Marketing & Positioning

### Key Messages
1. "Your wellness journey, personalized to your life stage"
2. "Track cycles, beauty, and fasting—all in one app"
3. "Designed by women, for women, with cultural respect"
4. "Empower your family's health across generations"
5. "Partner support made easy and respectful"

### Target Keywords
- Period tracker
- Menstrual cycle calendar
- Beauty routine planner
- Qada fasting tracker
- Pregnancy tracker
- Muslim women's health app
- Partner cycle sharing
- Family health management

### App Store Description
**Tagline**: Wellness, beauty, and spiritual health—unified.

**Description**:
Wardaty is the all-in-one wellness app designed specifically for Muslim women. Track your menstrual cycle with precision, plan beauty routines that sync with your hormones, manage missed fasting days (Qada), and even share insights with your partner—all with a culturally-sensitive, beautifully designed interface.

**Features**:
✨ Cycle tracking with smart predictions
💅 Beauty planner with phase-specific recommendations
🌙 Qada fasting tracker with automatic calculations
👶 Pregnancy & postpartum support
👩‍👧‍👧 Multi-daughter tracking for mothers
💑 Partner sharing with privacy controls
📊 Health insights and analytics
📚 Educational articles on cycle health

**Perfect for**:
- Single women starting their cycle tracking journey
- Married women coordinating with partners
- Mothers managing family health
- Partners supporting their significant other

Download Wardaty today and take control of your wellness with confidence!

### Social Media Content Ideas
- **Instagram**: Before/after beauty transformations by cycle phase
- **TikTok**: "What your cycle phase says about you" series
- **YouTube**: Tutorial videos on using features
- **Pinterest**: Infographics on cycle phases and beauty tips
- **Blog**: Long-form articles on women's health topics

---

## Brand Guidelines

### Logo
- **Name**: وردية (Wardaty)
- **Meaning**: "My Rose" or "Rose-like" in Arabic
- **Symbol**: Stylized rose icon with petals representing different life stages
- **Colors**: Adapts to selected persona

### Brand Personality
- **Elegant**: Sophisticated design with attention to detail
- **Feminine**: Soft colors, rounded shapes, gentle animations
- **Trustworthy**: Medical accuracy, privacy-focused
- **Cultural**: Respectful of Islamic values and practices
- **Modern**: Contemporary UI with latest design trends

### Visual Assets
- **Photography**: Diverse women across life stages, modest clothing
- **Illustrations**: Flat design with gradients, minimal and modern
- **Icons**: Lucide React library for consistency
- **Patterns**: Subtle floral or geometric backgrounds

---

## Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes, semantic tokens only
- **Testing**: Unit tests for utils, integration tests for flows
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Performance**: Code splitting, lazy loading, memoization

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI primitives
│   └── ...             # Feature components
├── contexts/           # React contexts (Auth, Theme, I18n)
├── hooks/              # Custom React hooks
├── integrations/       # Supabase client and types
├── lib/                # Utilities and helpers
├── pages/              # Route components
├── utils/              # Pure functions
└── main.tsx            # App entry point
```

### Git Workflow
- **Branches**: `main` (production), `develop` (staging), feature branches
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)
- **PRs**: Required for all changes, with code review
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)

### Deployment
- **Platform**: Lovable hosting (automatic deploys)
- **CI/CD**: GitHub Actions (linting, tests, build)
- **Environments**: Development, Staging, Production
- **Monitoring**: Sentry for error tracking, Analytics for usage

---

## AI Image Generation Prompts

### For Marketing Hero Images

**Single Persona**:
"Create a vibrant mobile app interface for a young Muslim woman's wellness app with romantic rose pink (hsl(335, 70%, 60%)) to soft lavender purple (hsl(280, 60%, 65%)) gradients. Show a cycle tracking calendar with elegant rounded corners, glass-morphism effects, and playful animations. The design should feel empowering, youthful, and optimistic with modern UI elements and soft shadows. Include subtle floral patterns and a dreamy atmosphere."

**Married Persona**:
"Design a warm mobile wellness app interface for married women with coral pink (hsl(340, 75%, 65%)) to golden peach (hsl(20, 85%, 60%)) sunset-inspired gradients. Feature a cycle tracker with partner sharing interface, sophisticated card designs, and intimate couple illustrations. The mood should be nurturing, connected, and mature with smooth color transitions and elegant glass effects."

**Mother Persona**:
"Illustrate a calm wellness app dashboard for mothers with sage green (hsl(150, 45%, 55%)) to sky blue (hsl(200, 60%, 60%)) nature-inspired palette. Display multi-generational cycle tracking (mother + daughters), pregnancy widgets, and organized family health data. Design should feel peaceful, protective, and practical with nature motifs and serene atmosphere."

**Partner Persona**:
"Create a supportive mobile app interface for male partners with deep ocean blue (hsl(220, 70%, 55%)) to royal purple (hsl(260, 60%, 60%)) gradients. Show a simplified cycle insights view with educational tooltips, clear information hierarchy, and respectful supportive design. The aesthetic should be masculine yet empathetic with strong, reliable visual language."

### For Feature Screens

**Beauty Planner**:
"Mobile app screen showing a beauty routine planner with phase-based categories (skincare, haircare, makeup). Use [persona-specific colors] with gradient backgrounds, glass-morphism cards, and completion checkboxes. Include time-of-day icons (morning, evening), product images, and smooth hover animations. Design should feel luxurious and organized."

**Cycle Calendar**:
"Interactive menstrual cycle calendar view with color-coded days: red for period, green for ovulation, yellow for fertile window, purple for PMS. Use [persona-specific primary color] for accents. Show current day highlighted, upcoming predictions, and subtle mood icons. Design with rounded corners, soft shadows, and modern calendar grid layout."

**Statistics Dashboard**:
"Analytics screen with beautiful gradient charts showing cycle trends, mood patterns, and health insights. Use [persona-specific colors] for data visualization with smooth area charts, bar graphs, and trend lines. Include insight cards with recommendations. Design should be clean, data-driven, and easy to understand."

---

## Accessibility Checklist

### Visual
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Text readable at 200% zoom
- [ ] Sufficient spacing between interactive elements
- [ ] Focus indicators visible on all focusable elements
- [ ] No information conveyed by color alone

### Interaction
- [ ] All functionality available via keyboard
- [ ] Tab order follows logical flow
- [ ] Skip navigation link present
- [ ] No keyboard traps
- [ ] Timing adjustable for auto-advancing content

### Content
- [ ] All images have descriptive alt text
- [ ] Headings used in correct hierarchical order
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and actionable
- [ ] Language declared in HTML

### Screen Reader
- [ ] ARIA labels for icon buttons
- [ ] ARIA live regions for dynamic content
- [ ] Status messages announced
- [ ] Landmarks used correctly (header, nav, main, footer)
- [ ] Hidden content properly marked

---

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Optimization Strategies
- Route-based code splitting
- Image lazy loading and WebP format
- Component-level lazy loading
- Debounced search inputs
- Virtual scrolling for long lists
- Service worker caching (PWA)
- CDN for static assets

---

## Security & Privacy

### Data Protection
- All passwords hashed with bcrypt
- HTTPS enforced for all connections
- Database connections encrypted
- RLS policies on all tables
- No PII in logs or analytics

### User Privacy Controls
- Granular sharing settings for partner view
- Option to hide specific symptoms/moods
- Data export available on request
- Account deletion removes all data
- No third-party data selling

### Compliance
- GDPR compliant (EU users)
- CCPA compliant (California users)
- Privacy policy and terms of service
- Cookie consent banner
- Data retention policies

---

## Support & Documentation

### In-App Help
- Contextual tooltips on first use
- "?" icons linking to help articles
- Search functionality in settings
- FAQ section
- Video tutorials (future)

### External Resources
- Documentation website
- Email support: support@wardaty.app
- Instagram: @wardaty.app
- TikTok: @wardaty.wellness
- YouTube: Wardaty Wellness

### Community
- Private Facebook group (future)
- Reddit community r/wardaty (future)
- Discord server for beta testers
- User feedback portal

---

## Success Metrics (KPIs)

### User Acquisition
- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- App Store downloads
- Conversion rate (download to signup)
- Referral rate

### Engagement
- Average session duration
- Sessions per user per week
- Feature adoption rate (beauty planner, partner sharing)
- Cycle logging consistency
- Article read rate

### Retention
- Day 1, Day 7, Day 30 retention
- Churn rate
- Re-engagement rate
- Persona switching frequency

### Revenue (Future)
- Premium subscription conversion
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)
- Churn rate by cohort

---

## Conclusion

Wardaty is more than a period tracker—it's a comprehensive wellness ecosystem that respects cultural values, adapts to life stages, and empowers women to take control of their health journey. With its persona-driven design, holistic feature set, and commitment to privacy, Wardaty stands out in a crowded market by truly understanding and serving the needs of Muslim women and their families.

**Vision**: To become the #1 trusted wellness companion for Muslim women worldwide, helping millions track, understand, and optimize their health across all life stages.

**Mission**: Empower women through culturally-sensitive, scientifically-accurate health tracking tools that respect their values and support their families.

---

*Last Updated: 2025-11-20*
*Version: 1.0.0*
*App: Wardaty (وردية) - Women's Wellness Tracker*
