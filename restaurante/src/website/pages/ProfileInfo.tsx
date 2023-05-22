import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const ProfileInfo: React.FC = () => {
  const { user } = useContext(AppContext);

  const profileData = JSON.parse(localStorage.getItem("formData") || "null");

  return (
    <div className="profile">
      <div className="profile-account">
        <div className="profile-account__info">
          <h3 className="profile-account__info_label">Dados de conta</h3>
          <div>
            <p>Email</p>
            <p className="profile-account__label">{user?.email}</p>
          </div>
          {profileData && profileData.vatNumber && (
            <div>
              <p>VAT Number</p>
              <p className="profile-account__label">{profileData.vatNumber}</p>
            </div>
          )}

          {profileData && profileData.telephone && (
            <div>
              <p>Telefone</p>
              <p className="profile-account__label">{profileData.telephone}</p>
            </div>
          )}

          {profileData && profileData.birthday && (
            <div>
              <p>Data de nascimento</p>
              <p className="profile-account__label">{profileData.birthday}</p>
            </div>
          )}
          <div className="profile-account__actions">
            <Link to="/profile" className="profile-account__button">
              Voltar ao perfil inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
