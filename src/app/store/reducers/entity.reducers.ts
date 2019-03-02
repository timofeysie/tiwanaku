import { EEntityActions } from './../actions/entity.actions';
import { EntityActions } from '../actions/entity.actions';
import { initialEntityState, IEntityState } from '../state/entity.state';

export const entityReducers = (
  state = initialEntityState,
  action: EntityActions
): IEntityState => {
  switch (action.type) {
    case EEntityActions.GetEntitiesSuccess: {
      return {
        ...state,
        entities: action.payload
      };
    }
    case EEntityActions.GetEntitySuccess: {
      return {
        ...state,
        selectedEntity: action.payload
      };
    }

    default:
      return state;
  }
};
