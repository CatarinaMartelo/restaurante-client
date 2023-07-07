import { useContext, useState } from "react";
import { AppContext } from "../../common/context/AppContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRoleNameThroughId } from "../../common/services/role";

const Profile = () => {
  const { user, dispatch } = useContext(AppContext);

  const [roleName, setRoleName] = useState("");

  const roleId = user?.roleId;

  if (roleId) {
    const fetchRoleName = async () => {
      try {
        const role = await getRoleNameThroughId(roleId);
        setRoleName(role.name);
      } catch (error) {
        console.log("Error fetching role name:", error);
      }
    };

    fetchRoleName();
  }

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <div className="client-dashboard">
      <Navbar />

      {roleName === "Client" ? (
        <div className="dashboard-container">
          <div className="dashboard-box">
            <h2 className="profile-account__title">
              Bem vindo(a) {user?.firstName} {user?.lastName}
            </h2>
            <div className="profile-account__actions">
              <Link to="/profile-info" className="profile-account__button">
                Informações de conta &nbsp; <i className="fa-solid fa-user"></i>
              </Link>

              <Link to="/mybookings" className="profile-account__button">
                Histórico de reservas &nbsp;{" "}
                <i className="fa-solid fa-list-ul"></i>
              </Link>
              <Link to="/myorders" className="profile-account__button">
                Histórico de pedidos &nbsp;{" "}
                <i className="fa-solid fa-receipt"></i>
              </Link>
              <Link to="/home" className="profile-account__button">
                Navegar até à página principal &nbsp;{" "}
                <i className="fa-solid fa-paper-plane"></i>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login como Cliente para que possa aceder</p>

          <Link to="/login" className="login-button" onClick={logOut}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
