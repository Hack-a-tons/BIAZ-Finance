# BIAZ Finance - Developer Guide

> **Essential information for developers working on BIAZ Finance**

---

## 📚 Documentation Overview

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** | Get started in 5 min | First time setup |
| **[DESIGN.md](./DESIGN.md)** | Complete design system | Before any UI work |
| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** | File organization | Understanding codebase |
| **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** | What was optimized | Context on improvements |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history | Checking what changed |
| **This file** | Developer reference | Daily development |

---

## 🚀 Quick Commands

```bash
# Development
bun start              # Start dev server
bun run start-web      # Start web preview
bun run lint           # Run ESLint

# Testing
bun start -- --ios     # iOS simulator (Mac only)
bun start -- --android # Android emulator
bun start -- --tunnel  # Use tunnel (for device testing)

# Cleaning
bunx expo start --clear # Clear cache
rm -rf node_modules && bun install # Fresh install
```

---

## 🎨 Design System Quick Reference

### Colors

```typescript
import { appColors } from '@/constants/appColors';

appColors.dark      // #0c0c0c - Background
appColors.light     // #fbfbfb - Text
appColors.cardBg    // #1a1a1a - Cards
appColors.positive  // #10b981 - Green (positive data)
appColors.negative  // #ef4444 - Red (negative data)
appColors.neutral   // #6b7280 - Gray (secondary)
```

### Spacing (4px Grid)

```typescript
import { spacing, borderRadius } from '@/constants/layout';

spacing.xs    // 4px   - Tight spacing
spacing.sm    // 8px   - Default gap
spacing.md    // 12px  - Card margins
spacing.lg    // 16px  - Screen padding
spacing.xl    // 20px  - Large sections
spacing.xxl   // 24px  - Major dividers
spacing.xxxl  // 32px  - Screen sections

borderRadius.sm    // 8px   - Small elements
borderRadius.md    // 12px  - Cards, buttons
borderRadius.lg    // 16px  - Modals
borderRadius.xl    // 20px  - Chips
borderRadius.xxl   // 24px  - Large cards
borderRadius.round // 999px - Circular
```

### Typography

```typescript
import { fontSize, fontWeight, textPresets } from '@/constants/typography';

// Font Sizes
fontSize.display   // 28 - Large headings
fontSize.heading1  // 24 - Section titles
fontSize.heading2  // 22 - Subsections
fontSize.heading3  // 20 - Card titles
fontSize.body      // 17 - Buttons, labels
fontSize.bodyLarge // 16 - Body text
fontSize.bodySmall // 14 - Secondary text
fontSize.caption   // 13 - Descriptions
fontSize.small     // 12 - Timestamps
fontSize.tiny      // 11 - Badges

// Font Weights
fontWeight.regular  // '400' - Body text
fontWeight.medium   // '500' - Buttons
fontWeight.semiBold // '600' - Subheadings
fontWeight.bold     // '700' - Headlines

// Text Presets (Recommended)
...textPresets.displayTitle  // Complete display style
...textPresets.heading1      // Section title style
...textPresets.body          // Body text style
...textPresets.caption       // Caption style
```

### Responsive Utilities

```typescript
import { isDesktop, isTablet, isMobile } from '@/constants/layout';

if (isDesktop()) {
  // Desktop layout (≥1024px)
}

if (isTablet()) {
  // Tablet layout (768px-1023px)
}

if (isMobile()) {
  // Mobile layout (<768px)
}
```

---

## 📂 File Organization

### Where to Add Things

| What to Add | Where to Put It | Example |
|-------------|-----------------|---------|
| New screen | `app/` | `app/notifications.tsx` |
| New constant | `constants/` | Add to existing files |
| Mock data | `mocks/` | `mocks/users.ts` |
| Type definition | Same file or `mocks/` | `export type User = {...}` |
| Reusable component | Extract if used 3+ times | `components/StockCard.tsx` |

### Import Alias

Always use `@/` for imports:

```typescript
// ✅ Good
import { appColors } from '@/constants/appColors';
import { mockNewsData } from '@/mocks/news';

// ❌ Avoid
import { appColors } from '../../constants/appColors';
import { mockNewsData } from '../mocks/news';
```

---

## 🛠️ Common Development Tasks

### 1. Add a New Screen

```typescript
// 1. Create file: app/my-screen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { appColors } from '@/constants/appColors';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Screen',
          headerStyle: { backgroundColor: appColors.dark },
          headerTintColor: appColors.light,
        }}
      />
      <Text style={styles.text}>Hello!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.dark,
  },
  text: {
    color: appColors.light,
  }
});

// 2. Navigate to it
import { router } from 'expo-router';
router.push('/my-screen');
```

### 2. Add a New Color

```typescript
// 1. Open: constants/appColors.ts
export const appColors = {
  // ... existing colors
  accent: '#3b82f6',  // New color
} as const;

// 2. Update DESIGN.md documentation

// 3. Use in components
import { appColors } from '@/constants/appColors';
backgroundColor: appColors.accent
```

