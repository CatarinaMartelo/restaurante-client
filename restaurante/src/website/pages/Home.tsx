import Navbar from "../components/Navbar";
import "../styles/styles.css";

function Home() {
  return (
    <div>
      <Navbar />
      <div className="hero">
        <h1 className="welcome">Zeferino.</h1>
      </div>
    </div>
  );
}

export default Home;
