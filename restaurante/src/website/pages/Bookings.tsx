function Bookings() {
  return (
    <div className="booking-container">
      <div className="booking-box">
        <div className="booking">
          <h2 className="booking-text">Faça a sua reserva</h2>
        </div>

        <div className="form-container">
          <form className="booking-form">
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
                placeholder="Opcional, se for o mesmo do seu perfil"
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
                placeholder="Opcional, se for o mesmo do seu perfil"
              />
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
                type="text"
                autoComplete="off"
                required
                className="time"
              />
              <label htmlFor="password" className="form-label">
                Número de pessoas
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={5}
                maxLength={20}
                required
                className="password"
              />
            </div>

            <div className="submit-button-box">
              <button type="submit" className="submit-button">
                Reservar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Bookings;
