import { create } from 'zustand'

export type GeminiModel = 'flash' | 'pro' | 'thinking'
export type AppTheme = 'light' | 'dark' | 'system'

interface UiState {
  sidebarExpanded: boolean
  selectedModel: GeminiModel
  searchOpen: boolean
  theme: AppTheme
  personalIntelligenceEnabled: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (v: boolean) => void
  setSelectedModel: (m: GeminiModel) => void
  setSearchOpen: (v: boolean) => void
  setTheme: (t: AppTheme) => void
  setPersonalIntelligenceEnabled: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarExpanded: true,
  selectedModel: 'flash',
  searchOpen: false,
  theme: 'light',
  personalIntelligenceEnabled: true,
  toggleSidebar: () =>
    set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setTheme: (theme) => set({ theme }),
  setPersonalIntelligenceEnabled: (personalIntelligenceEnabled) =>
    set({ personalIntelligenceEnabled }),
}))
