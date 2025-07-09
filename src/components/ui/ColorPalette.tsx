import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const GRADIENT_WIDTH = width - 80; // Account for padding and checkbox
const SLIDER_SIZE = 16;

interface ColorPaletteProps {
  onColorSelect?: (colorName: string | null) => void;
  selectedColor?: string | null;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onColorChange?: (colorName: string | null) => void; // For real-time updates
}

// Complete color spectrum including major colors
const RAINBOW_COLORS = [
  '#000000', // Black
  '#333333', // Dark Gray
  '#666666', // Gray
  '#999999', // Light Gray
  '#FFFFFF', // White
  '#8B4513', // Brown
  '#D2691E', // Orange Brown
  '#FF0000', // Red
  '#FF4500', // Orange Red
  '#FF8C00', // Orange
  '#FFA500', // Dark Orange
  '#FFD700', // Gold
  '#FFFF00', // Yellow
  '#9ACD32', // Yellow Green
  '#32CD32', // Lime Green
  '#00FF00', // Green
  '#00FF7F', // Spring Green
  '#00FFFF', // Cyan
  '#00BFFF', // Deep Sky Blue
  '#0080FF', // Dodger Blue
  '#0000FF', // Blue
  '#4169E1', // Royal Blue
  '#8A2BE2', // Blue Violet
  '#9400D3', // Violet
  '#8B008B', // Dark Magenta
  '#FF00FF', // Magenta
  '#FF1493', // Deep Pink
  '#FF69B4', // Hot Pink
  '#FFC0CB', // Pink
];

// Convert RGB to HSL for better color name detection
function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / (max - min) + (g < b ? 6 : 0); break;
      case g: h = (b - r) / (max - min) + 2; break;
      case b: h = (r - g) / (max - min) + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Get color name from HSL values
function getColorName(hue: number, saturation: number, lightness: number): string {
  // If very low saturation, it's grayscale
  if (saturation < 15) {
    if (lightness < 15) return 'black';
    if (lightness < 30) return 'dark gray';
    if (lightness < 50) return 'gray';
    if (lightness < 70) return 'light gray';
    if (lightness > 85) return 'white';
    return 'gray';
  }

  // Brown detection
  if (hue >= 20 && hue <= 40 && saturation > 30 && lightness < 50) {
    return 'brown';
  }

  // If very high lightness, it's a light color
  if (lightness > 80) {
    if (hue >= 0 && hue < 30) return 'light pink';
    if (hue >= 30 && hue < 60) return 'light yellow';
    if (hue >= 60 && hue < 120) return 'light green';
    if (hue >= 120 && hue < 180) return 'light cyan';
    if (hue >= 180 && hue < 240) return 'light blue';
    if (hue >= 240 && hue < 300) return 'light purple';
    return 'light pink';
  }

  // If very low lightness, it's a dark color
  if (lightness < 25) {
    if (hue >= 0 && hue < 30) return 'dark red';
    if (hue >= 30 && hue < 60) return 'dark orange';
    if (hue >= 60 && hue < 120) return 'dark green';
    if (hue >= 120 && hue < 180) return 'dark cyan';
    if (hue >= 180 && hue < 240) return 'dark blue';
    if (hue >= 240 && hue < 300) return 'dark purple';
    return 'dark red';
  }

  // Normal colors
  if (hue >= 0 && hue < 15) return 'red';
  if (hue >= 15 && hue < 45) return 'orange';
  if (hue >= 45 && hue < 75) return 'yellow';
  if (hue >= 75 && hue < 105) return 'yellow green';
  if (hue >= 105 && hue < 135) return 'green';
  if (hue >= 135 && hue < 165) return 'teal';
  if (hue >= 165 && hue < 195) return 'cyan';
  if (hue >= 195 && hue < 225) return 'blue';
  if (hue >= 225 && hue < 255) return 'blue purple';
  if (hue >= 255 && hue < 285) return 'purple';
  if (hue >= 285 && hue < 315) return 'pink';
  if (hue >= 315 && hue < 345) return 'rose';
  return 'red';
}

