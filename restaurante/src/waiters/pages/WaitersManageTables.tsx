import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { BookingData } from "../../common/services/bookings";
import {
  TableData,
  deleteTable,
  getTablesByTimeSlot,
} from "../../common/services/tables";
import { useApp } from "../../common/hooks/useApp";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { createTimeSlots, getTimeSlots } from "../../common/services/timeSlots";

import { getUsers } from "../../common/services/auth";
import { User } from "../../common/models/user";
import { TimeSlotData } from "../../common/models/timeSlot";

const WaitersManageTables = () => {
  const { getTableRecords, attemptAddingTable, updateBookings } = useApp();

  /* ------------- FETCH BOOKINGS --------------- */

  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [tableNumber, setTableNumber] = useState<number>(0);
  const [fetchedTimes, setFetchedTimes] = useState<TimeSlotData[]>([]);

  const [selectedTimeSlotModal, setSelectedTimeSlotModal] =
    useState<TimeSlotData>({
      id: "",
      time: "",
    });
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("");

  const fetchTimeSlots = async () => {
    try {
      const fetchedTimeSlots = await getTimeSlots();

      if (fetchedTimeSlots) {
        setFetchedTimes(fetchedTimeSlots);
      }

      return fetchedTimeSlots; // Return the fetched time slots
    } catch (error) {
      console.log("Error fetching time slots:", error);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);

    fetchTimeSlots();
  }, []);

  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : bookings;

  /* --------------- CREATE TABLE ---------- */

  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */

  const handleTimeSlotSelection = async (
    event: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    selectedTimeSlot: TimeSlotData
  ) => {
    event.preventDefault();

    const fetchedTimeSlots = await getTimeSlots();
    setFetchedTimes(fetchedTimeSlots);
    const existingTimeSlot = fetchedTimeSlots.find(
      (slot) => slot.time === selectedTimeSlot.time
    );

    try {
      if (existingTimeSlot) {
        setSelectedTimeSlotModal(existingTimeSlot);
        setSelectedTimeSlotId(existingTimeSlot.id);
        console.log(
          "selected time slot",
          selectedTimeSlot,
          "id",
          existingTimeSlot.id
        );
      } else {
        const newSlotTime = await createTimeSlots(selectedTimeSlot);
        console.log("Time slot created:", newSlotTime);

        setSelectedTimeSlotId(newSlotTime.id);

        setTimeSlots((prevTimeSlots) =>
          prevTimeSlots.map((slot) =>
            slot.time === selectedTimeSlot.time ? newSlotTime : slot
          )
        );

        setSelectedTime(selectedTimeSlot.time);
        console.log("selected time", newSlotTime.time, "id", newSlotTime.id);
      }
    } catch (error) {
      console.log("Error creating table:", error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const number = target.elements.namedItem(
      "table-number"
    ) as HTMLInputElement;
    const seats = target.elements.namedItem("table-seats") as HTMLInputElement;

    const newTable: TableData = {
      id: "",
      number: Number(number.value),
      timeSlot: selectedTimeSlotModal.time,
      seats: Number(seats.value),
      timeSlotId: "",
    };

    if (Number(number.value) && selectedTimeSlotModal.time !== null) {
      try {
        console.log("LOG NEW TABLE BEFORE", newTable);
        await attemptAddingTable(newTable);
        console.log("LOG NEW TABLE AFTER", newTable);
        await fetchTables(selectedTimeSlotModal); // Fetch updated tables after creating a new one
      } catch (error) {
        console.log("Error creating table:", error);
      }
    }
  };

  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */
  /* ----------------------- */
  /* ------------------------ */

  /* --------- MODAL ---------- */

  // State for modal open/close
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [selectedInput, setSelectedInput] = useState("");
  const [tableSeats, setTableSeats] = useState(2);

  const fillInput = (number: number) => {
    if (selectedInput === "table-number") {
      if (number === -1) {
        setTableNumber((prevTableNumber) => {
          const numberString = prevTableNumber.toString();
          const updatedNumberString = numberString.slice(0, -1);
          return Number(updatedNumberString);
        });
      } else {
        setTableNumber((prevTableNumber) => prevTableNumber * 10 + number);
      }
    } else if (selectedInput === "table-seats") {
      if (number === -1) {
        setTableSeats((prevTableSeats) => {
          const numberString = prevTableSeats.toString();
          const updatedNumberString = numberString.slice(0, -1);
          return Number(updatedNumberString);
        });
      } else {
        setTableSeats((prevTableSeats) => prevTableSeats * 10 + number);
      }
    }
  };

  /* --------- TIME SLOTS --------- */

  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([
    { id: "", time: "12:00" },
    { id: "", time: "13:30" },
    { id: "", time: "15:00" },
    { id: "", time: "19:00" },
    { id: "", time: "20:30" },
    { id: "", time: "22:00" },
  ]);

  const [selectedTime, setSelectedTime] = useState<string>(""); // Add a default value

  const fillSlotTimeInput = (slotTime: string) => {
    setSelectedTime(slotTime);
  };

  const [filteredTables, setFilteredTables] = useState<TableData[]>([]);
  const [date, setDate] = useState("");

  /* --------- FETCH TABLES -------- */

  const fetchTables = async (slotTime: { time: string }) => {
    try {
      console.log("slotTime:", slotTime);
      const tableRecords = await getTablesByTimeSlot(slotTime.time);
      console.log("records", tableRecords);
      setFilteredTables(tableRecords);
    } catch (error) {
      console.log("Error fetching tables:", error);
    }
  };

  // Update the corresponding state variable based on the time slot

  const timeSlotsInterval = [
    { time: "12:00", label: "12h00 - 13h30" },
    { time: "13:30", label: "13h30 - 15h00" },
    { time: "15:00", label: "15h00 - 16h30" },
    { time: "19:00", label: "19h00 - 20h30" },
    { time: "20:30", label: "20h30 - 22h00" },
    { time: "22:00", label: "22h00 - 23h30" },
  ];

  const getCurrentSlotIndex = () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    const timeSlots = timeSlotsInterval.map((slot) => slot.time);

    if (currentHour >= 17 && currentHour < 20) {
      return 3; // 19:00 slot
    } else if (currentHour === 20 && currentMinutes >= 30) {
      return 4; // 20:30 slot
    } else if ((currentHour >= 22 && currentHour <= 23) || currentHour < 5) {
      return 5; // 22:00 slot
    } else if (currentHour >= 5 && currentHour < 13 && currentMinutes < 30) {
      return 0; // 12:00 slot
    } else if (currentHour === 13 && currentMinutes >= 30) {
      return 1; // 13:30 slot
    } else if (currentHour === 15 && currentMinutes < 30) {
      return 2; // 15:00 slot
    }

    // Default: Fall back to the previous logic
    for (let i = 0; i < timeSlots.length; i++) {
      const slotTime = timeSlots[i].split(":");
      const slotHour = parseInt(slotTime[0]);
      const slotMinutes = parseInt(slotTime[1]);

      if (
        (currentHour < slotHour ||
          (currentHour === slotHour && currentMinutes < slotMinutes)) &&
        i > 0
      ) {
        return i - 1;
      }
    }

    return timeSlots.length - 1;
  };

  const [currentSlotIndex, setCurrentSlotIndex] = useState(
    getCurrentSlotIndex()
  );

  const goToNextSlot = () => {
    setCurrentSlotIndex((prevIndex) =>
      prevIndex === timeSlotsInterval.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousSlot = () => {
    setCurrentSlotIndex((prevIndex) =>
      prevIndex === 0 ? timeSlotsInterval.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(goToNextSlot, 1000 * 60 * 10); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentSlot = timeSlotsInterval[currentSlotIndex];

  useEffect(() => {
    if (timeSlotsInterval.length > 0) {
      fetchTables(timeSlotsInterval[currentSlotIndex]); // Fetch tables for the current time slot
    }
  }, [currentSlotIndex]);

  useEffect(() => {
    console.log("handle selection", selectedTimeSlotModal);
  }, [selectedTimeSlotModal]);

  const fetchTimeSlotsModal = async () => {
    try {
      // Fetch the available time slots
      const fetchedTimeSlots = await getTimeSlots();

      if (fetchedTimeSlots) {
        setTimeSlots(fetchedTimeSlots);
      }
      return fetchedTimeSlots; // Return the fetched time slots
    } catch (error) {
      console.log("Error fetching time slots:", error);
    }
  };

  useEffect(() => {
    fetchTimeSlotsModal(); // Call the function to fetch and set the state
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlotIndex(getCurrentSlotIndex());
    }, 1000 * 60 * 10); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    // Fetch tables for the initial time slot
    fetchTables(timeSlots[currentSlotIndex]);
  }, []);

  /* ----------- MODAL ------------ */

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = modalPosition;
    setModalPosition({ x: x + ui.deltaX, y: y + ui.deltaY });
  };

  /* --------------- ACTIONS MODAL -------------- */

  const [actionModalPosition, setActionModalPosition] = useState({
    top: 0,
    left: 0,
  });
  const tableIconRef = useRef<HTMLDivElement | null>(null);

  const handleTableIconClick = (
    event: React.MouseEvent<HTMLElement>,
    tableId: string
  ) => {
    console.log("tableId", tableId);

    const tableIcon = event.currentTarget;
    const rect = tableIcon.getBoundingClientRect();
    const { top, left, width, height } = rect;
    const modalTop = top + window.scrollY;
    const modalLeft = left + window.scrollX + width / 2;
    setActionModalPosition({ top: modalTop, left: modalLeft });
  };

  /* ----------------- ORDERS MODAL ---------------- */

  const navigate = useNavigate();

  const retrieveAssignedBookings = (): { [tableId: string]: string } => {
    const storedAssignedBookings = localStorage.getItem("assignedBookings");
    return storedAssignedBookings ? JSON.parse(storedAssignedBookings) : {};
  };

  const [assignedBookings, setAssignedBookings] = useState<{
    [tableId: string]: string;
  }>(retrieveAssignedBookings);

  useEffect(() => {
    localStorage.setItem("assignedBookings", JSON.stringify(assignedBookings));
  }, [assignedBookings]);

  const [showModal, setShowModal] = useState(true);

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

  const handleDeleteTable = async (tableId: string) => {
    try {
      const deletedTable = await deleteTable(tableId);
      console.log("deleted booking", deletedTable);

      // Remove the deleted booking from the bookings array
      const updatedTables = filteredTables.filter(
        (table) => table.id !== tableId
      );

      setFilteredTables(updatedTables);
    } catch (error) {
      console.log("Error deleting booking:", error);
    }
  };

  const [tables, setTables] = useState<TableData[]>([]);

  filteredTables.sort((a, b) => a.number - b.number);

  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const users = await getUsers();
    setUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  console.log("timeSlots", timeSlots);

  return (
    <div>
      <Navbar />
      <div className="tables-container">
        <div className="tables-box">
          <div className="add-tables-container">
            <p className="add-tables-title" onClick={openModal}>
              Criar mesas&nbsp;&nbsp;{" "}
              <i className="fa-regular fa-square-plus"></i>
            </p>
          </div>
          <div className="time-slot-container">
            <i
              className="fa-solid fa-arrow-left"
              onClick={goToPreviousSlot}
            ></i>
            <h3 className="time-slot-title">{currentSlot.label}</h3>
            <i className="fa-solid fa-arrow-right" onClick={goToNextSlot}></i>
          </div>
          <div className="tables-icons">
            {filteredTables.length > 0 ? (
              <div className="tables-grid">
                {filteredTables.map((table) => (
                  <div className="table-icon-wrapper" key={table.id}>
                    <div
                      className="table-div"
                      style={{
                        backgroundColor: "#5c5c5caf",
                      }}
                      ref={tableIconRef}
                      onClick={(event) => handleTableIconClick(event, table.id)}
                    >
                      <div className="table-info">
                        <span className="table-number">{table.number}</span>
                        <span className="table-seats">{table.seats} pax </span>
                        <button className="tables-actions-buttons">
                          <i
                            className="fa-solid fa-trash"
                            data-tooltip="Cancelar"
                            onClick={() => handleDeleteTable(table.id)}
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-tables">Não existem mesas para este horário.</p>
            )}
          </div>
          <div className="buttons-container">
            <Link to="/waiters/dashboard" className="menu__button">
              Voltar ao painel inicial
            </Link>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <Draggable
              handle=".modal"
              position={modalPosition}
              onDrag={handleDrag}
            >
              <div className="modal">
                <div className="modal-header">
                  <i className="fas fa-times" onClick={closeModal}></i>
                </div>
                <div className="modal-content">
                  <form onSubmit={handleSubmit}>
                    <label htmlFor="time-slot" className="time-slot-label">
                      Hora
                    </label>
                    <div className="time-slot-buttons">
                      {timeSlots.map((slot) => (
                        <p
                          key={slot.time}
                          className={`time-slot-button ${
                            selectedTimeSlotModal.time === slot.time
                              ? "selected"
                              : ""
                          }`}
                          onClick={(event) =>
                            handleTimeSlotSelection(event, slot)
                          }
                        >
                          {slot.time}
                        </p>
                      ))}
                    </div>

                    <label
                      htmlFor="table-number"
                      className="table-number-label"
                    >
                      Número de mesa
                    </label>
                    <input
                      type="number"
                      id="table-number"
                      name="table-number"
                      className="add-tables"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(Number(e.target.value));
                      }}
                      min={1}
                    />
                    <label htmlFor="table-seats" className="table-seats-label">
                      Número de lugares
                    </label>
                    <input
                      type="number"
                      id="table-seats"
                      name="table-seats"
                      className="table-seats-input"
                      value={tableSeats}
                      onChange={(e) => {
                        setTableSeats(Number(e.target.value));
                      }}
                      min={1}
                      max={6}
                    />

                    <button type="submit" className="submit-table">
                      Criar
                    </button>
                  </form>
                </div>
              </div>
            </Draggable>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitersManageTables;
