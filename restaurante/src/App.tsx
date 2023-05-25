import { Outlet } from "react-router-dom";
import Navbar from "./website/components/Navbar";

function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
