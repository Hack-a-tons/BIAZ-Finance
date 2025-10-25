# BIAZ Finance - Project Structure

> **Last Updated**: January 2025  
> **Version**: 1.0.0

---

## 📁 Directory Structure

```
BIAZ-Finance/
│
├── 📱 app/                           # Application routes (expo-router)
│   ├── _layout.tsx                   # Root layout - React Query, Navigation setup
│   ├── +not-found.tsx                # 404 error screen
│   ├── index.tsx                     # 🏠 Main news feed screen
│   ├── profile.tsx                   # 👤 User profile & portfolio
│   └── settings.tsx                  # ⚙️ App settings
│
├── 🎨 constants/                     # Application constants
│   ├── appColors.ts                  # Centralized color palette
│   ├── colors.ts                     # Legacy colors (not in active use)
│   ├── layout.ts                     # Spacing, dimensions, breakpoints
│   └── typography.ts                 # Font sizes, weights, text presets
│
├── 🗂️ mocks/                         # Mock data for development
│   └── news.ts                       # NewsItem type & mock news data
│
├── 🖼️ assets/                        # Static assets
│   └── images/                       # App icons and splash screens
│       ├── icon.png                  # App icon
│       ├── favicon.png               # Web favicon
│       ├── splash-icon.png           # Splash screen
│       └── adaptive-icon.png         # Android adaptive icon
│
├── 📄 Configuration Files
│   ├── app.json                      # Expo configuration
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── eslint.config.js              # ESLint rules
│   ├── bun.lock                      # Dependency lock file
│   └── .gitignore                    # Git ignore rules
│
└── 📚 Documentation
    ├── DESIGN.md                     # 🎨 Design system & architecture
    ├── PROJECT_STRUCTURE.md          # 📁 This file
    └── README.md                     # 📖 Project overview & setup
```

---

## 🧩 Module Organization

### `/app` - Routes & Screens

Each file in the `app` directory represents a route in the application.

| File | Route | Description |
|------|-------|-------------|
| `_layout.tsx` | N/A | Root layout wrapper with providers |
| `index.tsx` | `/` | Main news feed with vertical scroll |
| `profile.tsx` | `/profile` | User profile and portfolio management |
| `settings.tsx` | `/settings` | App settings and preferences |
| `+not-found.tsx` | `*` | 404 error page |

**Navigation**: Stack-based (no tabs) for full-screen news experience.

---

### `/constants` - Shared Constants

Centralized constants for maintaining consistency across the app.

#### `appColors.ts` ✨ NEW

**Purpose**: Single source of truth for all colors used in the app.

**Exports**:
```typescript
export const appColors = {
  dark: '#0c0c0c',      // Background
  light: '#fbfbfb',     // Text
  cardBg: '#1a1a1a',    // Cards
  positive: '#10b981',  // Green - Positive data
  negative: '#ef4444',  // Red - Negative data
  neutral: '#6b7280',   // Gray - Neutral/secondary
}
```

**Usage**:
```typescript
import { appColors } from '@/constants/appColors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: appColors.dark,
  }
});
```

---

#### `layout.ts` ✨ NEW

**Purpose**: Dimensions, spacing, and responsive utilities.

**Key Exports**:
```typescript
// Spacing (4px baseline grid)
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

// Border radius
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, round: 999 };

// Breakpoints
export const breakpoints = { mobile: 0, tablet: 768, desktop: 1024 };

// Utilities
export const isDesktop = () => boolean;
export const isTablet = () => boolean;
export const isMobile = () => boolean;
```

**Usage**:
```typescript
import { spacing, borderRadius, isDesktop } from '@/constants/layout';

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
  }
});
```

---

#### `typography.ts` ✨ NEW

**Purpose**: Font sizes, weights, and text style presets.

**Key Exports**:
```typescript
// Font sizes
export const fontSize = {
  display: 28,
  heading1: 24,
  heading2: 22,
  heading3: 20,
  body: 17,
  bodyLarge: 16,
  bodySmall: 14,
  caption: 13,
  small: 12,
  tiny: 11,
};

// Font weights (with 'as const' for TypeScript)
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Text presets (commonly used combinations)
export const textPresets = {
  displayTitle: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  heading1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  body: { fontSize: 17, fontWeight: '400', lineHeight: 24 },
  // ... more presets
};
```

**Usage**:
```typescript
import { fontSize, fontWeight, textPresets } from '@/constants/typography';

const styles = StyleSheet.create({
  title: textPresets.heading1,
  // OR
  customText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semiBold,
  }
});
```

---

#### `colors.ts` (Legacy)

**Status**: ⚠️ Not in active use - kept for potential theme switching feature.

Contains default Expo template color scheme for light theme.

---

### `/mocks` - Mock Data

Mock data for development and testing. In production, replace with API calls.

#### `news.ts`

**Purpose**: News data types and sample news items.

**Exports**:
```typescript
// Types
export type NewsItem = {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string;
  source: string;
  timestamp: string;
  relatedStocks: Stock[];
  prediction: Prediction;
};

export type Stock = {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangeValue: number;
};

export type Prediction = {
  sentiment: 'positive' | 'negative' | 'neutral';
  shortAnalysis: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  keyPoints: string[];
};

// Mock data
export const mockNewsData: NewsItem[] = [ /* 5 sample news items */ ];
```

