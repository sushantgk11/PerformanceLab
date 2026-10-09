"use client";
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

const workspace = createSlice({
  name: "workspace",
  initialState: {
    search: "",
    selectedOrders: [] as string[],
    dismissedNotifications: [] as string[],
  },
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    toggleOrder(state, action: PayloadAction<string>) {
      state.selectedOrders = state.selectedOrders.includes(action.payload)
        ? state.selectedOrders.filter((id) => id !== action.payload)
        : [...state.selectedOrders, action.payload];
    },
    clearSelection(state) {
      state.selectedOrders = [];
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.dismissedNotifications.push(action.payload);
    },
  },
});
export const { setSearch, toggleOrder, clearSelection, dismissNotification } =
  workspace.actions;
export const createStore = () =>
  configureStore({ reducer: { workspace: workspace.reducer } });
export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export const useAppDispatch = useDispatch.withTypes<AppStore["dispatch"]>();
export const useAppSelector = useSelector.withTypes<RootState>();
