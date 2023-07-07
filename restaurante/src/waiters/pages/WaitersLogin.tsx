import { FormEvent, useContext, useEffect, useState } from "react";
import Loader from "../../common/components/Loader";
import { useApp } from "../../common/hooks/useApp";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { findByEmail, getUsers } from "../../common/services/auth";
import { getRoleNameThroughId } from "../../common/services/role";
import { AppContext } from "../../common/context/AppContext";

function WaitersLogin() {
  const { user, setUser } = useContext(AppContext);

  const { isLoggedIn, attemptLogin } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isLoggedIn && navigate("/waiters/dashboard");
  }, [isLoggedIn, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const email = target.elements.namedItem("email") as HTMLInputElement;
    const password = target.elements.namedItem("password") as HTMLInputElement;

    const users = await getUsers();
    const userWithEmail = users.find((user) => user.email === email.value);

    console.log(userWithEmail);

    if (userWithEmail) {
      const role = await getRoleNameThroughId(userWithEmail.roleId);
      const roleName = role.name;

      if (userWithEmail && roleName === "Sala") {
        attemptLogin(email.value, password.value)
          .then(() => {
            // Retrieve the user details including roleName
            findByEmail(email.value)
              .then((userDetails) => {
                const loggedInUser = {
                  ...user,
                  ...userDetails,
                  email: email.value,
                };
                if (setUser) setUser(loggedInUser);
                console.log("user", loggedInUser);
                localStorage.setItem("user", JSON.stringify(loggedInUser));
                navigate("/waiters/dashboard");
              })
              .catch((error) => {
                setError(true);
                console.log(error);
              })
              .finally(() => setLoading(false));
          })
          .catch((e: any) => {
            setError(true);
            console.log(e);
            setLoading(false);
          });
      } else {
        setError(true);
        setLoading(false);
      }
    }
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
              <Link to="/backoffice/register" className="register-link-text">
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

export default WaitersLogin;
