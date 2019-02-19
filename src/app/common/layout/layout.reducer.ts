import * as layout from "./layout.actions";
/** The reducer of the layout will handle all changes of the application 
 * layout and create a new state every time the UI has to change. */
export interface State {
  /* The description of the different parts of the layout go here */
}

const initialState: State = {
  /* The initial values of the layout state will be initialized here */
};

/** The reducer of the layout state. Each time an action for the layout is dispatched,
  it will create a new state for the layout. */
export function reducer (
    state = initialState,
    action: layout.LayoutActions
    ): any {
    //     switch (action.type) {
    //         default:
    //             return state;
    // }
}