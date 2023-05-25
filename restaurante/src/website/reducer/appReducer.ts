import { AppAction, AppState } from "../../common/context/AppContext";

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
    case "ADD_ITEM":
      return { ...state, menuItems: [...state.menuItems, payload] };

    case "SET_MENU_ITEMS":
      console.log("New menuItem state:", action.payload);
      return {
        ...state,
        menuItem: action.payload, // Update the menuItem state with the fetched menu items
      };
    case "FETCH_CATEGORY":
      return { ...state, category: payload };

    default:
      return state;
  }
}
