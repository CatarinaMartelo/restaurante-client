import { FormEvent, useEffect, useState } from "react";
import Loader from "../components/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import Profile from "./Profile";

function Register() {
  const { isLoggedIn, attemptRegister } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isLoggedIn && navigate("/");
  }, [isLoggedIn]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const firstName = target.elements.namedItem(
      "firstName"
    ) as HTMLInputElement;
    const lastName = target.elements.namedItem("lastName") as HTMLInputElement;
    const email = target.elements.namedItem("email") as HTMLInputElement;
    const password = target.elements.namedItem("password") as HTMLInputElement;

    console.log(email.value, password.value);
    attemptRegister({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    })
      .then(() => {
        navigate("/profile");
      })
      .catch((e) => {
        setError(true);
        console.log(e);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="sign-in">
          <h2 className="sign-in-text">Crie a sua conta</h2>
        </div>

        <div className="form-container">
          <form className="login-form" onSubmit={handleSubmit}>
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
                disabled={loading}
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
                disabled={loading}
              />
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="email"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label">
                  Palavra-passe
                </label>
              </div>
              <div className="input-container">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={5}
                  maxLength={20}
                  required
                  className="password"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="submit-button-box">
              <button type="submit" className="submit-button">
                Registar {loading && <Loader />}
              </button>
            </div>
          </form>
          <p className="register-link">
            Já tem uma conta?{" "}
            <Link to="/login" className="login-link-text">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
