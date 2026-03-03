import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

type UiState = {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: ThemeMode;
  searchQuery: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setSearchQuery: (query: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      theme: 'dark',
      searchQuery: '',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setTheme: (theme) => set({ theme }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'nexus-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        searchQuery: state.searchQuery,
      }),
    },
  ),
);
