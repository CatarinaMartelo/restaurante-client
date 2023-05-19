import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const response = await axios.post("http://localhost:3001/register", {
        firstName,
        lastName,
        email,
        password,
      });

      const token = response.data.token;

      console.log(response.data);

      localStorage.setItem("token", token);

      navigate("/profile");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="sign-in">
          <h2 className="sign-in-text">Create your account</h2>
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
                />
              </div>
            </div>
            <div className="submit-button-box">
              <button type="submit" className="submit-button">
                Sign up
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