---

### `/assets` - Static Assets

Contains app icons and images.

**Important**: Do NOT manually edit these files - use Expo's asset system.

| File | Purpose |
|------|---------|
| `icon.png` | App icon (1024x1024) |
| `favicon.png` | Web favicon (48x48) |
| `splash-icon.png` | Splash screen icon |
| `adaptive-icon.png` | Android adaptive icon |

---

## 🔧 Configuration Files

### `app.json`

Expo configuration file containing:
- App name and slug
- Version and orientation
- Platform-specific settings (iOS, Android, Web)
- Plugins and experiments

**Key Settings**:
```json
{
  "name": "News Feed App",
  "slug": "news-feed-app",
  "version": "1.0.0",
  "orientation": "portrait",
  "newArchEnabled": true
}
```

---

### `package.json`

Dependencies and scripts.

**Key Dependencies**:
- `expo` (53.0.4) - Expo framework
- `react-native` (0.79.1) - Core framework
- `expo-router` (5.0.3) - File-based routing
- `@tanstack/react-query` - Server state management
- `lucide-react-native` - Icon library
- `typescript` (5.8.3) - Type safety

**Scripts**:
```bash
bun start          # Start development server
bun run start-web  # Start web version
bun run lint       # Run ESLint
```

---

### `tsconfig.json`

TypeScript configuration with strict mode enabled.

**Key Settings**:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]    // Import alias: @/constants/appColors
    }
  }
}
```

**Usage**: Import with `@/` instead of relative paths.

```typescript
// ✅ Good
import { appColors } from '@/constants/appColors';

// ❌ Avoid
import { appColors } from '../../constants/appColors';
```

---

## 🎯 Import Alias System

The project uses `@/` as an alias for the root directory.

### Examples

```typescript
// Constants
import { appColors } from '@/constants/appColors';
import { spacing, isDesktop } from '@/constants/layout';
import { fontSize, fontWeight } from '@/constants/typography';

// Mock data
import { mockNewsData, NewsItem, Stock } from '@/mocks/news';

// Assets (if needed)
import logo from '@/assets/images/icon.png';
```

---

## 📦 State Management

### Current Implementation

1. **Local State**: `useState` for component-specific state
2. **Server State**: `@tanstack/react-query` for data fetching (prepared, not yet used)
3. **Navigation State**: `expo-router` handles routing automatically

### Future Implementation

- **Shared State**: `@nkzw/create-context-hook` for cross-component state
- **Persistent State**: `AsyncStorage` for user preferences and portfolio
- **Real-time Updates**: WebSocket for live stock prices

---

## 🧪 Testing Strategy (Future)

```
BIAZ-Finance/
├── __tests__/
│   ├── components/
│   ├── screens/
│   └── utils/
└── e2e/
    └── newsFlow.test.ts
```

**Testing Libraries**:
- Jest - Unit tests
- React Native Testing Library - Component tests
- Detox - E2E tests

---

## 🔄 Data Flow

### Current Flow (Mock Data)

```
mocks/news.ts
  ↓ (import)
app/index.tsx
  ↓ (render)
NewsCard component
  ↓ (user interaction)
setState (local state updates)
```

### Future Flow (Backend Integration)

```
Backend API
  ↓ (HTTP request)
React Query (cache, refetch)
  ↓ (data)
app/index.tsx
  ↓ (render)
NewsCard component
  ↓ (user interaction)
useMutation → Backend API
```

---

## 🚀 Adding New Features

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/notifications.tsx`)
2. Define route in `app/_layout.tsx` if needed
3. Add navigation in existing screens:
   ```typescript
   import { router } from 'expo-router';
   router.push('/notifications');
   ```

### Adding a New Component

1. Create in screen file first (if screen-specific)
2. Extract to separate file if reused 3+ times:
   ```typescript
   // components/StockCard.tsx
   export function StockCard({ stock }: { stock: Stock }) {
     // ...
   }
   ```
3. Import in screens:
   ```typescript
   import { StockCard } from '@/components/StockCard';
   ```

### Adding New Constants

1. Update appropriate constant file (`appColors.ts`, `layout.ts`, `typography.ts`)
2. Export new constant
3. Document in `DESIGN.md`
4. Use across app with `@/` import alias

---

## 📚 Related Documentation

- [DESIGN.md](./DESIGN.md) - Complete design system and architecture
- [README.md](./README.md) - Project overview and setup instructions

---

## 🤝 Code Review Checklist

Before committing:

- [ ] All imports use `@/` alias (no relative paths for constants/mocks)
- [ ] Colors imported from `@/constants/appColors`
- [ ] Spacing values from `@/constants/layout`
- [ ] Font sizes/weights from `@/constants/typography`
- [ ] Comments in English for complex logic
- [ ] TypeScript strict mode compliance
- [ ] Tested on iOS, Android, and Web

---

**End of Project Structure Documentation**
