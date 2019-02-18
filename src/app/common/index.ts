/* Import createSelector from reselect to make selection of different parts 
of the state fast efficient */
import { createSelector } from "reselect";
import { storeLogger } from "ngrx-store-logger";
import * as fromLayout from "./layout/layout.reducer";
import { compose } from "@ngrx/core";
import { combineReducers } from "@ngrx/store";

export interface AppState {
  reducer: {
    layout: fromLayout.State;
  };
}
export const reducers = {
  layout: fromLayout.reducer
};

const developmentReducer: Function = compose(storeLogger(), combineReducers)(
  reducers
);

export function metaReducer(state: any, action: any) {
  return developmentReducer(state, action);
}

/** Layout selectors */
export const getLayoutState = (state: AppState) => state.reducer.layout;
