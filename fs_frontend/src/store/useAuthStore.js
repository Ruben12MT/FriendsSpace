import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      loggedUser: null,
      isLoading: true,

      setLoggedUser: (user) => set({ loggedUser: user, isLoading: false }),
      clearAuth: () => set({ loggedUser: null, isLoading: false, unreadMessages: 0 }),
      setIsLoading: (v) => set({ isLoading: v }),

      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
      resetUnread: () => set({ unreadCount: 0 }),

      unreadMessages: 0,
      setUnreadMessages: (count) => set({ unreadMessages: count }),
      incrementUnreadMessages: () => set((state) => ({ unreadMessages: state.unreadMessages + 1 })),
      resetUnreadMessages: () => set({ unreadMessages: 0 }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        loggedUser: state.loggedUser,
        unreadCount: state.unreadCount,
        unreadMessages: state.unreadMessages,
      }),
    }
  )
);

export default useAuthStore;