export default function ColorPalette({ 
  onColorSelect, 
  selectedColor, 
  enabled = false, 
  onEnabledChange,
  onColorChange
}: ColorPaletteProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentColorName, setCurrentColorName] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const gradientRef = useRef<View>(null);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    onEnabledChange?.(newEnabled);
    
    // Clear selection when disabling
    if (!newEnabled) {
      onColorSelect?.(null);
      onColorChange?.(null);
      setCurrentColorName(null);
    }
  };

  const getColorAtPosition = (x: number) => {
    // Clamp x to gradient bounds
    const clampedX = Math.max(0, Math.min(x, GRADIENT_WIDTH));
    const percentage = clampedX / GRADIENT_WIDTH;
    
    // Calculate which segment of the rainbow we're in
    const segmentIndex = Math.floor(percentage * (RAINBOW_COLORS.length - 1));
    const segmentProgress = (percentage * (RAINBOW_COLORS.length - 1)) - segmentIndex;
    
    // Interpolate between two adjacent colors
    const color1 = RAINBOW_COLORS[segmentIndex] || RAINBOW_COLORS[0];
    const color2 = RAINBOW_COLORS[segmentIndex + 1] || RAINBOW_COLORS[RAINBOW_COLORS.length - 1];
    
    // Simple linear interpolation
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * segmentProgress);
    const g = Math.round(g1 + (g2 - g1) * segmentProgress);
    const b = Math.round(b1 + (b2 - b1) * segmentProgress);
    
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const hsl = hexToHsl(hex);
    const colorName = getColorName(hsl.h, hsl.s, hsl.l);
    
    return { hex, colorName };
  };

  const updateColorSelection = (x: number) => {
    const { colorName } = getColorAtPosition(x);
    setCurrentColorName(colorName);
    onColorChange?.(colorName); // Real-time updates for search box
  };

  const finalizeColorSelection = () => {
    if (currentColorName) {
      onColorSelect?.(currentColorName);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => isEnabled,
    onPanResponderGrant: (event) => {
      if (!isEnabled) return;
      const x = event.nativeEvent.locationX;
      const newPosition = Math.max(0, Math.min(GRADIENT_WIDTH - SLIDER_SIZE, x - SLIDER_SIZE / 2));
      setSliderPosition(newPosition);
      updateColorSelection(x);
    },
    onPanResponderMove: (event, gestureState) => {
      if (!isEnabled) return;
      const x = gestureState.moveX - 56; // Account for container padding and checkbox
      const newPosition = Math.max(0, Math.min(GRADIENT_WIDTH - SLIDER_SIZE, x - SLIDER_SIZE / 2));
      setSliderPosition(newPosition);
      updateColorSelection(x);
    },
    onPanResponderRelease: () => {
      if (!isEnabled) return;
      finalizeColorSelection();
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.compactRow}>
        <TouchableOpacity 
          style={[styles.checkbox, isEnabled && styles.checkboxEnabled]}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          {isEnabled && (
            <Check 
              size={10} 
              color={colors.background.main} 
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>
        
        <View style={[styles.gradientContainer, !isEnabled && styles.disabled]}>
          <LinearGradient
            colors={RAINBOW_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
            ref={gradientRef}
          />
          
          {isEnabled && (
            <View 
              style={styles.sliderTrack}
              {...panResponder.panHandlers}
            >
              <View style={[styles.sliderContainer, { left: sliderPosition }]}>
                <View style={styles.slider} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxEnabled: {
    backgroundColor: '#7928CA',
    borderColor: '#7928CA',
  },
  gradientContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.4,
  },
  gradientLine: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  sliderTrack: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: SLIDER_SIZE,
    justifyContent: 'center',
  },
  sliderContainer: {
    position: 'absolute',
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: SLIDER_SIZE,
    height: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE / 2,
    backgroundColor: colors.background.main,
    borderWidth: 2,
    borderColor: '#7928CA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export { ColorPalette };