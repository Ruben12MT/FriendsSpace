import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      loggedUser: null,
      setLoggedUser: (user) => set({ loggedUser: user }),
      clearAuth: () => set({ loggedUser: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;