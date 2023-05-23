import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AppContext);

  return (
    <div className="profile">
      <div className="profile-account">
        <h2 className="profile-account__title">
          Bem vindo(a) {user?.firstName} {user?.lastName}
        </h2>
        <div className="profile-account__actions">
          <Link to="/profile-info" className="profile-account__button">
            Informações de conta &nbsp; <i className="fa-solid fa-user"></i>
          </Link>
          <Link to="/update-profile" className="profile-account__button">
            Editar o perfil &nbsp; <i className="fa-solid fa-user-pen"></i>
          </Link>
          <Link to="/mybookings" className="profile-account__button">
            Histórico de reservas &nbsp; <i className="fa-solid fa-list-ul"></i>
          </Link>
          <Link to="/orders" className="profile-account__button">
            Histórico de facturas &nbsp; <i className="fa-solid fa-receipt"></i>
          </Link>
          <Link to="/bookings" className="profile-account__button">
            Fazer uma reserva &nbsp; <i className="fa-solid fa-utensils"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
