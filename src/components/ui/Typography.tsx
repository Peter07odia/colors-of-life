import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: TextStyle;
  color?: keyof typeof colors.text;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  level = 1, 
  style,
  color = 'primary'
}) => {
  const headingStyle = [
    styles.base,
    styles[`h${level}`],
    { color: colors.text[color] },
    style,
  ];

  return <Text style={headingStyle}>{children}</Text>;
};

interface TextProps {
  children: React.ReactNode;
  variant?: 'large' | 'body' | 'small' | 'muted';
  style?: TextStyle;
  color?: keyof typeof colors.text;
  numberOfLines?: number;
}

export const AppText: React.FC<TextProps> = ({ 
  children, 
  variant = 'body', 
  style,
  color = 'primary',
  numberOfLines,
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    { color: colors.text[color] },
    style,
  ];

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 8,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    marginBottom: 6,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 4,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 4,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 2,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 2,
  },
  // Text variants
  large: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    opacity: 0.7,
  },
}); 