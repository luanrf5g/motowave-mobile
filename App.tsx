import { Routes } from './src/routes';
import { ThemeProvider } from 'react-native-rapi-ui'

export default function App() {
  return (
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  );
}
