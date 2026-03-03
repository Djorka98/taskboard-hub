import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUiStore = create()(persist((set) => ({
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    theme: 'dark',
    searchQuery: '',
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setTheme: (theme) => set({ theme }),
    setSearchQuery: (query) => set({ searchQuery: query }),
}), {
    name: 'nexus-ui',
    partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        searchQuery: state.searchQuery,
    }),
}));
