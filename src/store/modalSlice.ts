import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ModalView = "login" | "register" | "forgot";

interface ModalState {
  isOpen: boolean;
  view: ModalView;
}

const initialState: ModalState = { isOpen: false, view: "login" };

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalView | undefined>) {
      state.isOpen = true;
      state.view = action.payload ?? "login";
    },
    closeModal(state) {
      state.isOpen = false;
    },
    setView(state, action: PayloadAction<ModalView>) {
      state.view = action.payload;
    },
  },
});

export const { openModal, closeModal, setView } = modalSlice.actions;
export default modalSlice.reducer;
