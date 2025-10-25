# BIAZ Finance - Quick Start Guide

> **Get started with BIAZ Finance development in 5 minutes**

---

## 🚀 Installation

```bash
# 1. Install dependencies
bun install

# 2. Start development server
bun start

# 3. Test in browser
bun run start-web
```

**That's it!** The app is now running.

---

## 📱 Test on Your Phone

1. Download **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from your terminal

3. The app will open on your phone

---

## 🎨 Using the Design System

### Colors

```typescript
import { appColors } from '@/constants/appColors';

// Use semantic colors
backgroundColor: appColors.dark       // #0c0c0c - Background
color: appColors.light                // #fbfbfb - Text
backgroundColor: appColors.cardBg     // #1a1a1a - Cards
color: appColors.positive             // #10b981 - Green (gains)
color: appColors.negative             // #ef4444 - Red (losses)
color: appColors.neutral              // #6b7280 - Gray (secondary)
```

### Spacing

```typescript
import { spacing, borderRadius } from '@/constants/layout';

// Use consistent spacing (4px grid)
padding: spacing.xs          // 4px
gap: spacing.sm              // 8px
marginBottom: spacing.md     // 12px
paddingHorizontal: spacing.lg // 16px
padding: spacing.xl          // 20px
borderRadius: borderRadius.xxl // 24px
```

### Typography

```typescript
import { fontSize, fontWeight, textPresets } from '@/constants/typography';

// Option 1: Individual values
fontSize: fontSize.heading1          // 24
fontWeight: fontWeight.bold          // '700'

// Option 2: Use presets (recommended)
...textPresets.heading1              // Complete style
...textPresets.body                  // Body text style
```

---

## 📂 Project Structure

```
BIAZ-Finance/
├── app/              # Screens
│   ├── index.tsx     # News feed
│   ├── profile.tsx   # Portfolio
│   └── settings.tsx  # Settings
│
├── constants/        # Design system
│   ├── appColors.ts  # Colors
│   ├── layout.ts     # Spacing
│   └── typography.ts # Fonts
│
└── mocks/
    └── news.ts       # Sample data
```

---

## 🛠️ Common Tasks

### Add a New Screen

1. Create file: `app/my-screen.tsx`
2. Add navigation: `router.push('/my-screen')`

### Add a New Color

1. Open: `constants/appColors.ts`
2. Add color to `appColors` object
3. Document in `DESIGN.md`

### Add a Component

1. Create in screen file if screen-specific
2. Extract to `components/` if reused 3+ times

---

## 🎯 Key Features

### News Feed
- Vertical scrolling news cards
- Tap card to expand full article
- Horizontal stock carousel
- AI impact predictions

### Profile
- User statistics
- Portfolio management
- AI portfolio analysis
- Add/remove stocks

### Settings
- Notification toggles
- Language selection
- Privacy settings

---

## 📚 Full Documentation

- **[DESIGN.md](./DESIGN.md)** - Complete design system (5,000 words)
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - File organization (3,000 words)
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - What was optimized

---

## 💡 Pro Tips

1. **Use import alias**: `import from '@/constants/appColors'` (not `../../`)
2. **Follow spacing**: Use `spacing.lg` not hardcoded `16`
3. **Semantic colors**: `appColors.positive` not `'#10b981'`
4. **Check docs**: Read DESIGN.md for design principles

---

## 🆘 Need Help?

- **Design questions**: See [DESIGN.md](./DESIGN.md)
- **File structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Expo issues**: Check [docs.expo.dev](https://docs.expo.dev/)

---

**Happy coding!** 🚀
