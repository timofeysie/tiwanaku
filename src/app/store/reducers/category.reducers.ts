import { ECategoryActions } from './../actions/category.actions';
import { CategoryActions } from '../actions/category.actions';
import { initialCategoryState, ICategoryState } from '../state/category.state';

export const categoryReducers = (
  state = initialCategoryState,
  action: CategoryActions
): ICategoryState => {
  switch (action.type) {
    case ECategoryActions.GetCategoriesSuccess: {
      return {
        ...state,
        categories: action.payload
      };
    }
    case ECategoryActions.GetCategorySuccess: {
      return {
        ...state,
        selectedCategory: action.payload
      };
    }

    default:
      return state;
  }
};
