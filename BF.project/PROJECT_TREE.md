# BIAZ Finance - Project Tree

> **Visual project structure with descriptions**

---

## 📁 Complete Project Structure

```
BIAZ-Finance/
│
├── 📱 app/                                    # Application Routes (Expo Router)
│   ├── _layout.tsx                            # ⚙️  Root layout with React Query & navigation
│   ├── +not-found.tsx                         # 🚫 404 error screen
│   ├── index.tsx                              # 🏠 Main news feed screen (925 lines)
│   ├── profile.tsx                            # 👤 User profile & portfolio (755 lines)
│   └── settings.tsx                           # ⚙️  App settings (221 lines)
│
├── 🎨 constants/                              # Application Constants
│   ├── appColors.ts                           # ✨ NEW - Centralized color palette (50 lines)
│   ├── layout.ts                              # ✨ NEW - Spacing, dimensions, breakpoints (100 lines)
│   ├── typography.ts                          # ✨ NEW - Font system and presets (150 lines)
│   └── colors.ts                              # 🔒 Legacy - Original template colors (kept for reference)
│
├── 🗂️ mocks/                                  # Mock Data for Development
│   └── news.ts                                # 📰 NewsItem types & sample data (305 lines)
│
├── 🖼️ assets/                                 # Static Assets
│   └── images/                                # App icons and images
│       ├── icon.png                           # 📱 App icon (1024x1024)
│       ├── favicon.png                        # 🌐 Web favicon (48x48)
│       ├── splash-icon.png                    # 💦 Splash screen icon
│       └── adaptive-icon.png                  # 🤖 Android adaptive icon
│
├── 📚 Documentation/                          # ✨ NEW - Complete Documentation Suite
│   ├── QUICK_START_GUIDE.md                  # 🚀 Get started in 5 minutes (500 words)
│   ├── DEVELOPER_GUIDE.md                    # 💻 Daily development reference (2,000 words)
│   ├── DESIGN.md                              # 🎨 Complete design system (5,000 words)
│   ├── PROJECT_STRUCTURE.md                  # 📁 File organization (3,000 words)
│   ├── OPTIMIZATION_SUMMARY.md               # 📊 What was optimized (2,000 words)
│   ├── CHANGELOG.md                           # 📝 Version history (1,500 words)
│   ├── DOCUMENTATION_INDEX.md                # 📚 Documentation navigator (300 words)
│   └── PROJECT_TREE.md                        # 🌲 This file - Visual structure
│
├── ⚙️ Configuration Files
│   ├── app.json                               # 📱 Expo configuration
│   ├── package.json                           # 📦 Dependencies and scripts
│   ├── bun.lock                               # 🔒 Dependency lock file
│   ├── tsconfig.json                          # 🔷 TypeScript configuration
│   ├── eslint.config.js                       # ✅ ESLint rules
│   └── .gitignore                             # 🚫 Git ignore rules
│
└── 📖 README.md                               # Project overview and setup guide

```

---

## 📊 File Statistics

### Source Code

| Directory | Files | Lines | Purpose |
|-----------|-------|-------|---------|
| `app/` | 5 files | ~2,000 | Application screens and routes |
| `constants/` | 4 files | ~300 | Centralized constants (colors, layout, typography) |
| `mocks/` | 1 file | ~305 | Mock data for development |
| **Total** | **10 files** | **~2,605 lines** | **Core application code** |

### Documentation

| Directory | Files | Words | Purpose |
|-----------|-------|-------|---------|
| `📚 Docs` | 8 files | ~14,000 | Complete project documentation |

### Assets

| Directory | Files | Purpose |
|-----------|-------|---------|
| `assets/images/` | 4 files | App icons and images |

### Configuration

| Directory | Files | Purpose |
|-----------|-------|---------|
| `root/` | 6 files | Project configuration |

---

## 🎯 Key Features by File

### app/index.tsx (Main News Feed)

```
Features:
├── Vertical scrolling news feed
├── Full-screen news expansion (modal)
├── Horizontal stock carousel with pagination
├── AI impact predictions
├── Desktop split-screen layout
└── Gradient blur effects
```

### app/profile.tsx (User Profile)

```
Features:
├── User statistics (4 cards)
├── Interest tags
├── Portfolio management (add/remove stocks)
├── AI portfolio analysis
│   ├── Positive outlook insights
│   ├── Watch closely alerts
│   └── Risk alerts
└── AI recommendations
```

### app/settings.tsx (Settings)

