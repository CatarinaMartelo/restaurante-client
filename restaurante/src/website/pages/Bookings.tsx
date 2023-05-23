import { useContext, useState, ChangeEvent, FormEvent, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";

function Bookings() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    time: "",
    paxNumber: "",
    observations: "",
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
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "paxNumber" ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const { isBooked, attemptBooking } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isBooked && navigate("/profile");
  }, [isBooked]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const firstName = target.elements.namedItem(
      "firstName"
    ) as HTMLInputElement;
    const lastName = target.elements.namedItem("lastName") as HTMLInputElement;
    const date = target.elements.namedItem("date") as HTMLInputElement;
    const time = target.elements.namedItem("time") as HTMLInputElement;
    const paxNumber = parseInt(
      (target.elements.namedItem("pax-number") as HTMLInputElement).value,
      10
    );
    const observations = target.elements.namedItem(
      "observations"
    ) as HTMLInputElement;

    console.log(date.value, paxNumber);
    attemptBooking({
      firstName: firstName.value,
      lastName: lastName.value,
      date: date.value,
      time: time.value,
      paxNumber: paxNumber,
      observations: observations.value,
    })
      .then(() => {
        navigate("/profile");
      })
      .catch((e) => {
        setError(true);
        console.log(e);
      })

      .finally(() => setLoading(false));

    console.log("LOGGING:", firstName.value);
  }

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
