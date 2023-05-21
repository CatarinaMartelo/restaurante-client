import { AppAction, AppState } from "../context/AppContext";

export function reducer(state: AppState, { type, payload }: AppAction) {
  switch (type) {
    case "LOGIN":
      return { ...state, user: payload, isLoggedIn: true };
    case "LOGOUT":
      localStorage.removeItem("token");
      return { ...state, user: undefined, isLoggedIn: false, cart: [] };
    case "SET_CART":
      return { ...state, cart: payload };
    case "CLEAR_CART":
      localStorage.removeItem("cart");
      return { ...state, cart: [] };
    default:
      return state;
  }
}
