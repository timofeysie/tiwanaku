import { RouterReducerState } from '@ngrx/router-store';

import { IEntityState, initialEntityState } from './entity.state';
import { initialConfigState, IConfigState } from './config.state';


export interface IAppState {
  router?: RouterReducerState;
  entities: IEntityState;
  config: IConfigState;
}

export const initialAppState: IAppState = {
  entities: initialEntityState,
  config: initialConfigState
};

export function getInitialState(): IAppState {
  return initialAppState;
}
