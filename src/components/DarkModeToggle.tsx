import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-cyan-400 dark:border-cyan-600 hover:scale-110 transition-all duration-300 z-50"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="w-6 h-6 text-yellow-400" />
      ) : (
        <Moon className="w-6 h-6 text-cyan-600" />
      )}
    </button>
  );
}
