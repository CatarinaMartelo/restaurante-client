import { useContext } from "react";
import "../../backoffice/styles/styles.css";
import { AppContext } from "../../common/context/AppContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <nav className="navbar">
      <ul className="navbar-ul">
        <li>
          <a href="/backoffice">Home</a>
        </li>
        <li>
          <a href="/backoffice/menu">Menu</a>
        </li>
        <li>
          <a href="/backoffice/utilizadores">Utilizadores</a>
        </li>
        <li className="account-and-logout">
          <a href="/login">
            <i className="fa-solid fa-user"></i>
          </a>
          <a href="/backoffice">
            <i className="fa-solid fa-user-lock"></i>
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
