# BIAZ Finance - Complete Files Index

> **Comprehensive index of every file in the project**

---

## 📑 Table of Contents

1. [Application Routes](#-application-routes-app)
2. [Constants](#-constants-constants)
3. [Mock Data](#-mock-data-mocks)
4. [Assets](#-assets-assets)
5. [Documentation](#-documentation)
6. [Configuration](#-configuration)

---

## 📱 Application Routes (`app/`)

### `app/_layout.tsx` (72 lines)

**Purpose**: Root layout component for the entire application

**Key Features**:
- React Query provider setup
- Gesture Handler configuration
- Stack navigator initialization
- Splash screen handling

**Exports**: `RootLayout` (default), `RootLayoutNav`

**Dependencies**:
- `@tanstack/react-query`
- `expo-router`
- `expo-splash-screen`
- `react-native-gesture-handler`

**When to Edit**: Changing global providers, navigation structure

---

### `app/index.tsx` (925 lines) ⭐ MAIN SCREEN

**Purpose**: Main news feed screen with AI predictions

**Key Features**:
- Vertical scrolling news feed
- Horizontal stock carousel with pagination
- AI impact predictions
- Full-screen news expansion (modal)
- Full-screen prediction expansion (modal)
- Desktop split-screen layout (≥1024px)
- Gradient blur effects

**Components**:
- `NewsCard` - Mobile news card (lines 87-523)
- `DesktopNewsCard` - Desktop news card (lines 526-912)
- `NewsFeedScreen` - Main screen component (lines 915-1028)

**State Management**:
- `isExpanded` - News modal visibility
- `isPredictionExpanded` - Prediction modal visibility
- `currentStockIndex` - Stock carousel pagination

**Styling**:
- 113 style definitions (lines 1030-1442)
- Mobile and desktop responsive styles

**When to Edit**: Changing news feed layout, card design, modals

---

### `app/profile.tsx` (755 lines) ⭐ PORTFOLIO

**Purpose**: User profile and portfolio management screen

**Key Features**:
- User statistics (news read, saved, accuracy, achievements)
- Interest tags/categories
- Portfolio stock management (add/remove)
- AI portfolio analysis with insights
- Risk alerts and recommendations

**Modals**:
- Portfolio management modal (lines 290-333)
- Add stock form modal (lines 338-395)

**State Management**:
- `isPortfolioModalVisible` - Portfolio modal
- `isAddStockModalVisible` - Add stock form
- `portfolioStocks` - User's stock positions
- `newStock` - Form state for adding stocks

**Sections**:
1. User header (lines 113-124)
2. Statistics (lines 129-164)
3. Interests (lines 169-187)
4. Portfolio (lines 192-210)
5. Portfolio Analysis (lines 215-279)

**When to Edit**: Changing profile layout, portfolio features, AI insights

---

### `app/settings.tsx` (221 lines)

**Purpose**: Application settings and preferences

**Key Features**:
- Notification toggles (news alerts, price alerts)
- General settings (language, privacy, about)
- Sign out functionality

**State Management**:
- `notificationsEnabled` - News notifications toggle
- `priceAlertsEnabled` - Price alerts toggle

**Sections**:
1. Notifications (lines 62-101)
2. General settings (lines 106-147)
3. Sign out (lines 150-153)

**When to Edit**: Adding new settings, changing preferences

---

### `app/+not-found.tsx` (~30 lines)

**Purpose**: 404 error screen for invalid routes

**Key Features**:
- Displays when user navigates to non-existent route
- Link to return to home screen

**When to Edit**: Customizing error page design

---

## 🎨 Constants (`constants/`)

### `constants/appColors.ts` (50 lines) ✨ NEW

**Purpose**: Centralized color palette for the entire app

**Exports**:
```typescript
appColors = {
  dark: '#0c0c0c',      // Background
  light: '#fbfbfb',     // Text
  cardBg: '#1a1a1a',    // Cards
  positive: '#10b981',  // Green - Bullish
  negative: '#ef4444',  // Red - Bearish
  neutral: '#6b7280',   // Gray - Secondary
}
```

**Type Export**: `AppColors`

**Usage**: Import in any component for consistent colors

**When to Edit**: Adding new colors, changing theme

**Related Docs**: DESIGN.md → Color Palette

---

### `constants/layout.ts` (100 lines) ✨ NEW

**Purpose**: Layout dimensions, spacing, and responsive utilities

**Exports**:

**Spacing System** (4px grid):
```typescript
spacing = {
  xs: 4, sm: 8, md: 12, lg: 16,
  xl: 20, xxl: 24, xxxl: 32
}
```

**Border Radius**:
```typescript
borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20,
  xxl: 24, round: 999
}
```

**Breakpoints**:
```typescript
breakpoints = {
  mobile: 0, tablet: 768, desktop: 1024
}
```

**Utilities**:
- `getScreenDimensions()` - Current screen size
- `isDesktop()` - Detects desktop (≥1024px)
- `isTablet()` - Detects tablet (768-1023px)
- `isMobile()` - Detects mobile (<768px)

**Constants**:
- `SCREEN_WIDTH` - Current screen width
- `SCREEN_HEIGHT` - Current screen height
- `newsCardLayout` - Mobile card proportions
- `desktopLayout` - Desktop layout ratios

**When to Edit**: Changing spacing system, breakpoints

**Related Docs**: DESIGN.md → Layout System

---

### `constants/typography.ts` (150 lines) ✨ NEW

**Purpose**: Typography system with font sizes, weights, and presets

**Exports**:

**Font Sizes**:
```typescript
fontSize = {
  display: 28, heading1: 24, heading2: 22,
  heading3: 20, heading4: 18, body: 17,
  bodyLarge: 16, bodySmall: 14, caption: 13,
  small: 12, tiny: 11
}
```

**Font Weights** (with TypeScript types):
```typescript
fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
}
```

**Line Heights**: Calculated for optimal readability

**Letter Spacing**: tight, normal, wide, wider

**Text Presets**: Reusable combinations
```typescript
textPresets = {
  displayTitle, heading1, heading2, heading3,
  body, bodyBold, caption, small, badge
}
```

**When to Edit**: Changing font system, adding presets

**Related Docs**: DESIGN.md → Typography

---

### `constants/colors.ts` (22 lines) 🔒 LEGACY

**Purpose**: Original Expo template color scheme

**Status**: Not in active use, kept for reference

**Exports**: Light theme colors (text, background, tint)

**When to Edit**: If implementing theme switching

---

## 🗂️ Mock Data (`mocks/`)

### `mocks/news.ts` (305 lines) ⭐ DATA

**Purpose**: Type definitions and sample news data

**Type Exports**:

**NewsItem**:
```typescript
type NewsItem = {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string;
  source: string;
  timestamp: string;
  relatedStocks: Stock[];
  prediction: Prediction;
}
```

**Stock**:
```typescript
type Stock = {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangeValue: number;
}
```

**Prediction**:
```typescript
type Prediction = {
  sentiment: 'positive' | 'negative' | 'neutral';
  shortAnalysis: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  keyPoints: string[];
}
```

**Data Export**:
- `mockNewsData` - Array of 5 sample news items

**Sample News**:
1. Apple Vision Pro 2 launch
2. Tesla production record
3. Federal Reserve rate cuts
4. NVIDIA AI chip launch
5. Amazon cloud expansion

**When to Edit**: Adding/removing mock data, changing types

**Future**: Replace with API calls using React Query

---

## 🖼️ Assets (`assets/`)

### `assets/images/icon.png`

**Purpose**: Main app icon (1024x1024)

**Used For**:
- iOS app icon
- Android app icon
- App Store/Play Store listing

**Format**: PNG, 1024x1024px

---

### `assets/images/favicon.png`

**Purpose**: Web browser favicon (48x48)

**Used For**: Browser tab icon for web version

**Format**: PNG, 48x48px

---

### `assets/images/splash-icon.png`

**Purpose**: Splash screen icon

**Used For**: App loading screen

**Format**: PNG, varies by platform

---

### `assets/images/adaptive-icon.png`

**Purpose**: Android adaptive icon

**Used For**: Modern Android launcher icons

**Format**: PNG with transparency

---

## 📚 Documentation

### `QUICK_START_GUIDE.md` (500 words) 🚀

**Purpose**: Get started in 5 minutes

**Sections**:
- Installation
- Testing on devices
- Using design system
- Project structure
- Common tasks
- Key features

**Target Audience**: New developers

---

### `DEVELOPER_GUIDE.md` (2,000 words) 💻

**Purpose**: Daily development reference

**Sections**:
- Documentation overview
- Quick commands
- Design system reference
- File organization
- Common development tasks
- Code style guidelines
- Best practices
- Troubleshooting
- Pre-commit checklist

**Target Audience**: All developers

---

### `DESIGN.md` (5,000 words) 🎨 ⭐ COMPREHENSIVE

**Purpose**: Complete design system and architecture

**Sections**:
1. Overview
2. Project Architecture
3. Design System
4. Color Palette
5. Typography
6. Component Structure
7. Layout System
8. Code Organization
9. Development Guidelines
10. Design Principles

**Target Audience**: Designers, developers, architects

---

### `PROJECT_STRUCTURE.md` (3,000 words) 📁

**Purpose**: Detailed project organization

**Sections**:
- Directory structure
- Module organization
- Import alias system
- State management
- Data flow
- Adding new features
- Code review checklist

**Target Audience**: All team members

---

### `OPTIMIZATION_SUMMARY.md` (2,000 words) 📊

**Purpose**: Overview of optimization work

**Sections**:
- Optimization goals
- What was done
- Before/after comparison
- New constant files
- Migration guide
- UI structure
- Next steps

**Target Audience**: Project managers, stakeholders

---

### `CHANGELOG.md` (1,500 words) 📝

**Purpose**: Version history and changes

**Sections**:
- Version 1.0.0 details
- What was added
- What was changed
- What was improved
- Migration guide
- Contributors

**Target Audience**: All team members

---

### `DOCUMENTATION_INDEX.md` (300 words) 📚

**Purpose**: Navigate all documentation

**Sections**:
- All documentation files
- Quick navigation by role
- Detailed file descriptions
- Learning paths
- Search guide

**Target Audience**: Everyone

---

### `PROJECT_TREE.md` (400 words) 🌲

**Purpose**: Visual project structure

**Sections**:
- Complete project tree (ASCII)
- File statistics
- Features by file
- Constants architecture
- Data flow diagram
- Component hierarchy

**Target Audience**: Visual learners

---

### `PROJECT_CARD.md` (200 words) 🎯

**Purpose**: Quick reference card

**Sections**:
- Project overview
- Quick start
- Statistics
- Design system
- Tech stack
- Features
- Common commands

**Target Audience**: Quick reference

---

### `FILES_INDEX.md` (This file) 📑

**Purpose**: Complete files index

**Sections**: Index of every file with details

**Target Audience**: Everyone

---

## ⚙️ Configuration

### `app.json` (42 lines)

**Purpose**: Expo configuration

**Key Settings**:
- App name: "News Feed App"
- Slug: "news-feed-app"
- Version: "1.0.0"
- Orientation: portrait
- New Architecture: enabled
- Platform-specific settings (iOS, Android, Web)

**When to Edit**: Changing app metadata, plugins, build settings

---

### `package.json` (59 lines)

**Purpose**: Project dependencies and scripts

**Scripts**:
- `start` - Start dev server
- `start-web` - Start web preview
- `lint` - Run ESLint

**Key Dependencies**:
- expo (53.0.4)
- react-native (0.79.1)
- expo-router (5.0.3)
- typescript (5.8.3)
- @tanstack/react-query (5.90.5)
- lucide-react-native (0.475.0)

**When to Edit**: Adding/removing packages, changing scripts

---

### `bun.lock`

**Purpose**: Dependency lock file for Bun

**Auto-generated**: Don't edit manually

**When to Update**: Runs automatically when installing packages

---

### `tsconfig.json` (17 lines)

**Purpose**: TypeScript configuration

**Key Settings**:
- Extends: expo/tsconfig.base
- Strict mode: enabled
- Paths: `@/*` alias to root

**When to Edit**: Changing TypeScript settings, paths

---

### `eslint.config.js`

**Purpose**: ESLint configuration

**Preset**: expo linting rules

**When to Edit**: Adding custom ESLint rules

---

### `.gitignore`

**Purpose**: Git ignore rules

**Ignores**:
- node_modules/
- .expo/
- dist/
- .env files
- OS files (.DS_Store)

**When to Edit**: Adding new files to ignore

---

## 📊 Summary Statistics

| Category | Files | Lines/Words | Purpose |
|----------|-------|-------------|---------|
| **App Routes** | 5 | ~2,000 lines | Screens and navigation |
| **Constants** | 4 | ~300 lines | Design system |
| **Mocks** | 1 | ~305 lines | Sample data |
| **Assets** | 4 | Binary | Icons and images |
| **Documentation** | 10 | ~14,000 words | Complete guides |
| **Configuration** | 6 | ~200 lines | Project setup |
| **TOTAL** | **30 files** | **~16,800 combined** | **Complete project** |

---

## 🎯 File Relationships

```
app/index.tsx
  ↓ imports
mocks/news.ts (NewsItem, mockNewsData)
  ↓ can import
constants/appColors.ts
constants/layout.ts
constants/typography.ts

app/profile.tsx
  ↓ can import
constants/appColors.ts
constants/layout.ts
constants/typography.ts

app/settings.tsx
  ↓ can import
constants/appColors.ts
constants/layout.ts
constants/typography.ts
```

---

## 🔍 Finding Files

### By Purpose

| Need | Check File |
|------|-----------|
| **Colors** | constants/appColors.ts |
| **Spacing** | constants/layout.ts |
| **Fonts** | constants/typography.ts |
| **Mock data** | mocks/news.ts |
| **News feed** | app/index.tsx |
| **Portfolio** | app/profile.tsx |
| **Settings** | app/settings.tsx |
| **Navigation** | app/_layout.tsx |
| **Configuration** | app.json, package.json |

### By Size

**Large (>500 lines)**:
- app/index.tsx (925)
- app/profile.tsx (755)
- mocks/news.ts (305)

**Medium (100-500)**:
- app/settings.tsx (221)
- constants/typography.ts (150)
- constants/layout.ts (100)

**Small (<100)**:
- app/_layout.tsx (72)
- constants/appColors.ts (50)
- Configuration files

---

## 📝 Editing Guidelines

### Before Editing Any File

1. **Read related documentation** (DESIGN.md, PROJECT_STRUCTURE.md)
2. **Understand file purpose** (check this index)
3. **Check dependencies** (what imports this file)
4. **Follow code style** (TypeScript strict, English comments)
5. **Test changes** (iOS, Android, Web)

### After Editing

1. **Update documentation** if needed
2. **Add changelog entry** for significant changes
3. **Run linter** (`bun run lint`)
4. **Test thoroughly**
5. **Commit with clear message**

---

## 🔗 Quick Navigation

- **Start Here**: [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- **Daily Work**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Design System**: [DESIGN.md](./DESIGN.md)
- **All Docs**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **Visual Tree**: [PROJECT_TREE.md](./PROJECT_TREE.md)
- **Quick Card**: [PROJECT_CARD.md](./PROJECT_CARD.md)

---

**Last Updated**: January 2025  
**Total Files Indexed**: 30  
**Status**: ✅ Complete

---

**This index provides a complete reference to every file in the BIAZ Finance project.** 📑
