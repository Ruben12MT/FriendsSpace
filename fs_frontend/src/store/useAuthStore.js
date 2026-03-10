import { create } from 'zustand';

const useAuthStore = create((set) => ({
  loggedUser: null, 

  // Esta función sirve para el Login y para actualizar el perfil
  setLoggedUser: (user) => set({ loggedUser: user }),

  // Al cerrar sesión, limpiamos todo el objeto
  clearAuth: () => set({ loggedUser: null }),
}));

export default useAuthStore;