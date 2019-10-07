import { Action } from "@ngrx/store";

export const FORM_NAME_CHANGED = 'FORM_NAME_CHANGED';
export const FORM_SET_VALIDITY = 'FORM_SET_VALIDITY';

export interface IFormNameChangedAction extends Action {
    payload: {
        value: string;
    }
}

export interface IFormSetValidityAction extends Action {
    payload: {
        isValid: boolean;
    }
}

export function formNameChanged(value: string): IFormNameChangedAction {
    return {
        type: FORM_NAME_CHANGED,
        payload: {
            value
        }
    };
}

export function formSetValidity(isValid: boolean): IFormSetValidityAction {
    return {
        type: FORM_SET_VALIDITY,
        payload: {
            isValid
        }
    };
}
