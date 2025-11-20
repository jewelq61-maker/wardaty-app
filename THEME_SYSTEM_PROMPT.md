# Wardaty (وردية) Theme System - Complete Design Prompt

## App Overview
**Wardaty** is a comprehensive women's wellness application for tracking menstrual cycles, beauty routines, fasting (Qada), and family health management. The app serves four distinct user personas, each with a unique visual identity that reflects their life stage and needs.

---

## Design Philosophy
- **Elegant & Feminine**: Soft gradients, rounded corners, and gentle animations
- **Culturally Sensitive**: RTL support, Arabic typography, Islamic-friendly features
- **Persona-Driven**: Each user type has a distinct color palette that reflects their journey
- **Accessible**: High contrast ratios, clear hierarchy, semantic color usage
- **Modern**: Glass-morphism effects, smooth transitions, contemporary UI patterns

---

## Persona 1: Single (أعزب)
**Target User**: Young unmarried women focusing on self-care and personal growth

### Color Palette
- **Primary**: `hsl(335, 70%, 60%)` - Romantic Rose Pink
- **Primary Foreground**: `hsl(0, 0%, 100%)` - Pure White
- **Accent**: `hsl(280, 60%, 65%)` - Soft Lavender Purple
- **Accent Foreground**: `hsl(0, 0%, 100%)` - Pure White

### Gradients
- **Primary Gradient**: Rose pink to deep purple (`hsl(335, 70%, 60%)` → `hsl(280, 60%, 45%)`)
- **Accent Gradient**: Soft lavender to light purple (`hsl(280, 60%, 65%)` → `hsl(280, 60%, 75%)`)
- **Glow Effect**: Pink radial glow (`hsl(335, 70%, 60%)` with 40% opacity)

### Visual Characteristics
- Youthful and vibrant
- Dreamy purple-pink gradients
- Emphasis on self-discovery and personal beauty
- Light, airy interface with playful accents

### Mood & Feeling
Empowering, romantic, self-focused, optimistic, blooming

---

## Persona 2: Married (متزوجة)
**Target User**: Married women balancing partnership and personal wellness

### Color Palette
- **Primary**: `hsl(340, 75%, 65%)` - Warm Coral Pink
- **Primary Foreground**: `hsl(0, 0%, 100%)` - Pure White
- **Accent**: `hsl(20, 85%, 60%)` - Golden Peach
- **Accent Foreground**: `hsl(0, 0%, 100%)` - Pure White

### Gradients
- **Primary Gradient**: Coral pink to sunset orange (`hsl(340, 75%, 65%)` → `hsl(20, 85%, 50%)`)
- **Accent Gradient**: Golden peach to warm amber (`hsl(20, 85%, 60%)` → `hsl(30, 80%, 65%)`)
- **Glow Effect**: Warm coral radial glow (`hsl(340, 75%, 65%)` with 40% opacity)

### Visual Characteristics
- Warm and inviting
- Sunset-inspired color transitions
- Partnership and intimacy themes
- Sophisticated and mature aesthetic

### Mood & Feeling
Nurturing, connected, balanced, intimate, glowing

---

## Persona 3: Mother (أم)
**Target User**: Mothers managing family health, children's cycles, and postpartum recovery

### Color Palette
- **Primary**: `hsl(150, 45%, 55%)` - Sage Green
- **Primary Foreground**: `hsl(0, 0%, 100%)` - Pure White
- **Accent**: `hsl(200, 60%, 60%)` - Sky Blue
- **Accent Foreground**: `hsl(0, 0%, 100%)` - Pure White

### Gradients
- **Primary Gradient**: Sage green to forest green (`hsl(150, 45%, 55%)` → `hsl(150, 45%, 40%)`)
- **Accent Gradient**: Sky blue to ocean blue (`hsl(200, 60%, 60%)` → `hsl(200, 60%, 50%)`)
- **Glow Effect**: Gentle green radial glow (`hsl(150, 45%, 55%)` with 35% opacity)

### Visual Characteristics
- Calm and nurturing
- Nature-inspired palette
- Multi-generational care focus
- Organized and practical layout

### Mood & Feeling
Caring, grounded, protective, peaceful, growth-oriented

---

## Persona 4: Partner (شريك)
**Target User**: Male partners supporting their significant other's health journey

