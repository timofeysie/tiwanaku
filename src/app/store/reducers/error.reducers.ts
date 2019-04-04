import * as Actions from '../actions/globalError.actions';

export function errorReducers(state: any = null, action: Actions.All) {
  switch (action.type) {

    case Actions.ADD_GLOBAL_ERROR: {
      return action.payload;
    }

    default:
      return state;
  }
}
