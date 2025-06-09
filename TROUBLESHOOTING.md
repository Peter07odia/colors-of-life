# Colors of Life Mobile - Troubleshooting Guide

This guide provides solutions for common issues that may occur with the Colors of Life React Native mobile app.

## Common Setup Issues

### 1. "expo: command not found"

**Problem**: Expo CLI is not installed or not in your PATH.

**Solutions**:
```bash
# Option 1: Use npx (recommended)
npx expo start

# Option 2: Install globally
npm install -g @expo/cli

# Option 3: Use npm scripts
npm start
```

### 2. Dependencies Issues

**Problem**: Missing or incompatible dependencies.

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 3. Camera Permissions

**Problem**: Camera not working on device.

**Solutions**:
- Make sure you're testing on a physical device (camera doesn't work in simulators)
- Check app permissions in device settings
- Restart the app after granting permissions

### 4. Metro Bundle Issues

**Problem**: Metro bundler fails to start or has cache issues.

**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# Reset Expo cache
npx expo r -c

# Use our clean script
npm run clean
```

### 5. iOS Simulator Issues

**Problem**: App not loading on iOS simulator.

**Solutions**:
```bash
# Make sure iOS simulator is running
npx expo run:ios

# Or install Expo Go app on simulator
npx expo start
# Then press 'i' to open in iOS simulator
```

### 6. Android Emulator Issues

**Problem**: App not loading on Android emulator.

**Solutions**:
```bash
# Make sure Android emulator is running
npx expo run:android

# Or install Expo Go app on emulator
npx expo start
# Then press 'a' to open in Android emulator
```

### 7. TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Install missing type definitions
npm install --save-dev @types/react @types/react-native
```

### 8. Supabase Connection Issues

**Problem**: Cannot connect to Supabase.

**Solutions**:
1. Update `src/services/supabase.ts` with your project credentials
2. Check your Supabase project is active
3. Verify API keys are correct

### 9. Navigation Issues

**Problem**: Navigation not working properly.

**Solution**:
```bash
# Make sure all navigation dependencies are installed
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
```

### 10. Build Issues

**Problem**: Expo build fails.

**Solutions**:
```bash
# Check for build errors
npx expo doctor

# Clear cache and restart
npm run clean
npm start
```

### 11. NativeWind/Tailwind Issues

**Problem**: Styles not applying correctly.

**Solutions**:
```bash
# Make sure NativeWind is properly configured
# Check tailwind.config.js includes React Native files
# Restart Metro bundler after config changes
npm run clean
npm start
```

### 12. AsyncStorage Issues

**Problem**: Data not persisting between app sessions.

**Solutions**:
- Check AsyncStorage imports are correct
- Verify data is being properly serialized/deserialized
- Test on physical device (some simulators have storage limitations)

## Development Tips

### Quick Reset Commands
```bash
# Clean everything and restart
npm run clean && npm start

# Reset Expo cache
npx expo r -c

# Clear node modules
rm -rf node_modules && npm install
```

### Debugging
- Use React Native Debugger for better debugging experience
- Check Metro bundler logs for detailed error information
- Use `console.log` statements and view them in the terminal

### Performance
- Test on physical devices for accurate performance metrics
- Use React Native Performance Monitor
- Optimize images and assets for mobile

## Contact Support

If you continue experiencing issues after trying these solutions, please:
1. Check the GitHub repository for known issues
2. Create a new issue with detailed error logs
3. Contact the development team

---

**Built for React Native with ❤️** 