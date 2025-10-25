# BIAZ Finance — Mobile Client

React Native mobile client for the BIAZ Finance TruthScore API.

**Live URL**: https://news.biaz.hurated.com  
**API Backend**: https://api.news.biaz.hurated.com/v1

Built at [**De-Vibed Hackathon @ AngelList SF**](https://luma.com/dj3k3tri)

---

## Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Start development server (mobile + web)
bun start

# Start web only (localhost:22000)
bun run start-web

# Start with tunnel (for testing on physical devices)
bun start -- --tunnel
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `WEB_PORT=22000` - Local web development port
- `API_URL=https://api.news.biaz.hurated.com/v1` - Backend API URL

### Testing

**On your phone:**
1. Install Expo Go ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Run `bun start` and scan the QR code

**In browser:**
```bash
bun run start-web
# Opens at http://localhost:22000
```

**iOS Simulator / Android Emulator:**
```bash
bun start -- --ios      # iOS Simulator
bun start -- --android  # Android Emulator
```

---

## Deployment

### Production Web Deployment

The web app is deployed at **https://news.biaz.hurated.com** via Docker Compose.

To deploy:
```bash
cd /path/to/BIAZ-Finance
./scripts/deploy.sh -m "Update mobile client" biaz.hurated.com
```

The deployment script will:
1. Build the Docker image with the web app
2. Deploy to the server
3. Serve at https://news.biaz.hurated.com (port 22000 internally)

### Mobile App Deployment

**iOS App Store:**
```bash
bun i -g @expo/eas-cli
eas build:configure
eas build --platform ios
eas submit --platform ios
```

**Google Play Store:**
```bash
eas build --platform android
eas submit --platform android
```

---

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── index.tsx          # Main news feed
│   ├── profile.tsx        # User profile
│   └── settings.tsx       # App settings
├── services/              # API client
│   └── api.ts            # BIAZ Finance API integration
├── hooks/                 # React hooks
│   └── useNewsArticles.ts # News data fetching
├── utils/                 # Utilities
│   └── dataTransformers.ts # API data transformation
├── mocks/                 # Mock data for development
├── types/                 # TypeScript types
└── constants/            # App constants
```

---

## Technologies

- **React Native** - Cross-platform mobile framework
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **React Query** - Server state management
- **NativeWind** - Tailwind CSS for React Native
- **Lucide Icons** - Icon library

---

## API Integration

The app connects to the BIAZ Finance TruthScore API:

**Base URL**: `https://api.news.biaz.hurated.com/v1`

**Key Endpoints**:
- `GET /articles` - List truth-scored articles
- `GET /articles/:id` - Get article details with claims
- `GET /stocks` - List stocks
- `GET /forecasts/:id` - Get AI forecast

See [API Documentation](../README.md) for full API details.

---

## Troubleshooting

**App not loading?**
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `bun start -- --tunnel`
- Check firewall settings

**Build failing?**
```bash
bunx expo start --clear
rm -rf node_modules && bun install
```

**Need help?**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Project Documentation](./DOCUMENTATION_INDEX.md)

---

## About

BIAZ Finance mobile client delivers real-time truth-scored financial news with AI-powered impact forecasts. Built with React Native and Expo - the same stack used by Discord, Shopify, Coinbase, and Instagram.