```
Features:
├── Notification toggles
│   ├── News notifications
│   └── Price alerts
├── General settings
│   ├── Language selection
│   ├── Privacy settings
│   └── About info
└── Sign out button
```

---

## 🎨 Constants Architecture

### constants/appColors.ts

```
Exports:
├── dark: '#0c0c0c'      → Background
├── light: '#fbfbfb'     → Text
├── cardBg: '#1a1a1a'    → Cards
├── positive: '#10b981'  → Green (bullish)
├── negative: '#ef4444'  → Red (bearish)
└── neutral: '#6b7280'   → Gray (secondary)
```

### constants/layout.ts

```
Exports:
├── spacing              → 4px grid system (xs to xxxl)
├── borderRadius         → Border radius values (sm to round)
├── breakpoints          → Responsive breakpoints (mobile, tablet, desktop)
├── isDesktop()          → Desktop detection (≥1024px)
├── isTablet()           → Tablet detection (768px-1023px)
├── isMobile()           → Mobile detection (<768px)
├── newsCardLayout       → Mobile card proportions
└── desktopLayout        → Desktop layout ratios
```

### constants/typography.ts

```
Exports:
├── fontSize             → Semantic font sizes (display to tiny)
├── fontWeight           → Font weights with types (regular to bold)
├── lineHeight           → Optimal line heights
├── letterSpacing        → Letter spacing values
└── textPresets          → Reusable text style combinations
```

---

## 📚 Documentation Architecture

### Primary Documents

```
1. QUICK_START_GUIDE.md         → 5-minute setup
2. DEVELOPER_GUIDE.md           → Daily reference
3. DESIGN.md                    → Complete design system
4. PROJECT_STRUCTURE.md         → File organization
```

### Supporting Documents

```
5. OPTIMIZATION_SUMMARY.md      → What was done
6. CHANGELOG.md                 → Version history
7. DOCUMENTATION_INDEX.md       → Documentation navigator
8. PROJECT_TREE.md              → This file (visual structure)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      User Opens App                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              app/_layout.tsx (Root Layout)              │
│  • React Query Provider                                 │
│  • Gesture Handler                                      │
│  • Stack Navigator Setup                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 app/index.tsx (News Feed)               │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐│
│  │            │  │              │  │                 ││
│  │   News     │  │   Related    │  │    Impact       ││
│  │  Article   │  │   Stocks     │  │   Forecast      ││
│  │  (40%)     │  │   (15%)      │  │    (30%)        ││
│  │            │  │              │  │                 ││
│  └────────────┘  └──────────────┘  └─────────────────┘│
│                                                         │
│  Data Source: mocks/news.ts                            │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │Profile │  │Settings │  │Expanded  │
   │ Screen │  │ Screen  │  │ Modals   │
   └────────┘  └─────────┘  └──────────┘
```

---

## 🧩 Component Hierarchy

### Main Screen (index.tsx)

```
NewsFeedScreen
│
├── Header
│   ├── Settings Button (left)
│   ├── App Title "BIAZ Finance" (center)
│   └── Profile Button (right)
│
└── Content
    │
    ├── Mobile Layout (< 1024px)
    │   └── FlatList (vertical pagination)
    │       └── NewsCard (per item)
    │           ├── NewsWindow (40%)
    │           │   ├── Image
    │           │   ├── Gradient Overlay
    │           │   └── Text Content
    │           ├── StocksWindow (15%)
    │           │   ├── Title
    │           │   ├── Horizontal Carousel
    │           │   └── Pagination Dots
    │           └── PredictionsWindow (30%)
    │               ├── Title
    │               ├── Sentiment Badge
    │               ├── Short Analysis
    │               └── Tap Hint
    │
    └── Desktop Layout (≥ 1024px)
        └── FlatList (vertical scroll)
            └── DesktopNewsCard (per item)
                ├── Left (50%)
                │   └── NewsWindow (full height)
                └── Right (50%)
                    ├── StocksWindow (40%)
                    └── PredictionsWindow (60%)
```

---

## 🎨 Design System Hierarchy

```
Design System
│
├── Colors (appColors.ts)
│   ├── Base Colors
│   │   ├── dark
│   │   ├── light
│   │   └── cardBg
│   └── Semantic Colors
│       ├── positive
│       ├── negative
│       └── neutral
│
├── Layout (layout.ts)
│   ├── Spacing System
│   │   └── 4px baseline grid
│   ├── Border Radius
│   │   └── 8px to 999px
│   └── Breakpoints
│       ├── mobile: 0px
│       ├── tablet: 768px
│       └── desktop: 1024px
│
├── Typography (typography.ts)
│   ├── Font Sizes
│   │   └── 11px to 28px
│   ├── Font Weights
│   │   └── 400 to 700
│   └── Text Presets
│       └── Reusable combinations
│
└── Design Principles (7 rules)
    ├── 1. Mobile-First
    ├── 2. Dark Mode Default
    ├── 3. Semantic Colors
    ├── 4. Typography Hierarchy
    ├── 5. Consistent Spacing
    ├── 6. Gradient Overlays
    └── 7. Interactive Standards
```

