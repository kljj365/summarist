import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./modalSlice";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";
import { booksApi } from "./booksApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      modal: modalReducer,
      user: userReducer,
      ui: uiReducer,
      [booksApi.reducerPath]: booksApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(booksApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
