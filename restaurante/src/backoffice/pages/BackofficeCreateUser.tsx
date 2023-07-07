import { FormEvent, useContext, useEffect, useState } from "react";
import Loader from "../../common/components/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../common/hooks/useApp";
import Navbar from "../components/Navbar";
import { RegisterData } from "../../common/services/auth";
import { RoleName } from "../../common/services/backoffice";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";

function BackofficeCreateUser() {
  const { isLoggedIn, attemptEmployeeRegister } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<RoleName | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isLoggedIn && navigate("/backoffice/register");
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
    const role = target.elements.namedItem("role") as HTMLSelectElement;

    attemptEmployeeRegister({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      roleName: role.value,
    })
      .then(() => {
        navigate("/backoffice/dashboard");
      })
      .catch((e) => {
        setError(true);
        console.log(e);
      })
      .finally(() => setLoading(false));
  }

  /* ---------- PERMISSÕES -------------- */

  const { user, dispatch } = useContext(AppContext);
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

  /* ---------------------------- */

  return (
    <div>
      <Navbar />
      {roleName === "Admin" ? (
        <div className="login-container">
          <div className="login-box">
            <div className="sign-in">
              <h2 className="sign-in-text">
                Crie uma conta para o seu colaborador
              </h2>
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
                  <label htmlFor="role" className="form-label">
                    Categoria
                  </label>
                  <select
                    id="role"
                    name="role"
                    onChange={(event) =>
                      setSelectedRole(event.target.value as RoleName)
                    }
                    required
                    className="role"
                  >
                    <option value="">Seleccione uma categoria</option>

                    <option value="Sala">Sala</option>
                    <option value="Cozinha">Cozinha</option>
                  </select>
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
                      minLength={4}
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
                  <Link
                    to="/backoffice/dashboard"
                    className="menu__button-create-user"
                  >
                    Voltar ao painel
                  </Link>
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
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login com a sua conta de Admnistrador</p>

          <Link
            to="/backoffice/login"
            className="login-button"
            onClick={logOut}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default BackofficeCreateUser;