---

## 🚀 Build Process

```
Development
│
├── Local Development
│   ├── bun start              → Start dev server
│   ├── bun run start-web      → Web preview
│   └── bun run lint           → Run ESLint
│
├── Testing
│   ├── Expo Go (iOS/Android) → Scan QR code
│   ├── iOS Simulator         → Mac only
│   ├── Android Emulator      → Any platform
│   └── Web Browser           → localhost:8081
│
└── Production Build
    ├── eas build --platform ios      → iOS build
    ├── eas build --platform android  → Android build
    ├── eas build --platform web      → Web build
    └── eas submit                    → Submit to stores
```

---

## 📦 Dependencies Tree

```
BIAZ Finance
│
├── Core
│   ├── react (19.0.0)
│   ├── react-native (0.79.1)
│   └── expo (53.0.4)
│
├── Navigation
│   ├── expo-router (5.0.3)
│   ├── @react-navigation/native
│   └── react-native-screens
│
├── State Management
│   ├── @tanstack/react-query (5.90.5)
│   └── zustand (5.0.2)
│
├── UI Components
│   ├── lucide-react-native (0.475.0)
│   ├── expo-linear-gradient
│   └── react-native-svg
│
├── Utilities
│   ├── @nkzw/create-context-hook
│   ├── @react-native-async-storage/async-storage
│   └── expo-haptics
│
└── Development
    ├── typescript (5.8.3)
    ├── eslint (9.31.0)
    └── @types/react
```

---

## 🔍 File Size Overview

```
Large Files (> 500 lines):
├── app/index.tsx              925 lines   ⭐ Main screen
├── app/profile.tsx            755 lines   ⭐ Portfolio
└── mocks/news.ts              305 lines   ⭐ Mock data

Medium Files (100-500 lines):
├── app/settings.tsx           221 lines
├── constants/typography.ts    150 lines
└── constants/layout.ts        100 lines

Small Files (< 100 lines):
├── app/_layout.tsx             72 lines
├── constants/appColors.ts      50 lines
└── app/+not-found.tsx          ~30 lines

Documentation (~ words):
├── DESIGN.md                  5,000 words   📚 Largest
├── PROJECT_STRUCTURE.md       3,000 words
├── DEVELOPER_GUIDE.md         2,000 words
├── OPTIMIZATION_SUMMARY.md    2,000 words
└── Others                     ~2,000 words
```

---

## 🎯 Import Graph

```
app/index.tsx
├── imports from @/constants/appColors    (inline definition)
├── imports from @/mocks/news             ✓
├── imports from react-native             ✓
├── imports from expo-router              ✓
├── imports from lucide-react-native      ✓
└── imports from expo-linear-gradient     ✓

app/profile.tsx
├── imports from @/constants/appColors    (inline definition)
├── imports from react-native             ✓
├── imports from expo-router              ✓
└── imports from lucide-react-native      ✓

app/settings.tsx
├── imports from @/constants/appColors    (inline definition)
├── imports from react-native             ✓
├── imports from expo-router              ✓
└── imports from lucide-react-native      ✓

Note: Screens currently use inline appColors definitions.
      Can migrate to import from @/constants/appColors (optional).
```

---

## 🌟 Key Achievements

```
✅ Complete Project Analysis
   └── All features and functions documented

✅ Centralized Constants
   ├── appColors.ts (50 lines)
   ├── layout.ts (100 lines)
   └── typography.ts (150 lines)

✅ Comprehensive Documentation
   ├── 8 documentation files
   └── ~14,000 words total

✅ Clear Code Organization
   ├── English comments added
   ├── Section markers
   └── Type definitions

✅ Scalable Architecture
   ├── Import alias system
   ├── Design system
   └── Best practices documented
```

---

## 📞 Quick Links

- **Start Developing**: [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- **Daily Reference**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Design System**: [DESIGN.md](./DESIGN.md)
- **File Organization**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **All Documentation**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

**End of Project Tree** 🌲

This visual representation provides a complete overview of the BIAZ Finance project structure, making it easy to understand the organization and navigate the codebase.
