import React from 'react';

import { ThemeProvider } from './src/context/ThemeContext';
import HealPlusApp from './src/app/HealPlusApp';

export default function App() {
  return (
    <ThemeProvider>
      <HealPlusApp />
    </ThemeProvider>
  );
}
