import "../styles/styles.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/menu">Menu</a>
        </li>
        <li>
          <a href="/bookings">Reservas</a>
        </li>
        <li>
          <a href="/orders">Entregas</a>
        </li>
        <li>
          <a href="/login">Login</a>
        </li>
        <li>
          <a href="/profile">
            <i className="fa-solid fa-user"></i>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
