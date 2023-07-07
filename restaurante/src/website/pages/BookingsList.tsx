import { ChangeEvent, useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  BookingData,
  deleteBooking,
  getBookingsByDate,
  getBookingsByUser,
  updateBooking,
} from "../../common/services/bookings";
import { AppContext } from "../../common/context/AppContext";
import { getTimeSlots } from "../../common/services/timeSlots";
import { getRoleNameThroughId } from "../../common/services/role";
import { Link } from "react-router-dom";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useApp } from "../../common/hooks/useApp";
import { TimeSlotData } from "../../common/models/timeSlot";

function BookingsList() {
  const { user, dispatch } = useContext(AppContext);
  const { updateBookings } = useApp();
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [message, setMessage] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>();

  /* ---------- PERMISSÕES -------------- */

  const [roleName, setRoleName] = useState("");

  const roleId = user?.roleId;

  if (roleId) {
    const fetchRoleName = async () => {
      try {
        const role = await getRoleNameThroughId(roleId);
        console.log(role);
        setRoleName(role.name);
      } catch (error) {
        console.log("Error fetching role name:", error);
      }
    };

    fetchRoleName();
  }

  /* -------------------------------------------- */

  const fetchTimeSlots = async () => {
    try {
      const fetchedTimeSlots = await getTimeSlots();

      if (fetchedTimeSlots) {
        setTimeSlots(fetchedTimeSlots);
      }

      return fetchedTimeSlots; // Return the fetched time slots
    } catch (error) {
      console.log("Error fetching time slots:", error);
    }
  };

  const fetchBookings = async (userId: string) => {
    try {
      const token = localStorage.getItem("token") || "";

      // Fetch bookings by user
      const userBookings = await getBookingsByUser(userId, token);

      // Set the filtered bookings in the state
      setBookings(userBookings);

      localStorage.setItem("bookings", JSON.stringify(userBookings));
    } catch (error) {
      console.log("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings(user.id);
    }
  }, [user?.id]);

  const today = new Date().toISOString().split("T")[0];
  // Filter past bookings
  const pastBookings = bookings.filter((booking) => booking.date < today);

  // Filter future bookings (including the current day)
  const futureBookings = bookings.filter((booking) => booking.date >= today);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const deletedBooking = await deleteBooking(bookingId);
      console.log("deleted booking", deletedBooking);

      // Remove the deleted booking from the bookings array
      const updatedBookings = bookings.filter(
        (booking) => booking.id !== bookingId
      );

      setBookings(updatedBookings);
    } catch (error) {
      console.log("Error deleting booking:", error);
    }
  };

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [paxNumber, setPaxNumber] = useState<number | undefined>();
  const [observations, setObservations] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleTimeSlotChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setSelectedTimeSlotId(value);

    // Find the corresponding time slot object using the selected time slot ID
    const selectedTimeSlot = timeSlots?.find(
      (timeSlot) => timeSlot.id === value
    );

    // Update the selectedTime state with the selected time slot time
    setSelectedTime(selectedTimeSlot?.time || "");
  };

  const [selectedBookingId, setSelectedBookingId] = useState("");

  const handleShowModal = (bookingId: string) => {
    // Update the state to set the itemId for the modal
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };

  const update = async () => {
    setShowModal(false);
    try {
      if (user) {
        const bookingIndex = bookings.findIndex(
          (booking) => booking.id === selectedBookingId
        );

        if (bookingIndex !== -1) {
          const currentBooking = bookings[bookingIndex];

          const updatedBooking: BookingData = {
            ...currentBooking,
            date: date || currentBooking.date,
            timeSlotId: selectedTimeSlotId || currentBooking.timeSlotId,
            paxNumber: paxNumber || currentBooking.paxNumber,
            observations: observations || currentBooking.observations,
          };

          console.log(updatedBooking);

          const response = await updateBookings(
            selectedBookingId,
            updatedBooking
          );
          console.log("Updated booking:", response);

          // Update the bookings array with the updated booking
          bookings[bookingIndex] = updatedBooking;

          // Perform any other necessary actions upon successful update
          if (user) {
            fetchBookings(user.id);
          }
        } else {
          console.error("Booking not found");
        }
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = modalPosition;
    setModalPosition({ x: x + ui.deltaX, y: y + ui.deltaY });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <div className="booking-list">
      <Navbar />
      {roleName === "Client" ? (
        <div className="booking-list-container">
          <div className="booking-list-box">
            <div className="bookings-container">
              <h2 className="title">Reservas Futuras</h2>
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Nome</th>
                    <th>Apelido</th>
                    <th>Pessoas</th>
                    <th>Observações</th>
                    <th>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {futureBookings.length > 0 ? (
                    futureBookings.map((booking) => {
                      const timeSlot = timeSlots?.find(
                        (slot) => slot.id === booking.timeSlotId
                      );
                      const time = timeSlot ? timeSlot.time : "";

                      return (
                        <tr key={booking.id}>
                          <td>{booking.id.split("-").pop()}</td>
                          <td>{booking.date}</td>
                          <td>{time}</td>
                          <td>{booking.firstName}</td>
                          <td>{booking.lastName}</td>
                          <td>{booking.paxNumber}</td>
                          <td>{booking.observations}</td>
                          <td>
                            <button className="tables-actions-buttons">
                              <i
                                className="fa-solid fa-pen-to-square"
                                data-tooltip="Editar"
                                onClick={() => handleShowModal(booking.id)}
                              ></i>
                            </button>
                            {showModal && (
                              <div className="invoice-modal">
                                <Draggable
                                  handle=".invoice-modal-content"
                                  position={modalPosition}
                                  onDrag={handleDrag}
                                >
                                  <div className="invoice-modal-content">
                                    <div className="modal-header">
                                      <i
                                        className="fas fa-times"
                                        onClick={closeModal}
                                      ></i>
                                    </div>
                                    <h3>Edite a sua reserva</h3>
                                    <label
                                      htmlFor="date"
                                      className="modal-label"
                                    >
                                      Data
                                    </label>
                                    <input
                                      id="date"
                                      type="date"
                                      className="modal-date"
                                      value={date}
                                      onChange={(e) => setDate(e.target.value)}
                                      required
                                    />
                                    <label
                                      htmlFor="time"
                                      className="modal-label"
                                    >
                                      Horário
                                    </label>
                                    <select
                                      name="time"
                                      value={selectedTimeSlotId}
                                      onChange={handleTimeSlotChange}
                                      required
                                      className="modal-time"
                                    >
                                      <option value="">
                                        Seleccione o horário
                                      </option>
                                      {timeSlots?.map((timeSlot) => (
                                        <option
                                          key={timeSlot.id}
                                          value={timeSlot.id}
                                        >
                                          {timeSlot.time}
                                        </option>
                                      ))}
                                    </select>
                                    <label
                                      htmlFor="pax-number"
                                      className="modal-label"
                                    >
                                      Número de pessoas
                                    </label>
                                    <input
                                      id="pax-number"
                                      name="pax-number"
                                      type="number"
                                      required
                                      className="modal-booking-pax-number"
                                      min="0"
                                      value={Number(paxNumber)}
                                      onChange={(e) =>
                                        setPaxNumber(Number(e.target.value))
                                      }
                                    />
                                    <label
                                      htmlFor="observations"
                                      className="modal-label"
                                    >
                                      Observações
                                    </label>
                                    <input
                                      id="observations"
                                      name="observations"
                                      type="text"
                                      className="modal-observations"
                                      value={observations}
                                      onChange={(e) =>
                                        setObservations(e.target.value)
                                      }
                                    />
                                    <button
                                      className="update-booking-submit"
                                      onClick={update}
                                    >
                                      Editar
                                    </button>
                                  </div>
                                </Draggable>
                              </div>
                            )}
                            <button className="tables-actions-buttons">
                              <i
                                className="fa-solid fa-trash"
                                data-tooltip="Cancelar"
                                onClick={() => handleCancelBooking(booking.id)}
                              ></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>Não foram encontradas reservas</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <h2 className="title">Reservas Passadas</h2>
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Nome</th>
                    <th>Apelido</th>
                    <th>Pessoas</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {pastBookings.length > 0 ? (
                    pastBookings.map((booking) => {
                      const timeSlot = timeSlots?.find(
                        (slot) => slot.id === booking.timeSlotId
                      );
                      const time = timeSlot ? timeSlot.time : "";

                      return (
                        <tr key={booking.id}>
                          <td>{booking.id.split("-").pop()}</td>
                          <td>{booking.date}</td>
                          <td>{time}</td>
                          <td>{booking.firstName}</td>
                          <td>{booking.lastName}</td>
                          <td>{booking.paxNumber}</td>
                          <td>{booking.observations}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>Não foram encontradas reservas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login como Cliente para que possa aceder</p>

          <Link to="/login" className="login-button" onClick={logOut}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default BookingsList;
