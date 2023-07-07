import React, { useContext, useState } from "react";
import { AppContext } from "../../common/context/AppContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRoleNameThroughId } from "../../common/services/role";

const ProfileInfo: React.FC = () => {
  const { user, dispatch } = useContext(AppContext);

  const profileData = JSON.parse(localStorage.getItem("formData") || "null");

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
    <div className="client-profile-info">
      <Navbar />
      {roleName === "Client" ? (
        <div className="profile-info">
          <div className="profile-account">
            <h3 className="profile-account__info_label">Dados de conta</h3>
            <div className="profile-account__info">
              <div>
                <p>Email</p>
                <p className="profile-account__label">{user?.email}</p>
              </div>
              {profileData && profileData.vatNumber && (
                <div>
                  <p>VAT Number</p>
                  <p className="profile-account__label">
                    {profileData.vatNumber}
                  </p>
                </div>
              )}

              {profileData && profileData.telephone && (
                <div>
                  <p>Telefone</p>
                  <p className="profile-account__label">
                    {profileData.telephone}
                  </p>
                </div>
              )}

              {profileData && profileData.birthday && (
                <div>
                  <p>Data de nascimento</p>
                  <p className="profile-account__label">
                    {profileData.birthday}
                  </p>
                </div>
              )}
              {profileData && profileData.address && (
                <div>
                  <p>Morada</p>
                  <p className="profile-account__label">
                    {profileData.address}
                  </p>
                </div>
              )}
              {profileData && profileData.zipCode && (
                <div>
                  <p>Código-Postal</p>
                  <p className="profile-account__label">
                    {profileData.zipCode}
                  </p>
                </div>
              )}
            </div>
            <div className="profile-account__actions">
              <Link to="/update-profile" className="profile-account__button">
                Editar o perfil &nbsp; <i className="fa-solid fa-user-pen"></i>
              </Link>
              <Link to="/profile" className="profile-account__button">
                Voltar ao perfil inicial
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

export default ProfileInfo;
