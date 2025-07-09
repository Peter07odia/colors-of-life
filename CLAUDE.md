# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Colors of Life** is a React Native mobile app for AI-powered virtual fashion try-on. Users can discover fashion items, use AI styling recommendations, and virtually try on clothes using their device camera.

## Tech Stack

- **Frontend**: React Native 0.79.4 + Expo 53.0.12, TypeScript
- **State**: Zustand with AsyncStorage persistence (NEVER localStorage)
- **Backend**: Supabase (auth, database, storage, edge functions)
- **AI/ML**: fal.ai models + n8n workflows for processing
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)

## Key Development Commands

```bash
# Development
npm start                    # Start Metro bundler
npm start -- --clear        # Start with cleared cache
npm run ios                  # Run on iOS simulator
npm run android             # Run on Android emulator

# Testing
npm test                    # Run Jest tests
npm test:watch             # Run tests in watch mode
npm test:coverage          # Run with coverage report

# Building
npm run build:ios          # Build for iOS (EAS)
npm run build:android      # Build for Android (EAS)
```

## Critical Architecture Rules

### 1. Mobile-Only Development
- **NEVER** use web APIs: `localStorage`, `sessionStorage`, `window`, `document`
- **ALWAYS** use `AsyncStorage` from `@react-native-async-storage/async-storage`
- **ALWAYS** use React Native components, never HTML elements
- **ALWAYS** handle mobile permissions (camera, photo library)

### 2. State Management
- **ALWAYS** use Zustand stores in `src/lib/store/` for global state
- **ALWAYS** use AsyncStorage for persistence
- Existing stores: `userStore`, `dataStore`, `uiStore`
- **NEVER** create duplicate stores - check existing ones first

### 3. TypeScript Requirements
- **ALWAYS** provide full TypeScript types
- **ALWAYS** import existing types from `src/types/`
- **NEVER** use `any` - use proper typing or `unknown`
- **ALWAYS** check `src/types/database.types.ts` for Supabase types

## Database Architecture

### Supabase Client
- Use the configured client from `src/lib/supabase.ts`
- Includes iOS simulator network fixes and retry logic
- Handles authentication and RLS policies

### Key Tables
- `profiles` - User profiles and preferences
- `user_avatars` - AI-generated avatars for try-on
- `virtual_tryon_results` - Try-on session results with Kling AI
- `fashion_items` - Fashion catalog with metadata
- `user_favorites` - Saved items and collections
- `n8n_workflow_executions` - AI workflow tracking

### Database Schema
Full schema is in `database-schema.sql` - review before making changes

## AI/ML Integration

### fal.ai Models Available
- `fal-ai/birefnet` - Background removal for avatar creation
- `fal-ai/fashn/tryon/v1.5` - Fashion virtual try-on
- `fal-ai/kling-video/v1.6/pro/image-to-video` - Try-on videos
- `fal-ai/clarity-upscaler` - Image quality enhancement

### n8n Workflows
Located in `n8n-workflows/` directory:
- `fal-avatar-creation-workflow.json` - Complete avatar pipeline
- `fal-virtual-tryon-workflow.json` - Try-on with video generation
- `smart-fashion-search-workflow.json` - Geographic fashion search
- `ai-stylist-workflow.json` - Personalized recommendations

## Component Architecture

### Directory Structure
```
src/components/
├── ui/              # Reusable UI (Button, Card, Typography)
├── shared/          # Shared components (ErrorBoundary)
├── screens/         # Main app screens
├── onboarding/      # Complete onboarding flow
├── tryOn/           # Virtual try-on components
└── auth/            # Authentication components
```

### Navigation Structure
```
TabNavigator (Bottom Tabs)
├── Discover - Style feed and trending items
├── Search - AI Chat Stylist for recommendations
├── Try On - Virtual Changing Room with camera
├── Wardrobe - Saved items and outfits
└── Profile - User settings and account
```

### Design System
Colors are defined in `src/constants/colors.ts`:
- Primary: `#7928CA` (Purple)
- Secondary: `#FF0080` (Pink)
- Text Primary: `#1C1C1E`
- Background: `#FFFFFF`

Always use Lucide React Native for icons.

## Mobile-Specific Considerations

### Permissions Required
- Camera access for virtual try-on
- Photo library access for saving results
- Network state monitoring for offline handling

### Performance Patterns
- Use React Native Dimensions API for responsive layouts
- Implement proper loading states for camera operations
- Handle network failures gracefully (especially iOS simulator)
- Use AsyncStorage with proper error handling

### Testing Requirements
- Test on both iOS and Android
- Verify camera functionality on physical devices
- Test AsyncStorage persistence across app restarts
- Handle network connectivity issues

## Business Logic

### Freemium Model
- Track usage for AI processing operations
- Implement tier-aware processing (free vs premium)
- Handle graceful degradation for free users
- Never block core functionality for free users

### Virtual Try-On Service
Main service in `src/services/virtualTryOnService.ts`:
- Avatar management (create, get, set primary)
- Try-on processing via Supabase Edge Functions
- Result polling and status tracking
- User interaction tracking (ratings, saves)

## Common Patterns

### AsyncStorage Usage
```typescript
// ✅ CORRECT
try {
  await AsyncStorage.setItem('key', JSON.stringify(data));
  const stored = await AsyncStorage.getItem('key');
  return stored ? JSON.parse(stored) : null;
} catch (error) {
  console.error('Storage error:', error);
  return null;
}
```

### Supabase Operations
```typescript
// ✅ CORRECT
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Database error:', error);
  // Handle gracefully with user-friendly message
  return null;
}
```

### Component Creation
1. **Check existing components** in `src/components/ui/` first
2. **Use TypeScript interfaces** for all props
3. **Follow mobile-first design** patterns
4. **Handle loading states** and errors gracefully

## Development Workflow

### Before Adding Features
1. Check `PROJECT_DOCUMENTATION.md` for current status
2. Search existing implementations to avoid duplication
3. Review database schema for any required changes
4. Consider mobile UX and touch interactions
5. Plan error handling for network failures

### Implementation Order
1. Define TypeScript interfaces
2. Plan database schema changes if needed
3. Integrate with existing Zustand stores
4. Build UI components following design system
5. Test on mobile platforms
6. Handle permissions and edge cases

## File Organization

### Key Files to Reference
- `PROJECT_DOCUMENTATION.md` - Complete project overview
- `src/lib/supabase.ts` - Database client with mobile fixes
- `src/navigation/TabNavigator.tsx` - Main app navigation
- `database-schema.sql` - Complete database structure
- `App.tsx` - Main app entry point
- `.cursorrules` - Complete development guidelines

### Naming Conventions
- Components: PascalCase (e.g., `VirtualTryOnEngine.tsx`)
- Files: camelCase for utilities, PascalCase for components
- Directories: camelCase (e.g., `tryOn/`, `aiStylist/`)

## Error Handling Patterns

### Network Errors
- Always handle Supabase client errors
- Implement retry logic for transient failures
- Show user-friendly error messages
- Log errors for debugging but don't expose sensitive info

### Camera Operations
- Check permissions before accessing camera
- Handle graceful fallbacks when camera unavailable
- Test thoroughly on physical devices (not just simulator)

## Important Notes

- This is a **mobile-only** app - no web compatibility needed
- All data persistence uses AsyncStorage, never localStorage
- The app follows a freemium business model with usage tracking
- AI processing happens through n8n workflows and fal.ai models
- Database uses Supabase with Row Level Security policies
- Always test camera features on physical devices