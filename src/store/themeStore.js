import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // Default to Dark mode per Stripe/Apple premium reference
      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: nextTheme });
        get().applyTheme();
      },
      applyTheme: () => {
        const currentTheme = get().theme;
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
