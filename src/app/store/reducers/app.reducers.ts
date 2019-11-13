import { ActionReducerMap, combineReducers } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';
import { IAppState } from '../state/app.state';
import { configReducers } from './config.reducers';
import { entityReducers } from './entity.reducers';
import { categoryReducers } from './category.reducers';
import { errorReducers } from './error.reducers';
import { formReducer } from './form.reducer';

export const appReducers: ActionReducerMap<IAppState, any> = {
  router: routerReducer,
  entities: entityReducers,
  categories: categoryReducers,
  form: formReducer,
  config: configReducers,
  error: errorReducers
};
