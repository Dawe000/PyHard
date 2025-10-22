import { config } from '@tamagui/config'
import { createTamagui } from 'tamagui'

// PayPal color scheme
const paypalBlue = '#0079c1'
const paypalDarkBlue = '#003087'
const paypalLightBlue = '#009cde'

// Custom theme with PayPal colors
const appConfig = createTamagui({
  ...config,
  themes: {
    light: {
      ...config.themes.light,
      blue: paypalBlue,
      blue1: '#f0f8ff',
      blue2: '#e1f2ff',
      blue3: '#c7e6ff',
      blue4: '#a6d8ff',
      blue5: '#7ec7ff',
      blue6: '#4fb3ff',
      blue7: '#1a9eff',
      blue8: paypalLightBlue,
      blue9: paypalBlue,
      blue10: '#006ba8',
      blue11: '#005489',
      blue12: paypalDarkBlue,

      background: '#F7F9FC',
      backgroundFocus: '#FFFFFF',
      backgroundHover: '#EEF2F7',
      backgroundPress: '#E5EBF1',

      color: '#1E1E1E',
      colorFocus: '#000000',
      colorHover: '#1E1E1E',
      colorPress: '#000000',

      borderColor: '#E5E7EB',
      borderColorFocus: paypalBlue,
      borderColorHover: '#D1D5DB',
      borderColorPress: paypalDarkBlue,

      placeholderColor: '#9CA3AF',
    },
    dark: {
      ...config.themes.dark,
      blue: paypalBlue,
      blue1: '#001829',
      blue2: '#002138',
      blue3: '#002e4d',
      blue4: '#003d66',
      blue5: '#004d82',
      blue6: '#005fa0',
      blue7: '#0072c0',
      blue8: paypalBlue,
      blue9: paypalLightBlue,
      blue10: '#33afea',
      blue11: '#66c2f0',
      blue12: '#99d5f5',

      background: '#1E1E1E',
      backgroundFocus: '#2A2A2A',
      backgroundHover: '#252525',
      backgroundPress: '#1A1A1A',

      color: '#FFFFFF',
      colorFocus: '#FFFFFF',
      colorHover: '#F5F5F5',
      colorPress: '#EEEEEE',

      borderColor: '#404040',
      borderColorFocus: paypalBlue,
      borderColorHover: '#505050',
      borderColorPress: paypalLightBlue,

      placeholderColor: '#9CA3AF',
    },
  },
})

export type AppConfig = typeof appConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
