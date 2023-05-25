import { FormEvent, useEffect, useState } from "react";
import Loader from "../../common/components/Loader";
import { useApp } from "../../common/hooks/useApp";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
  const { isLoggedIn, attemptLogin } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isLoggedIn && navigate("/profile");
  }, [isLoggedIn]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const email = target.elements.namedItem("email") as HTMLInputElement;
    const password = target.elements.namedItem("password") as HTMLInputElement;

    attemptLogin(email.value, password.value)
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
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <div className="sign-in">
            <h2 className="sign-in-text">Entre na sua conta</h2>
          </div>

          <div className="form-container">
            <form className="login-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-container">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="email"
                    autoComplete="email"
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
                  <div>
                    <a href="#" className="forgot-password-link">
                      Esqueceu a palavra-passe?
                    </a>
                  </div>
                </div>
              </div>
              <div className="submit-button-box">
                <button type="submit" className="submit-button">
                  Entrar {loading && <Loader />}
                </button>
              </div>
            </form>
            <p className="register-link">
              Ainda não tem conta?{" "}
              <Link to="/register" className="register-link-text">
                Registe-se
              </Link>
            </p>
          </div>
          {error && (
            <p className="text-red-500 mt-4">
              Email ou palavra-passe inválido/a
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
