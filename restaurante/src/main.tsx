import ReactDOM from "react-dom/client";
import "./index.css";
import AppProvider from "../src/website/context/AppContext.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "../src/website/routes/index.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);
