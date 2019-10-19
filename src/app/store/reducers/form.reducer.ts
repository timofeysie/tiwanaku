import { IFormState, getDefaultFormState } from '../../store/state/form.state';
import { Action } from '@ngrx/store';
import { IFormNameChangedAction, FORM_NAME_CHANGED, FORM_SET_VALIDITY, IFormSetValidityAction } from "../../store/actions/form.actions";

export function formReducer(state: IFormState = getDefaultFormState(), action: Action): IFormState {
    switch (action.type) {
        case FORM_NAME_CHANGED: {
            const typedAction = <IFormNameChangedAction>action;
            return { ...state, name: typedAction.payload.value, isDirty: true };
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
