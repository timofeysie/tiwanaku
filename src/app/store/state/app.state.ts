import { RouterReducerState } from '@ngrx/router-store';
import { IEntityState, initialEntityState } from './entity.state';
import { initialConfigState, IConfigState } from './config.state';
import { getDefaultFormState, IFormState } from './form.state';

export interface IAppState {
  router?: RouterReducerState;
  form?: IFormState;
  entities: IEntityState;
  config: IConfigState;
  error: string;
}

export const initialAppState: IAppState = {
  entities: initialEntityState,
  config: initialConfigState,
  error: null
};

export function getInitialState(): IAppState {
  return initialAppState;
}
