import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { reducer } from "../reducer/appReducer";
import { login, profile, register, RegisterData } from "../services/auth";
import { Booking, Profile, User } from "../models/user";
import { book, BookingData, updateBooking } from "../services/bookings";
import {
  addItem,
  AuthResponse,
  Category,
  fetchMenuItems,
  getMenuItemsByCategory,
  MenuItem,
} from "../services/menuItems";
import { Role } from "../models/role";
import { getRoleNameThroughId } from "../services/role";
import { addTable, getTables, TableData } from "../services/tables";

export type AppState = {
  user?: User;
  role?: Role;
  MenuItem?: MenuItem;
  booking?: Booking;
  profile?: Profile;
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  isBooked: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  roleName?: string;
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
  tables: TableData[];
  id?: string;
  table?: number;
  setUser?: React.Dispatch<React.SetStateAction<User>>;
  bookingList: Booking[];
  loading: boolean;
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
  attemptEmployeeRegister: (data: RegisterData) => Promise<void>;
  attemptBooking: (data: BookingData) => Promise<void>;
  getBookingList: () => Promise<void>;
  attemptAddingItem: (data: MenuItem) => Promise<void>;
  fetchMenuItemsByCategory: (
    productCategoryId: string,
    authResponse: AuthResponse
  ) => Promise<void>;
  getRoleName: (roleId: string) => Promise<Role | null>;
  attemptAddingTable: (data: TableData) => Promise<TableData>;
  updateBookings: (id: string, data: BookingData) => Promise<void>;
  getTableRecords: () => Promise<TableData[]>;
  logout: () => void;
}

export const AppContext = createContext({} as AppContextModel);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useContext(AppContext);
  const initialState: AppState = {
    user,
    setUser,
    role: undefined,
    isLoggedIn: false,
    isAdminLoggedIn: false,
    isBooked: false,
    firstName: undefined,
    lastName: undefined,
    roleId: undefined,
    roleName: undefined,
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
    tables: [],
    id: undefined,
    table: undefined,
    bookingList: [],
    loading: false,
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

  async function attemptEmployeeRegister(data: RegisterData) {
    console.log(data);
    const { token } = await register(data);
    console.log(token);
    if (token) {
      localStorage.setItem("token", token);
    }
  }

  async function getRoleName(roleId: string) {
    console.log(roleId);

    const roleName = await getRoleNameThroughId(roleId);
    return roleName;
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

  async function fetchMenuItemsByCategory(productCategoryId: string) {
    try {
      console.log("fetch function started");
      const response = await getMenuItemsByCategory(productCategoryId);
      console.log("RESPONSE LOG:", response);
      dispatch({ type: "SET_MENU_ITEMS", payload: response });
      console.log("RESPONSE 2 LOG:", response);
    } catch (error: any) {
      console.log("Error fetching menu itemssss:", error.message);
    }
  }

  async function attemptAddingTable(data: TableData) {
    try {
      console.log("MY DATA:", data);
      const tableRecord = await addTable(data);
      console.log("Table Record:", tableRecord);
      dispatch({ type: "CREATE_TABLE", payload: tableRecord });
      localStorage.setItem("tableData", JSON.stringify(data));

      return tableRecord; // Return the table record
    } catch (error) {
      console.log("Error adding table:", error);
      throw error; // Rethrow the error to handle it in the component
    }
  }

  async function updateBookings(id: string, data: BookingData) {
    console.log("MY DATA:", data);
    try {
      await updateBooking(id, data);
      console.log("Update successful");
      dispatch({ type: "UPDATE_BOOKING", payload: data });
      localStorage.setItem("updatedBookingData", JSON.stringify(data));
      return; // Add a return statement here
    } catch (error) {
      console.error("Update failed:", error);
      throw error; // Optionally, rethrow the error to handle it in the component
    }
  }

  async function getTableRecords(): Promise<TableData[]> {
    try {
      const response = await getTables();
      const tableRecords = response; // Access the table records directly from the response
      console.log("Table records:", tableRecords);
      dispatch({ type: "FETCH_TABLES", payload: tableRecords });

      localStorage.setItem("tableRecords", JSON.stringify(tableRecords));
      return tableRecords; // Return the table records
    } catch (error: any) {
      console.log("Error fetching tables:", error.message);
      throw error; // Throw the error to be caught by the caller
    }
  }

  const logout = () => dispatch({ type: "LOGOUT" });

  const value = {
    ...appState,
    dispatch,
    attemptLogin,
    attemptRegister,
    attemptEmployeeRegister,
    logout,
    attemptBooking,
    getBookingList,
    attemptAddingItem,
    fetchMenuItemsByCategory,
    getRoleName,
    attemptAddingTable,
    updateBookings,
    getTableRecords,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
