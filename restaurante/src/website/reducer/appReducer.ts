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
    case "SET_PROFILE_DATA": // New action type
      return {
        ...state,
        user: {
          ...state.user,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
        },
      };
    case "UPDATE_PROFILE_DATA":
      return {
        ...state,
        profile: {
          ...state.profile,
          birthday: payload.birthday,
          vatNumber: payload.vatNumber,
          telephone: payload.telephone,
        },
      };
    default:
      return state;
  }
}
