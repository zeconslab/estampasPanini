import React, { createContext, useContext } from 'react';

export const lightTheme = {
  paper:   '#EFE7D2',
  paper2:  '#E5DCC2',
  card:    '#FBF5E4',
  ink:     '#102A1F',
  ink2:    '#2F4338',
  ink3:    '#6A7569',
  ink4:    '#9AA39B',
  line:    'rgba(16,42,31,0.10)',
  primary: '#E89B2F',
  lime:    '#B5DA40',
  coral:   '#D7263D',
  gold:    '#E89B2F',
  pitch:   '#0E5B3A',
  pitch2:  '#1A7B4F',
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  paper:  '#0D1715',
  paper2: '#142220',
  card:   '#172724',
  ink:    '#F0E8D2',
  ink2:   '#C7BFA8',
  ink3:   '#8F8973',
  ink4:   '#5F5C4F',
  pitch:  '#1A7B4F',
};

export type Theme = typeof lightTheme;

export const ThemeContext = createContext<Theme>(lightTheme);
export const useTheme = () => useContext(ThemeContext);
