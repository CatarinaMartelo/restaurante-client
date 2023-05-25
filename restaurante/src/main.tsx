import ReactDOM from "react-dom/client";
import "./index.css";
import AppProvider from "./common/context/AppContext.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./website/routes/index.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