### 3. Add a Reusable Component

```typescript
// 1. Create: components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { appColors } from '@/constants/appColors';

type Props = {
  title: string;
};

export function MyComponent({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: appColors.cardBg,
  },
  text: {
    color: appColors.light,
  }
});

// 2. Use in screens
import { MyComponent } from '@/components/MyComponent';

<MyComponent title="Hello" />
```

### 4. Add Mock Data

```typescript
// 1. Create or update: mocks/myData.ts
export type MyDataItem = {
  id: string;
  name: string;
  value: number;
};

export const mockMyData: MyDataItem[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
];

// 2. Import and use
import { mockMyData, MyDataItem } from '@/mocks/myData';

const [data, setData] = useState<MyDataItem[]>(mockMyData);
```

### 5. Add Navigation

```typescript
import { router } from 'expo-router';

// Push new screen
router.push('/profile');

// Replace current screen
router.replace('/login');

// Go back
router.back();

// Navigate with params
router.push({
  pathname: '/details',
  params: { id: '123' }
});

// Access params
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams();
```

---

## 📏 Code Style Guidelines

### TypeScript

```typescript
// ✅ Always use explicit types for useState
const [count, setCount] = useState<number>(0);
const [items, setItems] = useState<Item[]>([]);

// ✅ Define types for props
type Props = {
  title: string;
  onPress: () => void;
};

// ✅ Use 'as const' for font weights
fontWeight: '700' as const
```

### Styling

```typescript
// ✅ Use StyleSheet.create
const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

// ✅ Use constants
import { appColors, spacing } from '@/constants/...';

backgroundColor: appColors.dark,
padding: spacing.lg,

// ❌ Avoid hardcoded values
backgroundColor: '#0c0c0c',  // NO
padding: 16,                 // NO
```

### Comments

```typescript
// ✅ Document sections
// ==========================================
// STATE MANAGEMENT
// ==========================================

// ✅ Explain complex logic
// Calculate scroll position based on card width
const index = Math.round(offsetX / cardWidth);

// ✅ Use block comments for components
/**
 * NewsCard Component
 * 
 * Displays a single news item with three sections
 */

// ❌ Don't over-comment obvious code
const [isOpen, setIsOpen] = useState(false); // State for modal
```

### Naming

```typescript
// ✅ PascalCase for components
function NewsCard() {}

// ✅ camelCase for variables/functions
const handlePress = () => {};
const currentIndex = 0;

// ✅ Boolean variables start with 'is', 'has', 'should'
const isLoading = false;
const hasError = false;
const shouldUpdate = true;
```

---

## 🎯 Best Practices

### State Management

```typescript
// ✅ Use useState for local state
const [isOpen, setIsOpen] = useState<boolean>(false);

// ✅ Use useCallback for handlers
const handlePress = useCallback(() => {
  setIsOpen(true);
}, []);

// ✅ Use useRef for non-reactive values
const scrollRef = useRef<ScrollView>(null);
```

### Performance

```typescript
// ✅ Optimize FlatList
<FlatList
  removeClippedSubviews
  maxToRenderPerBatch={2}
  windowSize={3}
  initialNumToRender={1}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// ✅ Memoize callbacks
const handleScroll = useCallback((event) => {
  // ...
}, []);
```

### Platform-Specific Code

```typescript
// ✅ Use Platform.select for values
const padding = Platform.select({
  ios: 16,
  android: 12,
  web: 20
});

// ✅ Use Platform.OS for conditional rendering
{Platform.OS !== 'web' && (
  <NativeOnlyComponent />
)}
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| App not loading | Check WiFi, try `--tunnel` mode |
| Type errors | Restart TypeScript server in VS Code |
| Import errors | Check `tsconfig.json` paths, restart bundler |
| Style not applying | Check for typos, ensure StyleSheet.create |
| Can't find module | Verify import path, check file exists |

### Debug Commands

```bash
# Clear cache
bunx expo start --clear

# Fresh install
rm -rf node_modules && bun install

# Check for errors
bun run lint

# View logs
bunx expo start --dev-client
```

---

## 📋 Pre-Commit Checklist

Before committing code:

- [ ] All imports use `@/` alias
- [ ] Colors from `@/constants/appColors`
- [ ] Spacing from `@/constants/layout`
- [ ] Fonts from `@/constants/typography`
- [ ] TypeScript strict mode passing
- [ ] No ESLint errors
- [ ] Tested on iOS, Android, Web
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed

---

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Getting Help

1. **Design questions**: Check [DESIGN.md](./DESIGN.md)
2. **Structure questions**: Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. **Setup issues**: Check [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
4. **Expo issues**: Search [docs.expo.dev](https://docs.expo.dev/)
5. **React Native issues**: Search [reactnative.dev](https://reactnative.dev/)

---

**Happy Coding!** 🚀

This guide provides everything you need for daily BIAZ Finance development. For deeper dives, refer to the full documentation files listed at the top.
