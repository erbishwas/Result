import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react'; // Optional icons

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded bg-background text-text"
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}