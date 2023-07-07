import { useContext, useState, ChangeEvent, FormEvent, useEffect } from "react";
import { AppContext } from "../../common/context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../common/hooks/useApp";
import Navbar from "../components/Navbar";
import { getTimeSlots } from "../../common/services/timeSlots";
import { BookingData, getBookings } from "../../common/services/bookings";
import { getRoleNameThroughId } from "../../common/services/role";
import { getTables } from "../../common/services/tables";
import { TimeSlotData } from "../../common/models/timeSlot";

function WaitersCreateBooking() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    date: "",
    time: "",
    paxNumber: "",
    observations: "",
  });

  const [timeSlotTimes, setTimeSlotTimes] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>();
  const [timeSlotIds, setTimeSlotIds] = useState<string[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<
    string | null
  >(null);
  const [showAvailabilityErrorMessage, setShowAvailabilityErrorMessage] =
    useState(false);

  const { user, dispatch } = useContext(AppContext);

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

  /* -------------------------------------- */

  const fetchTimeSlots = async () => {
    try {
      const fetchedTimeSlots = await getTimeSlots();

      console.log(fetchedTimeSlots);

      if (fetchedTimeSlots) {
        const timeSlotIds = fetchedTimeSlots.map((timeSlot) => timeSlot.id);
        const timeSlotTimes = fetchedTimeSlots.map((timeSlot) => timeSlot.time);
        setTimeSlots(fetchedTimeSlots);
        setTimeSlotIds(timeSlotIds); // Store the time slot IDs in a state variable
        setTimeSlotTimes(timeSlotTimes);
      }

      return fetchedTimeSlots; // Return the fetched time slots
    } catch (error) {
      console.log("Error fetching time slots:", error);
    }
  };

  useEffect(() => {
    fetchTimeSlots(); // Call the function to fetch and set the state
  }, []);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "paxNumber" ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const handleTimeSlotChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setSelectedTimeSlotId(value);

    const selectedTimeSlot = timeSlots?.find(
      (timeSlot) => timeSlot.id === value
    );

    setSelectedTime(selectedTimeSlot?.time || "");

    const totalBookedSeats = calculateTotalBookedSeats(value, selectedDate);

    if (totalBookedSeats === 40) {
      // If all seats are booked, remove the selected time slot from available options
      setTimeSlots(
        (prevTimeSlots) =>
          prevTimeSlots?.filter((timeSlot) => timeSlot.id !== value) ?? []
      );
    }
  };

  const { isBooked, attemptBooking } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    isBooked && navigate("/profile");
  }, [isBooked]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const firstName = target.elements.namedItem(
      "firstName"
    ) as HTMLInputElement;
    const lastName = target.elements.namedItem("lastName") as HTMLInputElement;
    const date = target.elements.namedItem("date") as HTMLInputElement;

    const paxNumber = parseInt(
      (target.elements.namedItem("pax-number") as HTMLInputElement).value,
      10
    );
    const observations = target.elements.namedItem(
      "observations"
    ) as HTMLInputElement;

    const totalBookedSeats = calculateTotalBookedSeats(
      selectedTimeSlotId,
      selectedDate
    );

    const tables = await getTables();
    const timeSlots = await getTimeSlots();

    console.log("fetched tables", tables);
    const timeSlot = timeSlots.find(
      (timeSlot) => timeSlot.id === selectedTimeSlotId
    );

    console.log("time", timeSlot);
    if (timeSlot) {
      const tablesWithMatchingTimeSlot = tables.filter(
        (table) => table.timeSlotId === timeSlot.id
      );

      console.log("tables", tablesWithMatchingTimeSlot);
      const totalSeats = tablesWithMatchingTimeSlot.reduce(
        (totalSeats, table) => totalSeats + table.seats,
        0
      );
      console.log("total seats", totalSeats);

      console.log("total seats", totalSeats);
      const remainingSeats = totalSeats - 2 - totalBookedSeats;

      if (paxNumber > remainingSeats) {
        setShowAvailabilityErrorMessage(true);
        setAvailabilityErrorMessage(
          "Não temos disponibilidade para o horário pretendido"
        );
        setLoading(false);
        return;
      }
    }

    console.log(date.value, paxNumber);
    attemptBooking({
      id: "",
      userId: "",
      firstName: firstName.value,
      lastName: lastName.value,
      date: date.value,
      timeSlotId: selectedTimeSlotId,
      paxNumber: paxNumber,
      observations: observations.value,
      selectedTableId: "",
      table: { id: "", number: 0, timeSlot: "", seats: 2, timeSlotId: "" },
      status: "",
      deleted: false,
    })
      .then(() => {
        navigate("/waiters/tables");
      })
      .catch((e) => {
        setError(true);
        console.log(e);
      })

      .finally(() => setLoading(false));

    console.log("LOGGING:", firstName.value, selectedTimeSlotId);
  }

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  const isMonday = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 1; // Monday has the index 1 (0-based index)
  };

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");

  const [isMondaySelected, setIsMondaySelected] = useState(false);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (isMonday(selectedDate)) {
      setIsMondaySelected(true);
      setErrorMessage("Encerrados");
      setShowErrorMessage(true);
    } else {
      setIsMondaySelected(false);
      setSelectedDate(selectedDate);
    }
  };

  const handleWindowClick = () => {
    setShowErrorMessage(false);
    setShowAvailabilityErrorMessage(false);
  };

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const fetchedBookings = await getBookings(); // Fetch bookings from your API

      console.log(fetchedBookings);

      if (fetchedBookings) {
        setBookings(fetchedBookings); // Update the bookings state variable with the fetched data
      }

      return fetchedBookings; // Return the fetched bookings
    } catch (error) {
      console.log("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchTimeSlots(); // Fetch time slots
    fetchBookings(); // Fetch bookings
  }, []);

  const calculateTotalBookedSeats = (
    timeSlotId: string,
    selectedDate: string
  ) => {
    return bookings.reduce((totalSeats, booking) => {
      if (booking.timeSlotId === timeSlotId && booking.date === selectedDate) {
        return totalSeats + (booking.paxNumber ?? 0);
      }
      return totalSeats;
    }, 0);
  };

  return (
    <div className="waiters-create-booking">
      <Navbar />
      {roleName === "Sala" ? (
        <div className="booking-container">
          <div className="booking-box">
            <div className="booking">
              <h2 className="booking-text">Faça a sua reserva</h2>
            </div>

            <div className="form-container">
              <form className="booking-form" onSubmit={handleSubmit}>
                <div>
                  <div>
                    <div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="off"
                        required
                        className="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Nome"
                      />
                    </div>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="off"
                      required
                      className="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Apelido"
                    />
                  </div>

                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={today}
                    className={isMondaySelected ? "date invalid-date" : "date"}
                  />
                  {showErrorMessage && (
                    <p className="error-message">{errorMessage}</p>
                  )}

                  <select
                    id="time"
                    name="time"
                    value={selectedTimeSlotId}
                    onChange={handleTimeSlotChange}
                    required
                    className="time"
                  >
                    <option value="">Seleccione o horário</option>
                    {timeSlots?.map((timeSlot) => (
                      <option key={timeSlot.id} value={timeSlot.id}>
                        {timeSlot.time}
                      </option>
                    ))}
                  </select>

                  <input
                    id="pax-number"
                    name="pax-number"
                    type="number"
                    required
                    className="pax-number"
                    min="0"
                    placeholder="Número de pessoas"
                  />

                  <input
                    id="observations"
                    name="observations"
                    type="text"
                    className="observations"
                    placeholder="Observações"
                  />
                  <div className="profile-account__actions_bookings">
                    <button type="submit" className="submit-button_bookings">
                      Reservar
                    </button>

                    <Link
                      to="/waiters/tables"
                      className="profile-account__button_bookings"
                    >
                      Voltar
                    </Link>
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}
                {showAvailabilityErrorMessage && (
                  <p className="error-message">{availabilityErrorMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login com a sua conta de Gestão de Sala</p>

          <Link to="/waiters/login" className="login-button" onClick={logOut}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default WaitersCreateBooking;
