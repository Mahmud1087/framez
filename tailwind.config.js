/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FE8C00',
        white: {
          DEFAULT: '#FFFFFF',
          100: '#FAFAFA',
          200: '#FE8C00',
        },
        dark: {
          100: '#181C2E',
        },
        error: '#F14141',
        success: '#2F9865',
      },
      fontFamily: {
        josefinSans: ['JosefinSans-Regular', 'sans-serif'],
        'josefinSans-bold': ['JosefinSans-Bold', 'sans-serif'],
        'josefinSans-semibold': ['JosefinSans-SemiBold', 'sans-serif'],
        'josefinSans-medium': ['JosefinSans-Medium', 'sans-serif'],
        'josefinSans-light': ['JosefinSans-Light', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
