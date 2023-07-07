import { useContext, useState } from "react";

import { AppContext } from "../../common/context/AppContext";
import { useNavigate } from "react-router-dom";
import { getRoleNameThroughId } from "../../common/services/role";

const Navbar = () => {
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  /* ---------- PERMISSÕES -------------- */
  const { user, setUser } = useContext(AppContext);
  const [roleName, setRoleName] = useState("");

  const roleId = user?.roleId;

  if (roleId) {
    const fetchRoleName = async () => {
      try {
        const role = await getRoleNameThroughId(roleId);
        console.log(role);
        setRoleName(role.name);
      } catch (error) {
        console.log("Error fetching role name:", error);
      }
    };

    fetchRoleName();
  }

  const handleLogout = () => {
    if (user) {
      dispatch({ type: "LOGOUT" });
      navigate("/waiters/login");
    } else {
      navigate("/waiters/dashboard");
    }
  };

  const handleExit = () => {
    if (user) {
      navigate("/waiters/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="backoffice-navbar">
      <ul className="navbar-ul">
        <li>
          <h2 className="backoffice-title" onClick={handleExit}>
            GESTÃO DE SALA&nbsp;{" "}
            <span className="backoffice-title-span"> Zeferino</span>
          </h2>
        </li>
        <li className="account-and-logout">
          <a href="/waiters/login">
            <i className="fa-solid fa-user"></i>
          </a>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
