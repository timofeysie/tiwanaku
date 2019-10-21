export interface IFormState {
    category?: string;
    isValid: boolean;
    isDirty: boolean;
}


export function getDefaultFormState(): IFormState {
    return {
        isValid: false,
        isDirty: false
    };
}

export const initialFormState: IFormState = {
    isValid: false,
    isDirty: false
};
