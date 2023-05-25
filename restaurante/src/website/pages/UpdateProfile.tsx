import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../common/context/AppContext";
import Navbar from "../components/Navbar";

const UpdateProfile = () => {
  const { dispatch } = useContext(AppContext);

  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("formData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          birthday: "",
          vatNumber: "",
          telephone: "",
        };
  });

  const [showTelephoneWarning, setShowTelephoneWarning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispatch the action to update the profile data
    dispatch({ type: "UPDATE_PROFILE_DATA", payload: formData });
    navigate("/profile"); // Redirect to the Profile component
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div>
      <Navbar />
      <div className="profile">
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

          {showTelephoneWarning && (
            <p id="telephone-error" className="error-message">
              Apenas caracteres numéricos
            </p>
          )}

          <button type="submit">Atualizar Perfil</button>
          <Link to="/profile" className="profile-account__button">
            Voltar ao perfil inicial
          </Link>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
