import { RouterReducerState } from '@ngrx/router-store';
import { IEntityState, initialEntityState } from './entity.state';
import { initialConfigState, IConfigState } from './config.state';

export interface IAppState {
  router?: RouterReducerState;
  form?: IFormState;
  entities: IEntityState;
  config: IConfigState;
  error: string;
}

export interface IFormState {
    name?: string;
    isValid: boolean;
    isDirty: boolean;
}

export function getDefaultFormState(): IFormState {
    return {
        isValid: false,
        isDirty: false
    };
}

export const initialAppState: IAppState = {
  entities: initialEntityState,
  config: initialConfigState,
  error: null
};

export function getInitialState(): IAppState {
  return initialAppState;
}
