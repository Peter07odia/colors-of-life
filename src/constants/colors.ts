export const colors = {
  primary: '#7928CA',
  primaryLight: '#F5F0FF',
  primaryDark: '#5E17EB',
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
  },
  textSecondary: '#8E8E93',
  background: {
    main: '#FFFFFF',
    off: '#F8F8F8',
    light: '#FFFFFF',
    card: '#FFFFFF',
  },
  border: {
    light: '#E5E5E7',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKeys = keyof typeof colors; 