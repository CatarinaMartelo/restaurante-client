import { createContext, ReactNode, useEffect, useReducer } from "react";
import { reducer } from "../../website/reducer/appReducer";
import {
  login,
  profile,
  register,
  RegisterData,
} from "../../website/services/auth";
import { Booking, Profile, User } from "../../website/models/user";
import { book, BookingData } from "../../website/services/bookings";
import {
  addItem,
  AuthResponse,
  Category,
  fetchMenuItems,
  getMenuItemsByCategory,
  MenuItem,
} from "../../website/services/menuItems";

export type AppState = {
  user?: User;
  MenuItem?: MenuItem;
  booking?: Booking;
  profile?: Profile;
  isLoggedIn: boolean;
  isBooked: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  vatNumber?: string;
  telephone?: number;
  date?: string;
  time?: string;
  paxNumber?: number;
  observations?: string;
  bookingData: [];
  name?: string;
  price?: string;
  description?: string;
  productCategoryId?: string;
  isItemAdded: boolean;
  menuItem: [];
  category?: Category;
  menuItems: MenuItem[];
};

export type AppAction = {
  type: string;
  payload?: any;
};

export type AddItemAction = {
  type: "ADD_ITEM";
  payload: MenuItem;
};

export type getCategoryAction = {
  type: "FETCH_CATEGORY";
  payload: Category;
};

export type setMenuItems = {
  type: "SET_NEW_ITEM";
  payload: MenuItem;
};

interface AppContextModel extends AppState {
  dispatch: React.Dispatch<AppAction>;
  attemptLogin: (username: string, password: string) => Promise<void>;
  attemptRegister: (data: RegisterData) => Promise<void>;
  attemptBooking: (data: BookingData) => Promise<void>;
  getBookingList: () => Promise<void>;
  attemptAddingItem: (data: MenuItem) => Promise<void>;
  fetchMenuItemsByCategory: (
    productCategoryId: string,
    authResponse: AuthResponse
  ) => Promise<void>;
  logout: () => void;
}

export const AppContext = createContext({} as AppContextModel);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const initialState: AppState = {
    user: undefined,
    isLoggedIn: false,
    isBooked: false,
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    birthday: undefined,
    vatNumber: undefined,
    telephone: undefined,
    date: undefined,
    time: undefined,
    paxNumber: undefined,
    bookingData: [],
    name: undefined,
    price: undefined,
    description: undefined,
    isItemAdded: false,
    menuItem: [],
    productCategoryId: undefined,
    category: undefined,
    menuItems: [],
  };

  const [appState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      profile().then((user) => {
        dispatch({ type: "LOGIN", payload: user });
      });
    }
  }, []);

  async function attemptLogin(email: string, password: string) {
    const { token } = await login(email, password);
    if (token) {
      localStorage.setItem("token", token);
      const user = await profile();
      dispatch({ type: "LOGIN", payload: user });
    }
  }

  async function attemptRegister(data: RegisterData) {
    console.log(data);
    const { token } = await register(data);
    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
      const user = await profile();
      dispatch({ type: "LOGIN", payload: user });
      dispatch({ type: "SET_PROFILE_DATA", payload: user });
    }
  }

  async function attemptBooking(data: BookingData) {
    console.log(data);
    const { token } = await book(data);
    console.log(token);
    if (token) {
      dispatch({ type: "ADD_BOOKING", payload: data });
    }
    localStorage.setItem("bookingData", JSON.stringify(data));
  }

  async function getBookingList() {
    const savedTableData = localStorage.getItem("bookingData");
    const bookingData = savedTableData ? JSON.parse(savedTableData) : [];
    dispatch({ type: "SET_BOOKING_LIST", payload: bookingData });
  }

  async function attemptAddingItem(data: MenuItem) {
    console.log("MY DATA:", data);
    const { token } = await addItem(data);
    console.log("MY TOKEN:", token);
    if (token) {
      dispatch({ type: "ADD_ITEM", payload: data });
    }
    localStorage.setItem("itemData", JSON.stringify(data));
    dispatch({ type: "SET_NEW_MENU_ITEM", payload: data });
  }

  async function fetchMenuItemsByCategory(
    productCategoryId: string,
    authResponse: AuthResponse
  ) {
    try {
      const { token } = authResponse;
      console.log("fetch function started");
      const response = await getMenuItemsByCategory(productCategoryId, token);
      console.log("RESPONSE LOG:", response);
      dispatch({ type: "SET_MENU_ITEMS", payload: response });
      console.log("RESPONSE 2 LOG:", response);
    } catch (error: any) {
      console.log("Error fetching menu itemssss:", error.message);
    }
  }

  const logout = () => dispatch({ type: "LOGOUT" });

  const value = {
    ...appState,
    dispatch,
    attemptLogin,
    attemptRegister,
    logout,
    attemptBooking,
    getBookingList,
    attemptAddingItem,
    fetchMenuItemsByCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
