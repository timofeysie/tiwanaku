import { Action } from "@ngrx/store";

export const FORM_CATEGORY_CHANGED = 'FORM_CATEGORY_CHANGED';
export const FORM_SET_VALIDITY = 'FORM_SET_VALIDITY';

export interface IFormCategoryChangedAction extends Action {
    payload: {
        value: string;
    }
}

export interface IFormSetValidityAction extends Action {
    payload: {
        isValid: boolean;
    }
}

export function formCategoryChanged(value: string): IFormCategoryChangedAction {
    return {
        type: FORM_CATEGORY_CHANGED,
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
