import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="sign-in">
          <h2 className="sign-in-text">Sign in to your account</h2>
        </div>

        <div className="form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
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
                  Password
                </label>
                <a href="#" className="forgot-password-link">
                  Forgot password?
                </a>
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
                Sign in {loading && <Loader />}
              </button>
            </div>
          </form>
          <p className="register-link">
            Not a member?{" "}
            <Link to="/register" className="register-link-text">
              Register
            </Link>
          </p>
        </div>
        {error && (
          <p className="text-red-500 mt-4">Invalid username or password</p>
        )}
      </div>
    </div>
  );
}

export default Login;
