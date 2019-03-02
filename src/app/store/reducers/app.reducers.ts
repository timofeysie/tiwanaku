import { ActionReducerMap } from '@ngrx/store';

import { routerReducer } from '@ngrx/router-store';
import { IAppState } from '../state/app.state';
import { configReducers } from './config.reducers';
import { entityReducers } from './entity.reducers';

export const appReducers: ActionReducerMap<IAppState, any> = {
  router: routerReducer,
  entities: entityReducers,
  config: configReducers
};
