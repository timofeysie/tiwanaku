import { RouterReducerState } from '@ngrx/router-store';
import { IEntityState, initialEntityState } from './entity.state';
import { initialConfigState, IConfigState } from './config.state';
import { IFormState, initialFormState } from './form.state';

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
  form: initialFormState,
  error: null
};

export function getInitialState(): IAppState {
  return initialAppState;
}
