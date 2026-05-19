import { createContext, useContext } from 'react';

export const lightTheme = {
  paper:     '#EFE7D2',
  paper2:    '#E5DCC2',
  paper3:    '#D7CCAE',
  card:      '#FBF5E4',
  ink:       '#102A1F',
  ink2:      '#2F4338',
  ink3:      '#6A7569',
  ink4:      '#9AA39B',
  line:      'rgba(16,42,31,0.10)',
  line2:     'rgba(16,42,31,0.18)',
  // Primary = chartreuse (action buttons, tab indicator)
  primary:   '#B5DA40',
  primary2:  '#9CBE2C',
  lime:      '#B5DA40',
  lime2:     '#9CBE2C',
  coral:     '#D7263D',
  coralSoft: '#F6D7DC',
  gold:      '#E89B2F',
  goldSoft:  '#F8E2BB',
  pitch:     '#0E5B3A',
  pitch2:    '#1A7B4F',
  pitch3:    '#093E27',
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  paper:     '#0D1715',
  paper2:    '#142220',
  paper3:    '#1B2D2A',
  card:      '#172724',
  ink:       '#F0E8D2',
  ink2:      '#C7BFA8',
  ink3:      '#8F8973',
  ink4:      '#5F5C4F',
  line:      'rgba(240,232,210,0.10)',
  line2:     'rgba(240,232,210,0.18)',
  lime:      '#C8E654',
  lime2:     '#A8C82A',
  coral:     '#F0556C',
  coralSoft: '#3E1B22',
  gold:      '#F0B14C',
  goldSoft:  '#3E2E14',
  pitch:     '#1A7B4F',
  pitch2:    '#258A60',
  pitch3:    '#0E5B3A',
};

export type Theme = typeof lightTheme;

export const fonts = {
  display:    'HankenGrotesk_800ExtraBold',
  headline:   'HankenGrotesk_700Bold',
  semibold:   'HankenGrotesk_600SemiBold',
  body:       'HankenGrotesk_400Regular',
  mono:       'JetBrainsMono_700Bold',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const ThemeContext = createContext<Theme>(lightTheme);
export const useTheme = () => useContext(ThemeContext);
