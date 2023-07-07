import { Link } from "react-router-dom";

function Start() {
  return (
    <div className="start-container">
      <h1 className="zeferino">Zeferino</h1>
      <div className="website-container">
        <a href="/home" className="home-link">
          <div className="website-box">
            <h2 className="website-title">CLIENTE</h2>
          </div>
        </a>
      </div>
      <div className="backoffice-container">
        <Link to="/backoffice/login" className="home-link">
          <div className="backoffice-box">
            <h2 className="admin-title">ADMIN</h2>
          </div>
        </Link>
      </div>
      <div className="waiters-container">
        <Link to="/waiters/login" className="home-link">
          <div className="waiters-box">
            <h2 className="waiters-title">SALA</h2>
          </div>
        </Link>
      </div>
      <div className="kitchen-container">
        <Link to="/kitchen/login" className="home-link">
          <div className="kitchen-box">
            <h2 className="kitchen-title">COZINHA</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Start;
