import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="sign-in">
          <h2 className="sign-in-text">Create your account</h2>
        </div>

        <div className="form-container">
          <form className="login-form" method="post" action="/login">
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
                Sign in
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
