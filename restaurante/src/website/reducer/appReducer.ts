import { AppAction, AppState } from "../context/AppContext";

export function reducer(state: AppState, action: AppAction) {
  const { type, payload } = action;
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
    case "SET_PROFILE_DATA":
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
    case "ADD_BOOKING":
      if (state.user) {
        return {
          ...state,
          user: {
            ...state.user,
            bookings: [...state.user.bookings, payload],
          },
        };
      }
      return state;
    case "SET_BOOKING_LIST":
      return { ...state, bookingList: payload };

    default:
      return state;
  }
}
