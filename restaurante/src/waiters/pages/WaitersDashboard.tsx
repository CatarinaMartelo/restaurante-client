import React, { useContext, useState } from "react";
import { AppContext } from "../../common/context/AppContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRoleNameThroughId } from "../../common/services/role";

const WaitersDashboard = () => {
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
    <div>
      <Navbar />
      {roleName === "Sala" || roleName === "Admin" ? (
        <div className="profile">
          <div className="waiters-dashboard">
            <h2 className="profile-account__title">
              Bem vindo(a) {user?.firstName} {user?.lastName}
            </h2>
            <div className="profile-account__actions">
              <Link to="/waiters/tables" className="profile-account__button">
                Operação de Sala &nbsp; <i className="fa-solid fa-chair"></i>
              </Link>
              <Link
                to="/backoffice/orders-list"
                className="profile-account__button"
              >
                Relatório de Facturação &nbsp;{" "}
                <i className="fa-solid fa-sack-dollar"></i>
              </Link>
              <Link
                to="/waiters/manage-tables"
                className="profile-account__button"
              >
                Configurações &nbsp; <i className="fa-solid fa-gear"></i>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login com a sua conta de Gestão de Sala</p>

          <Link to="/waiters/login" className="login-button" onClick={logOut}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default WaitersDashboard;
