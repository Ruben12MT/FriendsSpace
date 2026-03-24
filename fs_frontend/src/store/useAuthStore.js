import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      loggedUser: null,
      setLoggedUser: (user) => set({ loggedUser: user }),
      clearAuth: () => set({ loggedUser: null }),

      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
      resetUnread: () => set({ unreadCount: 0 }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;