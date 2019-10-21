import { IFormState, getDefaultFormState } from '../../store/state/form.state';
import { Action } from '@ngrx/store';
import { IFormCategoryChangedAction, FORM_CATEGORY_CHANGED, FORM_SET_VALIDITY, IFormSetValidityAction } from '../../store/actions/form.actions';

export function formReducer(state: IFormState = getDefaultFormState(), action: Action): IFormState {
    switch (action.type) {
        case FORM_CATEGORY_CHANGED: {
            const typedAction = <IFormCategoryChangedAction>action;
            return { ...state, category: typedAction.payload.value, isDirty: true };
        }
        case FORM_SET_VALIDITY: {
            const typedAction = <IFormSetValidityAction>action;
            return { ...state, isValid: typedAction.payload.isValid };
        }
        default: {
            return state;
        }
    }
}
