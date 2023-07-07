import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../common/context/AppContext";
import Navbar from "../components/Navbar";
import { getRoleNameThroughId } from "../../common/services/role";
import { updateProfile } from "../../common/services/auth";

const UpdateProfile = () => {
  const { user, dispatch } = useContext(AppContext);

  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("formData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          birthday: null,
          vatNumber: null,
          telephone: null,
          address: null,
          zipCode: null,
        };
  });

  const [showTelephoneWarning, setShowTelephoneWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);

    const profileId = user?.profile.id;
    if (profileId) {
      const updatedProfile = await updateProfile(profileId, formData);
      // Dispatch the action to update the profile data
      console.log("updated profile", updatedProfile);
      navigate("/profile"); // Redirect to the Profile component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValue = value.trim() === "" ? null : value;

    setFormData((prevFormData: FormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
  };

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  const handleNumericInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const inputValue = input.value;
    const numericValue = inputValue.replace(/[^\d+]/g, "");

    input.value = numericValue;

    if (inputValue !== numericValue) {
      setShowTelephoneWarning(true);
    } else {
      setShowTelephoneWarning(false);
    }
  };

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
    <div className="update-profile">
      <Navbar />
      {roleName === "Client" ? (
        <div className="update-profile-container">
          <div className="update-profile-box">
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="birthday">Data de nascimento</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                className="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />

              <label htmlFor="vatNumber">Número de contribuinte</label>
              <input
                type="text"
                id="vatNumber"
                name="vatNumber"
                className="vat-number"
                value={formData.vatNumber}
                onChange={handleChange}
              />

              <label htmlFor="telephone">Contacto telefónico</label>
              <input
                type="text"
                id="telephone"
                name="telephone"
                className="telephone"
                value={formData.telephone}
                onChange={handleChange}
                onInput={handleNumericInput}
                title="only numbers"
              />
              <label htmlFor="address">Morada</label>
              <input
                type="text"
                id="address"
                name="address"
                className="address"
                value={formData.address}
                onChange={handleChange}
              />
              <label htmlFor="zipCode">Código Postal</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                className="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="0000-000"
              />

              {showTelephoneWarning && (
                <p id="telephone-error" className="error-message">
                  Apenas caracteres numéricos
                </p>
              )}
              <div className="update-profile-buttons">
                <button type="submit">Atualizar</button>
                <Link to="/profile-info" className="profile-account__button">
                  Voltar
                </Link>
              </div>
            </form>
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

export default UpdateProfile;
