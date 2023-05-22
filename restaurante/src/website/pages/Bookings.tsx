import { useContext, useState, ChangeEvent, FormEvent } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

function Bookings() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const { user } = useContext(AppContext);

  const handleAutoFill = () => {
    setFormData({
      ...formData,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="booking-container">
      <div className="booking-box">
        <div className="booking">
          <h2 className="booking-text">Faça a sua reserva</h2>
        </div>

        <div className="form-container">
          <form className="booking-form" onSubmit={handleSubmit}>
            <div>
              <div>
                <label htmlFor="firstName" className="form-label">
                  Nome
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="off"
                  required
                  className="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <label htmlFor="lastName" className="form-label">
                  Apelido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="off"
                  required
                  className="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="bookings-button"
                  onClick={handleAutoFill}
                >
                  Utilizar dados de conta
                </button>
              </div>
              <label htmlFor="date" className="form-label">
                Data
              </label>

              <input
                id="date"
                name="date"
                type="date"
                autoComplete="off"
                required
                className="date"
              />
              <label htmlFor="time" className="form-label">
                Hora
              </label>

              <input
                id="time"
                name="time"
                type="time"
                autoComplete="off"
                required
                className="time"
              />
              <label htmlFor="pax-number" className="form-label">
                Número de pessoas
              </label>

              <input
                id="pax-number"
                name="pax-number"
                type="number"
                required
                className="pax-number"
                min="0"
              />
              <label htmlFor="observations" className="form-label">
                Observações
              </label>

              <input
                id="observations"
                name="observations"
                type="text"
                required
                className="observations"
              />
            </div>

            <div className="profile-account__actions_bookings">
              <button type="submit" className="submit-button_bookings">
                Reservar
              </button>

              <Link to="/profile" className="profile-account__button_bookings">
                Voltar ao perfil inicial
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Bookings;
