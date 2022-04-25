import { IAction, IState } from "types/context";

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer
