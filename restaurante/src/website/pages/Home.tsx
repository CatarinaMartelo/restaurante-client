import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/styles.css";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../common/context/AppContext";

function Home() {
  const { user } = useContext(AppContext);

  useEffect(() => {
    showSlides();
  }, []);

  let slideIndex = 0;

  function showSlides() {
    let i;
    const slides = document
      .getElementsByClassName("slideshow-container")[0]
      .getElementsByTagName("img");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 2000); // Change slide every 3 seconds (adjust as needed)
  }

  const navigate = useNavigate();

  const handleMenuButton = () => {
    navigate("/menu");
  };

  const handleBookButton = () => {
    console.log(user);
    if (user !== undefined) {
      navigate("/bookings");
    }
    setShowModal(true);
    setLoginError("Deverá fazer login para que possa fazer uma reserva");
    setShowLoginError(true);
  };

  const [showModal, setShowModal] = useState(false);
  const [userError, setUserError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [noAddressError, setNoAddressError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginError, setShowLoginError] = useState(false);
  const [showUserError, setShowUserError] = useState(false);
  const [showAddressError, setShowAddressError] = useState(false);
  const [showNoAddressError, setShowNoAddressError] = useState(false);

  const handleOrderButton = () => {
    if (user) {
      if (user.profile && user.profile.zipCode && user.profile.address) {
        const zipCode = user.profile.zipCode;
        const zipCodePrefix = parseInt(zipCode.substring(0, 4));
        if (zipCodePrefix >= 1100 && zipCodePrefix <= 1900) {
          // Valid zip code, redirect to orders page
          navigate("/orders");
        } else {
          // Invalid zip code
          setShowModal(true);
          setShowAddressError(true);
          setAddressError("Não fazemos entregas na sua morada.");
        }
      } else {
        // Zip code not available in user's profile
        setShowModal(true);
        setShowNoAddressError(true);
        setNoAddressError(
          "Deverá adicionar uma morada e código postal ao seu perfil."
        );
      }
    } else {
      // User not available, display login error
      setShowModal(true);
      setShowUserError(true);
      setUserError("Deverá fazer login para que possa fazer uma encomenda.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="hero-container">
      <Navbar />
      <div>
        <section className="hero">
          <h1 className="hero-welcome">Zeferino.</h1>
        </section>
        <section className="slideshow-container">
          <h2>Descubra as nossas novidades!</h2>
          <button onClick={handleMenuButton}>Ementa</button>
          <img src="plate11.png" alt="Image 1" />
          <img src="plate12.png" alt="Image 2" />
          <img src="plate13.webp" alt="Image 3" />
          <img src="plate14.png" alt="Image 4" />
          <img src="plate15.png" alt="Image 5" />
        </section>
        <section className="about-us"></section>
        <section className="delivery">
          <div className="delivery-text">
            <h2>Levamos a nossa comida ao conforto do seu lar.</h2>
            <button onClick={handleOrderButton}>Encomendar</button>
          </div>
          <div className="delivery-img-container">
            <img src="handplate.png" alt="Delivery Image" />
          </div>
        </section>

        <section className="image">
          <h2></h2>
        </section>

        <section className="contacts">
          <div className="contacts-img-container">
            <img src="emptyPlate.png" alt="Empty Plate Image" />
          </div>
          <div className="contacts-text">
            <h2>Esperamos pela sua visita.</h2>
            <button onClick={handleBookButton}>Reservar</button>
            <p>
              <i className="fa-solid fa-location-dot"></i>&nbsp;&nbsp;Rua da
              Estrada, 0000-000 Lisboa
            </p>
            <p>
              <i className="fa-solid fa-phone"></i>&nbsp;&nbsp;210 000 000
            </p>
            <p>
              <i className="fa-solid fa-at"></i>
              &nbsp;&nbsp;zeferino@zeferino.com
            </p>
          </div>
        </section>
      </div>
      {showModal && (
        <div className="zip-code-modal">
          <div className="zip-code-modal-content">
            <div className="modal-header">
              <i className="fas fa-times" onClick={closeModal}></i>
            </div>
            {showAddressError && (
              <p className="error-message">{addressError}</p>
            )}
            {showNoAddressError && (
              <p className="error-message">{noAddressError}</p>
            )}
            {showUserError && <p className="error-message">{userError}</p>}
            {showLoginError && <p className="error-message">{loginError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