### Color Palette
- **Primary**: `hsl(220, 70%, 55%)` - Deep Ocean Blue
- **Primary Foreground**: `hsl(0, 0%, 100%)` - Pure White
- **Accent**: `hsl(260, 60%, 60%)` - Royal Purple
- **Accent Foreground**: `hsl(0, 0%, 100%)` - Pure White

### Gradients
- **Primary Gradient**: Ocean blue to navy (`hsl(220, 70%, 55%)` → `hsl(220, 70%, 40%)`)
- **Accent Gradient**: Royal purple to deep violet (`hsl(260, 60%, 60%)` → `hsl(260, 60%, 50%)`)
- **Glow Effect**: Blue radial glow (`hsl(220, 70%, 55%)` with 35% opacity)

### Visual Characteristics
- Strong and supportive
- Masculine yet empathetic design
- Clear information hierarchy
- Simplified interface focused on partner's cycle insights

### Mood & Feeling
Supportive, understanding, reliable, respectful, engaged

---

## Shared Design Elements

### Typography
- **Primary Font**: System default (Arabic: Tajawal, English: Inter/SF Pro)
- **Heading Weights**: 600-700 (semibold to bold)
- **Body Text**: 400-500 (regular to medium)
- **RTL Support**: Full bidirectional text support

### UI Components
- **Cards**: Rounded corners (12-16px), subtle shadows, glass-morphism effect
- **Buttons**: Rounded (8px), gradient backgrounds, smooth hover transitions
- **Inputs**: Soft borders, focus states with accent colors
- **Icons**: Lucide React icons with 24px standard size

### Shadows & Effects
- **Elegant Shadow**: `0 10px 30px -10px` with primary color at 30% opacity
- **Glow Effect**: `0 0 40px` with primary color at 40% opacity for light mode
- **Glass Effect**: `backdrop-blur-sm` with semi-transparent backgrounds

### Animations
- **Fade In**: 300ms ease-out from opacity 0 to 1
- **Hover Scale**: 200ms scale transform (1.02-1.05)
- **Smooth Transitions**: All interactive elements use `transition-all duration-200`

### Dark Mode Adjustments
- All colors maintain same hue but adjusted lightness
- Backgrounds: `hsl(222, 47%, 11%)` base
- Text contrast ratios meet WCAG AA standards
- Reduced glow effects for comfort

---

## Functional Color Tokens

### Status Colors (Same across all personas)
- **Period**: `hsl(0, 65%, 55%)` - Red
- **Ovulation**: `hsl(142, 70%, 45%)` - Green
- **Fertile**: `hsl(45, 90%, 55%)` - Yellow
- **PMS**: `hsl(280, 60%, 55%)` - Purple

### System Colors
- **Success**: `hsl(142, 76%, 36%)`
- **Warning**: `hsl(45, 93%, 47%)`
- **Error**: `hsl(0, 84%, 60%)`
- **Info**: `hsl(220, 70%, 55%)`

---

## Usage Examples

### For AI Image Generation:
"Create a mobile app interface for [persona name] with [primary color] and [accent color] gradients, featuring [persona mood], soft rounded corners, and [visual characteristics]. The design should feel [persona feeling] with modern glass-morphism effects."

### For Marketing Materials:
"Wardaty app serves four unique women: Single (romantic pink-purple), Married (warm coral-gold), Mother (calm sage-blue), and Partner (supportive navy-purple). Each persona has a distinct visual identity reflecting their wellness journey."

### For Developer Onboarding:
"Our theme system uses CSS variables that automatically switch based on `data-persona` attribute. Each persona has primary/accent colors, gradients, and shadows defined in index.css. Components use semantic tokens like `bg-primary` and `text-accent-foreground`."

---

## Technical Implementation
- **CSS Variables**: All colors defined as HSL CSS custom properties
- **Persona Switching**: `data-persona` attribute on `<html>` element
- **Tailwind Integration**: Extended theme in `tailwind.config.ts`
- **Dynamic Theming**: Context API (`ThemeContext`) manages persona state
- **Persistence**: Persona saved to localStorage and Supabase profiles table

---

## Brand Voice by Persona

**Single**: "Your journey, your beauty, your power. Bloom into your best self."

**Married**: "Together in wellness. Nurture your bond through every phase."

**Mother**: "Caring for generations. From pregnancy to motherhood, we're with you."

**Partner**: "Understanding her journey. Be the support she deserves."

---

*Last Updated: 2025-11-20*
*App: Wardaty (وردية) - Women's Wellness Tracker*
