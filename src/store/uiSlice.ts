import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const FONT_SIZES = [16, 18, 22, 26] as const;
export type FontSize = (typeof FONT_SIZES)[number];

interface UiState {
  fontSize: FontSize;
  sidebarOpen: boolean;
}

const initialState: UiState = { fontSize: 16, sidebarOpen: false };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setFontSize(state, action: PayloadAction<FontSize>) {
      state.fontSize = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const { setFontSize, toggleSidebar, closeSidebar } = uiSlice.actions;
export default uiSlice.reducer;
