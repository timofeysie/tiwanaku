import { createSelector } from '@ngrx/store';

import { IAppState } from '../state/app.state';
import { IEntityState } from '../state/entity.state';

const selectEntities = (state: IAppState) => state.entities;

export const selectEntityList = createSelector(
  selectEntities,
  (state: IEntityState) => state.entities
);

export const selectSelectedEntity = createSelector(
  selectEntities,
  (state: IEntityState) => state.selectedEntity
);
