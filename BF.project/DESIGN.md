# BIAZ Finance - Design System & Architecture Documentation

> **Last Updated**: January 2025  
> **Version**: 1.0.0  
> **App Name**: BIAZ Finance

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Design System](#design-system)
4. [Color Palette](#color-palette)
5. [Typography](#typography)
6. [Component Structure](#component-structure)
7. [Layout System](#layout-system)
8. [Code Organization](#code-organization)
9. [Development Guidelines](#development-guidelines)

---

## 🎯 Overview

**BIAZ Finance** is a financial news aggregation app with AI-powered stock impact predictions. The app provides:

- **Real-time financial news** with curated imagery
- **Related stock tracking** with price changes
- **AI-powered impact forecasts** for each news item
- **Portfolio management** with personalized insights
- **Cross-platform support** (iOS, Android, Web)

### Key Features

1. **News Feed** - Vertical scrolling news with full-screen expansion
2. **Stock Carousel** - Horizontal paginated stock information per news
3. **Impact Predictions** - AI-generated forecasts and recommendations
4. **Portfolio Tracking** - User stock positions with AI insights
5. **Desktop Optimization** - Split-screen layout for larger screens

---

## 🏗️ Project Architecture

### Technology Stack

```
React Native (0.79.1) + Expo (53.0.4)
├── expo-router (5.0.3)        - File-based navigation
├── @tanstack/react-query      - Server state management
├── expo-linear-gradient       - Gradient effects
├── lucide-react-native        - Icon library
└── TypeScript (5.8.3)         - Type safety
```

### File Structure

```
BIAZ Finance/
│
├── app/                          # Routes (expo-router)
│   ├── _layout.tsx               # Root layout with React Query & navigation
│   ├── index.tsx                 # Main news feed screen
│   ├── profile.tsx               # User profile & portfolio management
│   └── settings.tsx              # App settings & preferences
│
├── constants/
│   └── colors.ts                 # Color constants (legacy, not in active use)
│
├── mocks/
│   └── news.ts                   # Mock news data with TypeScript types
│
├── assets/                       # Static assets (images, icons)
│
├── DESIGN.md                     # This file - design system documentation
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── app.json                      # Expo configuration
└── README.md                     # Project readme
```

### Navigation Structure

```
Stack Navigator (app/_layout.tsx)
├── index          → News Feed (Main Screen)
├── profile        → User Profile & Portfolio
└── settings       → App Settings
```

**No tabs** - Simple stack-based navigation optimized for full-screen news experience.

---

## 🎨 Design System

### Design Philosophy

BIAZ Finance follows a **dark-first, minimalist financial UI** approach:

- **Dark background** (#0c0c0c) - Reduces eye strain, focuses attention on content
- **High contrast text** (#fbfbfb) - Ensures readability
- **Semantic colors** - Green (positive), Red (negative), Gray (neutral)
- **Card-based layout** - Clear information hierarchy
- **Mobile-native interactions** - Swipe, tap, paginate

### Visual Hierarchy

1. **Primary content**: News images with gradient overlays
2. **Secondary content**: Stock information in compact cards
3. **Tertiary content**: AI predictions with visual sentiment indicators

---

## 🌈 Color Palette

### Core Colors

```typescript
const appColors = {
  dark: '#0c0c0c',      // Background - Deep black
  light: '#fbfbfb',     // Text - Off-white
  cardBg: '#1a1a1a',    // Card backgrounds - Dark gray
  
  // Semantic Colors
  positive: '#10b981',  // Green - Positive changes, bullish sentiment
  negative: '#ef4444',  // Red - Negative changes, bearish sentiment
  neutral: '#6b7280',   // Gray - Neutral data, secondary text
} as const;
```

### Usage Rules

#### ✅ DO
- Use `appColors.positive` for price increases, positive sentiment, success states
- Use `appColors.negative` for price decreases, negative sentiment, errors
- Use `appColors.neutral` for timestamps, descriptions, inactive elements
- Use `appColors.dark` for backgrounds
- Use `appColors.light` for primary text
- Use `appColors.cardBg` for cards, modals, elevated surfaces

#### ❌ DON'T
- Mix semantic colors (e.g., green for negative sentiment)
- Use custom hex colors - always reference `appColors`
- Use pure black (#000) or pure white (#fff) - use dark/light instead
- Add purple, blue, or other accent colors unless explicitly requested

### Color Transparency

```typescript
// Overlay backgrounds
'rgba(12, 12, 12, 0.6)'     // Semi-transparent dark (buttons)
'rgba(12, 12, 12, 0.8)'     // Opaque dark (modals)

// Sentiment backgrounds
`${appColors.positive}20`   // 20% opacity green (positive areas)
`${appColors.negative}20`   // 20% opacity red (negative areas)
```

---

## ✍️ Typography

### Font Weights

```typescript
fontWeight: '400' as const  // Regular - Body text, descriptions
fontWeight: '500' as const  // Medium - Buttons, labels
fontWeight: '600' as const  // Semi-bold - Subheadings, important data
fontWeight: '700' as const  // Bold - Headlines, titles, emphasis
```

### Font Sizes

```typescript
// Headlines
fontSize: 28               // Expanded news title
fontSize: 24               // App title, modal titles
fontSize: 22               // Section titles

// Body
fontSize: 20               // News card title
fontSize: 18               // Stock symbols, insight titles
fontSize: 17               // Button text, primary labels
fontSize: 16               // Standard body text, descriptions

// Small
fontSize: 14               // Secondary text, stock details
fontSize: 13               // Setting descriptions
fontSize: 12               // Timestamps, meta info
fontSize: 11               // Small badges
```

### Text Colors

```typescript
// Primary text
color: appColors.light        // Main content

// Secondary text  
color: 'rgba(251, 251, 251, 0.8)'  // Slightly dimmed
color: '#aaa'                       // Descriptions
color: appColors.neutral            // Timestamps, labels

// Emphasis
color: appColors.positive          // Source tags, positive data
color: appColors.negative          // Errors, alerts
```

---

## 🧩 Component Structure

### Screen Components

#### 1. **NewsFeedScreen** (`app/index.tsx`)

**Purpose**: Main screen displaying financial news in vertical scroll.

**Layout**:
- **Mobile**: Full-screen vertical pagination (1 news = 1 screen)
- **Desktop**: Split-screen (news left, stocks + predictions right)

**Sub-components**:
- `NewsCard` - Mobile news item with 3 sections (news 40%, stocks 15%, predictions 30%)
- `DesktopNewsCard` - Desktop optimized layout with side panels

**State**:
- `isExpanded` - Controls full-screen news modal
- `isPredictionExpanded` - Controls full-screen prediction modal
- `currentStockIndex` - Tracks stock carousel pagination

#### 2. **ProfileScreen** (`app/profile.tsx`)

**Purpose**: User profile, statistics, and portfolio management.

**Sections**:
1. User header (avatar, name, email)
2. Statistics (4 cards: news read, saved, forecast accuracy, achievements)
3. Interests (tags/chips)
4. Portfolio (manage stocks modal)
5. Portfolio Analysis (AI insights with recommendations)

**State**:
- `isPortfolioModalVisible` - Portfolio management modal
- `isAddStockModalVisible` - Add stock form modal
- `portfolioStocks` - User's stock positions
- `newStock` - Form state for adding stocks

#### 3. **SettingsScreen** (`app/settings.tsx`)

**Purpose**: App settings and preferences.

**Sections**:
1. Notifications (toggle switches)
2. General (language, privacy, about)
3. Sign out button

**State**:
- `notificationsEnabled` - News notifications toggle
- `priceAlertsEnabled` - Price alerts toggle

---

## 📐 Layout System

### Mobile Layout (< 1024px)

#### News Card Proportions

```
Screen Height: 100%
├── Header: 110px (fixed)
├── News Window: ~40% (flex: 1)
├── Stocks Window: 110px (fixed)
└── Predictions Window: 220px (fixed)
```

#### Spacing

```typescript
paddingHorizontal: 16        // Screen edges
marginBottom: 12             // Card gaps
borderRadius: 24             // Large cards
borderRadius: 12             // Small cards, buttons
gap: 8                       // Element gaps
```

#### Safe Area Handling

```typescript
// Always use safe area insets for:
const insets = useSafeAreaInsets();

// 1. Expanded modals (avoid notch/status bar)
{ height: insets.top + 20 }  // Top spacer
{ top: insets.top + 30 }     // Close button

// 2. Header positioning
{ top: insets.top + 10 }     // Header container
```

### Desktop Layout (≥ 1024px)

#### Split-Screen Structure

```
Screen (100%)
├── Left (50%): News feed (vertical scroll)
└── Right (50%): 
    ├── Related Stocks (40%)
    └── Impact Forecast (60%)
```

#### Detection

```typescript
const isDesktop = () => Platform.OS === 'web' && Dimensions.get('window').width >= 1024;
```

---

## 🗂️ Code Organization

### Naming Conventions

#### Components

```typescript
// PascalCase for components
function NewsFeedScreen() {}
function NewsCard() {}
function DesktopNewsCard() {}
```

#### Variables & Functions

```typescript
// camelCase for variables, functions, handlers
const [isExpanded, setIsExpanded] = useState(false);
const handleNewsPress = () => {};
const currentStockIndex = 0;
```

#### Constants

```typescript
// SCREAMING_SNAKE_CASE for true constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const API_ENDPOINT = 'https://api.example.com';

// camelCase for color objects
const appColors = { ... };
```

#### Types

```typescript
// PascalCase for types and interfaces
type NewsItem = { ... };
type PortfolioStock = { ... };
interface UserProfile { ... }
```

### File Naming

- **Screens**: `kebab-case.tsx` (e.g., `profile.tsx`, `settings.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `NewsCard.tsx`, `StockItem.tsx`)
- **Utils**: `camelCase.ts` (e.g., `formatPrice.ts`, `api.ts`)
- **Types**: `types.ts` or embedded in component files
- **Mocks**: `camelCase.ts` (e.g., `news.ts`, `users.ts`)

### Import Order

```typescript
// 1. React & React Native
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. External libraries
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

// 3. Icons
import { Settings, User } from 'lucide-react-native';

// 4. Internal imports (use @ alias)
import { mockNewsData, NewsItem } from '@/mocks/news';
import { appColors } from '@/constants/colors';
```

---

## 💻 Development Guidelines

### TypeScript Strict Mode

```typescript
// ✅ Always provide explicit types
const [items, setItems] = useState<NewsItem[]>([]);
const [count, setCount] = useState<number>(0);

// ❌ Don't rely on inference for complex types
const [items, setItems] = useState([]);  // BAD
```

### State Management

```typescript
// ✅ Use useState for local component state
const [isOpen, setIsOpen] = useState<boolean>(false);

// ✅ Use React Query for server data
const { data, isLoading } = useQuery({
  queryKey: ['news'],
  queryFn: fetchNews
});

// Future: Use @nkzw/create-context-hook for shared state
```

### Styling

```typescript
// ✅ Always use StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.dark,
  }
});

// ✅ Use 'as const' for literal types
fontWeight: '700' as const

// ❌ Don't use inline styles for static styles
<View style={{ flex: 1 }} />  // BAD (unless dynamic)
```

### Comments

```typescript
// ✅ Use block comments for sections
/**
 * NewsCard Component
 * 
 * Displays a single news item with three sections:
 * - News preview (40% of screen)
 * - Related stocks (15% of screen)
 * - Impact forecast (30% of screen)
 */

// ✅ Use inline comments for complex logic
// Update pagination dots based on scroll position
const index = Math.round(offsetX / cardWidth);

// ✅ Use section dividers for visual organization
// ==========================================
// STATE MANAGEMENT
// ==========================================

// ❌ Don't over-comment obvious code
const [isOpen, setIsOpen] = useState(false); // State for modal - BAD
```

### Performance

```typescript
// ✅ Use useCallback for event handlers
const handlePress = useCallback(() => {
  setIsExpanded(true);
}, []);

// ✅ Use useRef for non-reactive values
const onViewableItemsChanged = useRef(callback).current;
const viewabilityConfig = useRef(config).current;

// ✅ Optimize FlatList
<FlatList
  removeClippedSubviews
  maxToRenderPerBatch={2}
  windowSize={3}
  initialNumToRender={1}
  getItemLayout={(data, index) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  })}
/>
```

### Error Handling

```typescript
// ✅ Validate user input
if (!symbol || shares <= 0 || avgPrice <= 0) {
  Alert.alert('Error', 'Please fill in all fields with valid values');
  return;
}

// ✅ Use try-catch for async operations
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  Alert.alert('Error', 'Failed to load data');
}
```

### Platform-Specific Code

```typescript
// ✅ Use Platform.select for values
const spacing = Platform.select({
  ios: 16,
  android: 12,
  web: 20
});

// ✅ Use Platform.OS for conditional rendering
{Platform.OS !== 'web' && (
  <SomeNativeComponent />
)}

// ✅ Check screen size for responsive design
const isDesktop = () => 
  Platform.OS === 'web' && 
  Dimensions.get('window').width >= 1024;
```

---

## 🎯 Design Principles

### 1. **Mobile-First, Desktop-Optimized**

- Design for mobile screen sizes first (320px - 428px)
- Enhance for tablets (768px+)
- Optimize for desktop (1024px+)

### 2. **Dark Mode by Default**

- All screens use dark theme (#0c0c0c background)
- No light mode toggle (future feature)
- High contrast text for readability

### 3. **Semantic Color Usage**

- Green = Positive, Growth, Success
- Red = Negative, Decline, Warning
- Gray = Neutral, Inactive, Secondary
- Never use colors arbitrarily

### 4. **Typography Hierarchy**

- Bold (700) = Titles, Headlines
- Semi-bold (600) = Subheadings
- Medium (500) = Buttons, Labels
- Regular (400) = Body text

### 5. **Spacing System**

```
4px   → Tight spacing (gaps in small elements)
8px   → Default gap between related items
12px  → Card margins, section spacing
16px  → Screen padding (horizontal)
20px  → Large section padding
24px  → Large card border radius
```

### 6. **Gradient Overlays**

```typescript
// News image gradient (for text readability)
colors: [
  'transparent',                // Top (image visible)
  'rgba(12, 12, 12, 0.5)',     // Fade begins
  'rgba(12, 12, 12, 0.85)',    // Strong overlay
  'rgba(12, 12, 12, 0.95)'     // Bottom (nearly opaque)
]
locations: [0.35, 0.5, 0.7, 1] // Gradient stops
```

### 7. **Interactive Elements**

```typescript
// Touchable opacity for tappable cards
<TouchableOpacity activeOpacity={0.95}>

// Button containers
borderRadius: 12
paddingVertical: 16
paddingHorizontal: 20

// Icon sizes
24 → Standard icons (header, buttons)
20 → Small icons (inline with text)
```

---

## 🚀 Getting Started

### Development

```bash
# Install dependencies
bun install

# Start development server
bun start

# Start web version
bun run start-web
```

### Project Structure Best Practices

1. **Keep components in respective screen files** - Only extract if reused 3+ times
2. **Use TypeScript strictly** - Enable all strict flags
3. **Follow established patterns** - Check existing code before adding new patterns
4. **Comment complex logic** - English comments for maintainability
5. **Test on multiple platforms** - iOS, Android, Web

---

## 📦 Data Flow

### Current State (Mock Data)

```
mocks/news.ts (static data)
  ↓
app/index.tsx (renders NewsCard)
  ↓
User interactions (tap, scroll, swipe)
```

### Future State (Backend Integration)

```
Backend API
  ↓
React Query (caching, refetching)
  ↓
Components (render with loading states)
  ↓
User interactions (tap, scroll, swipe)
```

---

## 🛠️ Future Enhancements

### Planned Features

1. **Real-time data** - Replace mock data with live API
2. **User authentication** - Firebase/Auth0 integration
3. **Persistent storage** - AsyncStorage for portfolio and settings
4. **Push notifications** - Expo Notifications for price alerts
5. **Dark/Light theme toggle** - Theme switching capability
6. **Saved articles** - Bookmark functionality
7. **Search & filters** - Find specific news/stocks
8. **Charts & graphs** - Stock price history visualization

### Technical Debt

1. Move inline color definitions to `constants/colors.ts`
2. Extract reusable components (e.g., `StockCard`, `SentimentBadge`)
3. Add error boundaries around major components
4. Implement loading skeletons for better UX
5. Add E2E tests with Detox

---

## 📝 Changelog

### v1.0.0 (January 2025)

- Initial release with core features
- News feed with AI predictions
- Portfolio management
- Desktop optimization
- Full documentation

---

## 🤝 Contributing

When making changes:

1. **Read this document first** - Understand design principles
2. **Follow existing patterns** - Match current code style
3. **Add comments** - Document complex logic in English
4. **Test on all platforms** - iOS, Android, Web
5. **Update documentation** - Keep this file current

---

**End of Documentation**
