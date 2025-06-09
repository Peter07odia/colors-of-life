# Colors of Life Mobile 👗📱

A React Native mobile app for virtual fashion try-on using state-of-the-art AI technology. Discover, search, and virtually try on clothes and accessories with an intuitive mobile interface.

## ✨ Features

- **Personalized Onboarding**: Gender selection and style preference matching
- **Virtual Try-On**: Use your device camera to see how clothes look on you
- **Style Discovery**: Browse trending fashion items and outfits  
- **Smart Search**: Find specific fashion items with intelligent search
- **AI Chat Stylist**: Get personalized fashion recommendations
- **Favorites**: Save your favorite items and complete outfits
- **User Profiles**: Manage your account and preferences
- **Mobile-Optimized UI**: Designed specifically for mobile interactions

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: Zustand with AsyncStorage persistence
- **Backend**: Supabase (Authentication, Database, Storage)
- **Camera**: Expo Camera for photo capture
- **Icons**: Lucide React Native
- **Type Safety**: TypeScript
- **Storage**: AsyncStorage for mobile-native data persistence

## 📱 App Flow

### Onboarding Experience
1. **Splash Screen** - Beautiful branded loading experience (6 seconds)
2. **Gender Selection** - Choose your gender for personalized styling
3. **Style Journey** - Select preferred styles from 8 curated categories:
   - Casual, Professional, Bohemian, Minimalist
   - Vintage, Glamorous, Athleisure, Streetwear
4. **Welcome Screen** - Complete setup and enter the main app

### Main Navigation
```
TabNavigator
├── Discover - Style feed and trending items
├── Search - AI Chat Stylist for personalized recommendations
├── Try On - Virtual Changing Room with camera
├── Wardrobe - Your saved items and outfits
└── Profile - User settings and account
```

## 🎨 Design System

### Colors
- **Primary**: `#7928CA` (Purple)
- **Primary Light**: `#F5F0FF`
- **Secondary**: `#FF0080` (Pink accent)
- **Text Primary**: `#1C1C1E`
- **Text Secondary**: `#6B7280`
- **Background**: `#FFFFFF`
- **Background Alt**: `#F8F9FA`

### Style Categories
Each style category features:
- Gender-specific imagery
- Custom gradient overlays
- Interactive selection with heart indicators
- Pagination for smooth browsing

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/colorsoflife-mobile.git
   cd colorsoflife-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_API_BASE_URL=https://api.colorsoflife.app
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android  
   npm run android
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Typography)
│   ├── shared/          # Shared components (ErrorBoundary)
│   ├── screens/         # Main app screens
│   ├── onboarding/      # Complete onboarding flow
│   │   ├── GenderSelection.tsx
│   │   ├── VisualJourney.tsx
│   │   └── Welcome.tsx
│   ├── tryOn/           # Virtual try-on components
│   ├── feed/            # Fashion feed components
│   ├── aiStylist/       # AI stylist components
│   └── auth/            # Authentication components
├── navigation/          # Navigation configuration
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── lib/                # Utilities and state management
│   ├── store/          # Zustand stores with AsyncStorage
│   └── userPreferences.ts # Mobile-native user preferences
├── constants/          # App constants and colors
└── types/              # TypeScript type definitions
```

## 🔧 Configuration

### Mobile-Native Features
- **AsyncStorage**: All data persistence uses React Native AsyncStorage
- **Dimensions API**: Responsive layout using React Native Dimensions
- **Camera Integration**: Native camera access with proper permissions
- **Error Boundaries**: Mobile-friendly error handling and recovery

### Permissions
The app requires camera and photo library access:

**iOS** (`app.json`):
- `NSCameraUsageDescription`: "This app uses the camera for virtual try-on features"
- `NSPhotoLibraryUsageDescription`: "This app needs access to photo library to save your virtual try-on photos"

**Android** (`app.json`):
- `CAMERA`: Camera access for virtual try-on
- `WRITE_EXTERNAL_STORAGE`: Save photos to device storage

## 🎯 Development Status

### ✅ Completed Features (Phase 1 - Clean Foundation)
- [x] Complete onboarding flow with style preferences
- [x] Mobile-native data persistence (AsyncStorage)
- [x] Clean, web-artifact-free codebase
- [x] Gender-specific style imagery system
- [x] Beautiful UI components and animations
- [x] Navigation and routing setup
- [x] Camera integration foundation
- [x] Error boundaries and logging system
- [x] TypeScript type safety throughout

### 🔄 In Progress (Phase 2 - Core Features)
- [ ] Supabase authentication integration
- [ ] Real fashion item database connection
- [ ] AI-powered virtual try-on processing
- [ ] User preference matching algorithms
- [ ] Social features (sharing, comments)

### 📋 Planned (Phase 3 - Advanced Features)
- [ ] N8N workflow integration for AI processing
- [ ] Advanced body measurement estimation
- [ ] Color matching and style recommendation engine
- [ ] Push notifications and offline functionality
- [ ] Advanced analytics and user insights

## 🧹 Recent Improvements

### Codebase Cleanup (Latest)
- ✅ Removed all web-specific code (localStorage, window, document)
- ✅ Converted to mobile-native AsyncStorage throughout
- ✅ Eliminated unused components and duplicate files
- ✅ Fixed React Native compatibility issues
- ✅ Cleaned up imports and dependencies
- ✅ Optimized for mobile-only development

### Architecture Improvements
- ✅ Zustand state management with persistence
- ✅ Centralized user preferences handling
- ✅ Mobile-friendly error boundaries
- ✅ Native logging system with AsyncStorage
- ✅ Clean component organization

## 🧪 Development Commands

```bash
# Start development server
npm start

# Start with cache cleared (recommended after updates)
npm start -- --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Install new dependencies
npm install

# Run tests
npm test
```

## 🐛 Troubleshooting

Common issues and solutions:

1. **Metro bundler cache issues**
   ```bash
   npm start -- --clear
   ```

2. **AsyncStorage not working**
   - Ensure `@react-native-async-storage/async-storage` is properly installed
   - Check that you're not mixing localStorage with AsyncStorage

3. **Camera permissions**
   - Verify permissions are set in `app.json`
   - Test on physical device (camera doesn't work in simulator)

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more detailed solutions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Commit with descriptive messages
6. Submit a pull request

### Code Standards
- Use TypeScript for all new code
- Follow React Native best practices
- Use AsyncStorage for data persistence (never localStorage)
- Test on both iOS and Android before submitting

## 📄 License

This project is proprietary software for Colors of Life fashion platform.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
- Contact the development team

---

**Built with ❤️ for the future of mobile fashion technology** 

*Last updated: January 2025 - v1.0 Clean Mobile Foundation* 