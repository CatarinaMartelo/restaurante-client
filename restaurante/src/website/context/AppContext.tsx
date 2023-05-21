import { createContext, ReactNode, useEffect, useReducer } from "react";
import { reducer } from "../reducer/appReducer";
import { login, profile, register, RegisterData } from "../services/auth";
import { User } from "../models/user";

export type AppState = {
  user?: User;
  isLoggedIn: boolean;
};

export type AppAction = {
  type: string;
  payload?: any;
};

interface AppContextModel extends AppState {
  dispatch: React.Dispatch<AppAction>;
  attemptLogin: (username: string, password: string) => Promise<void>;
  attemptRegister: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AppContext = createContext({} as AppContextModel);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const initialState: AppState = {
    user: undefined,
    isLoggedIn: false,
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
    }
  }

  const logout = () => dispatch({ type: "LOGOUT" });

  const value = {
    ...appState,
    dispatch,
    attemptLogin,
    attemptRegister,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
