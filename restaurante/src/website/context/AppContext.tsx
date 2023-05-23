import { createContext, ReactNode, useEffect, useReducer } from "react";
import { reducer } from "../reducer/appReducer";
import { login, profile, register, RegisterData } from "../services/auth";
import { Booking, Profile, User } from "../models/user";
import { book, BookingData, getBookings } from "../services/bookings";

export type AppState = {
  user?: User;
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
};

export type AppAction = {
  type: string;
  payload?: any;
};

interface AppContextModel extends AppState {
  dispatch: React.Dispatch<AppAction>;
  attemptLogin: (username: string, password: string) => Promise<void>;
  attemptRegister: (data: RegisterData) => Promise<void>;
  attemptBooking: (data: BookingData) => Promise<void>;
  getBookingList: () => Promise<void>;
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

  const logout = () => dispatch({ type: "LOGOUT" });

  const value = {
    ...appState,
    dispatch,
    attemptLogin,
    attemptRegister,
    logout,
    attemptBooking,
    getBookingList,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
