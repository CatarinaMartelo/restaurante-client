import { useContext } from "react";
import "../styles/styles.css";
import { AppContext } from "../context/AppContext";
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
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/products">Menu</a>
        </li>
        <li>
          <a href="/orders">Entregas</a>
        </li>
        <li>
          <a href="/contacts">Contactos</a>
        </li>
        <li className="account-and-logout">
          <a href="/login">
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
