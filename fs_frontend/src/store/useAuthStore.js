import { create } from 'zustand';

const useAuthStore = create((set) => ({
  userId: null, 
  setUserId: (id) => set({ userId: id }),
  clearAuth: () => set({ userId: null }),
}));

export default useAuthStore;