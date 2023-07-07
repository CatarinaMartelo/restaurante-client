import { AppAction, AppState } from "../context/AppContext";

export function reducer(state: AppState, action: AppAction): AppState {
  const { type, payload } = action;
  switch (type) {
    case "LOGIN":
      return { ...state, user: payload, isLoggedIn: true };
    case "LOGOUT":
      localStorage.removeItem("token");
      return { ...state, user: undefined, isLoggedIn: false };
    case "SET_PROFILE_DATA":
      return {
        ...state,
        user: {
          ...state.user,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          id: payload.id || "",
          roleName: payload.roleName || "",
          roleId: payload.roleId || "",
          role: payload.role || undefined,
          profile: payload.profile || undefined,
          createdAt: payload.createdAt || "",
          updatedAt: payload.updatedAt || "",
          bookings: payload.bookings || [], // Provide a default value of an empty array for bookings
        },
      };
    case "UPDATE_USER_PROFILE":
      if (state.user) {
        const updatedUser = {
          ...state.user,
          profile: payload,
        };
        return {
          ...state,
          user: updatedUser,
        };
      }
      return state;

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
    case "SET_BOOKINGS_BY_DATE":
      console.log("New Booking state:", action.payload);
      return {
        ...state,
        booking: action.payload, // Update the menuItem state with the fetched menu items
      };
    case "FETCH_CATEGORY":
      return { ...state, category: payload };
    case "CREATE_TABLE":
      return {
        ...state,
        tables: [...state.tables, payload],
      };
    case "UPDATE_BOOKING":
      if (state.user && state.user.bookings) {
        const updatedBookings = state.user.bookings.map((booking) =>
          booking.id === payload.id
            ? { ...booking, tableId: payload.tableId }
            : booking
        );
        return {
          ...state,
          user: {
            ...state.user,
            bookings: updatedBookings,
          },
        };
      }
      return state;

    case "FETCH_TABLES":
      return { ...state, tables: payload, loading: false };

    default:
      return state;
  }
}
