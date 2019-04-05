import {Action} from '@ngrx/store';

export const ADD_GLOBAL_ERROR = '[GlobalError] Add';

export class AddGlobalError implements Action {
  readonly type = ADD_GLOBAL_ERROR;
  constructor(public payload: any) { }
}

export type All =
| AddGlobalError;
