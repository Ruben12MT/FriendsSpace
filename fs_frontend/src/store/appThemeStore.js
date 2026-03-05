import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const appThemeStore = create(
  persist(
    (set) => ({
      theme: "dark",
      setAppTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default appThemeStore;