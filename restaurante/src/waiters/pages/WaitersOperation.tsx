import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import {
  BookingData,
  deleteBooking,
  getBookingsByDate,
} from "../../common/services/bookings";
import {
  TableData,
  getTables,
  getTablesByTimeSlot,
} from "../../common/services/tables";
import { useApp } from "../../common/hooks/useApp";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { createTimeSlots, getTimeSlots } from "../../common/services/timeSlots";

import { getOrders } from "../../common/services/order";
import { Order } from "../../common/models/order";
import { getUsers } from "../../common/services/auth";
import { User } from "../../common/models/user";
import { TimeSlotData } from "../../common/models/timeSlot";

const WaitersOperation = () => {
  const { attemptAddingTable, updateBookings } = useApp();

  /* ------------- FETCH BOOKINGS --------------- */

  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState<BookingData[]>([]);

  const [tableId, setTableId] = useState("");
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

      return fetchedTimeSlots;
    } catch (error) {
      console.log("Error fetching time slots:", error);
    }
  };

  const fetchBookings = async (date: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const dayBookings = await getBookingsByDate(date, token);
      setBookings(dayBookings);

      const today = new Date().toISOString().split("T")[0];
      setShowModal(date <= today);
    } catch (error) {
      console.log("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchBookings(today);
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    fetchBookings(selectedDate);
  }, [selectedDate]);

  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : bookings;

  /* ------- DRAG AND DROP -------- */

  const draggedBookingRef = useRef<BookingData | null>(null);

  const handleBookingDragStart = (
    event: React.DragEvent<HTMLElement>,
    booking: BookingData
  ) => {
    const currentDate = new Date();
    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Compare the booking date with the current date using bookingId

    if (booking) {
      const bookingDate = new Date(booking.date);
      const bookingDateWithoutTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );

      if (
        bookingDateWithoutTime < currentDateWithoutTime ||
        bookingDateWithoutTime > currentDateWithoutTime
      ) {
        setShowPastBookingErrorMessage(true);
        setPastBookingErrorMessage(
          "Não é possível adicionar uma mesa a esta reserva"
        );
        event.preventDefault();
        return;
      }
    }

    draggedBookingRef.current = booking;
    event.dataTransfer!.setData("text/plain", "");
  };

  const handleBookingDragOverTable = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
  };

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const handleBookingDropOnTable = async (
    event: React.DragEvent<HTMLDivElement>,
    tableId: string
  ) => {
    event.preventDefault();

    if (draggedBookingRef.current) {
      const table = filteredTables.find((table) => table.id === tableId);

      if (table) {
        setSelectedTableId(table.id);

        const updatedBooking = {
          ...draggedBookingRef.current,
          tableId,
          table: {
            id: table.id,
            number: table.number,
            timeSlot: table.timeSlot,
            seats: table.seats,
            timeSlotId: table.timeSlotId,
          },
        };

        const updatedBookings = bookings.map((booking) => {
          if (booking.id === updatedBooking.id) {
            console.log("Updating booking:", booking.id);
            console.log("New tableId:", tableId);
            return updatedBooking;
          }
          return booking;
        });

        console.log("Updated bookings before:", updatedBookings);

        setBookings(updatedBookings);
        setAssignedBookings((prevAssignedBookings) => ({
          ...prevAssignedBookings,
          [tableId]: updatedBooking.id, // Assign the booking ID to the table ID
        }));

        console.log("Updated bookings after:", updatedBookings);

        try {
          await updateBookings(updatedBooking.id, updatedBooking);
          setTableNumber(table.number);
        } catch (error) {
          console.log("Error updating booking:", error);
        }
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
    }, 1000 * 60 * 10);

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

  const updateTableColors = () => {
    const updatedTableColors: Record<string, string> = {};

    bookings.forEach((booking) => {
      const table = filteredTables.find(
        (table) => table && table.id === booking?.table?.id
      );
      if (table && booking?.table?.timeSlot === table.timeSlot) {
        updatedTableColors[table.id] = "#f18787";
      }
    });

    return updatedTableColors;
  };

  const [tableColors, setTableColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const storedTableColors = localStorage.getItem(
      `tableColors_${selectedDate}`
    );
    let initialColors;
    if (storedTableColors) {
      initialColors = JSON.parse(storedTableColors);
    } else {
      initialColors = Object.keys(tableId).reduce(
        (colors, tableId) => ({
          ...colors,
          [tableId]: "#ffffff",
        }),
        {}
      );
      // Replace this with your function to get the default table colors
    }

    const updatedColors = updateTableColors();
    const finalColors = { ...initialColors, ...updatedColors };

    setTableColors(finalColors);
  }, [selectedDate, bookings, filteredTables]);

  /* --------------- ACTIONS MODAL -------------- */

  const [actionModalPosition, setActionModalPosition] = useState({
    top: 0,
    left: 0,
  });
  const tableIconRef = useRef<HTMLDivElement | null>(null);

  const closeActionModal = () => {
    setSelectedTableId(null);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const modalContent = document.querySelector(".action-modal-content");
    if (modalContent && !modalContent.contains(event.target as Node)) {
      setSelectedTableId(null);
    }
    setShowPastBookingErrorMessage(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ----------------- ORDERS MODAL ---------------- */

  const navigate = useNavigate();

  const handleOrderClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tableId: string,
    bookingId: string | null
  ) => {
    event.stopPropagation();
    localStorage.setItem("tableId", tableId);

    if (bookingId !== null) {
      console.log("stored booking id", bookingId);
      localStorage.setItem("localStorageBookingId", bookingId);
    } else {
      // Handle the case when bookingId is null
      console.log("Invalid bookingId");
    }

    navigate(`/waiters/order?tableId=${tableId}`);
  };

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

  const handleInvoiceClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tableId: string,
    bookingId: string | null
  ) => {
    event.stopPropagation();
    localStorage.setItem("tableId", tableId);

    if (bookingId !== null) {
      console.log("stored booking id", bookingId);
      localStorage.setItem("localStorageBookingId", bookingId);
    } else {
      // Handle the case when bookingId is null
      console.log("Invalid bookingId");
    }

    navigate(`/waiters/invoices?tableId=${tableId}`);
  };

  const [time, setTime] = useState("");
  const [paxNumber, setPaxNumber] = useState<number | null>(null);
  const [observations, setObservations] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

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

  const handleShowModal = (bookingId: string) => {
    console.log("booking", bookingId);
    // Update the state to set the itemId for the modal
    setSelectedBookingId(bookingId);

    // Get the current date
    const currentDate = new Date();
    const currentDateWithoutTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    // Compare the booking date with the current date using bookingId
    const booking = bookings.find((booking) => booking.id === bookingId);
    if (booking) {
      const bookingDate = new Date(booking.date);
      const bookingDateWithoutTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate()
      );

      if (bookingDateWithoutTime < currentDateWithoutTime) {
        setShowPastBookingErrorMessage(true);
        setPastBookingErrorMessage("Não é possível editar reservas passadas");
        return;
      }
    }

    setShowBookingModal(true);
  };

  const [showContactsModal, setShowContactsModal] = useState(false);

  const handleShowContactsModal = (bookingId: string) => {
    // Update the state to set the itemId for the modal
    setSelectedBookingId(bookingId);

    setShowContactsModal(true);
  };

  const handleCloseContactsModal = () => {
    // Update the state to set the itemId for the modal
    setSelectedBookingId("");

    setShowContactsModal(false);
  };

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

  const [availabilityErrorMessage, setAvailabilityErrorMessage] = useState<
    string | null
  >(null);
  const [showAvailabilityErrorMessage, setShowAvailabilityErrorMessage] =
    useState(false);

  const update = async () => {
    setShowModal(false);
    try {
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

        const totalBookedSeats = calculateTotalBookedSeats(
          selectedTimeSlotId,
          selectedDate
        );
        const remainingSeats = 40 - totalBookedSeats;

        if (paxNumber) {
          if (paxNumber > remainingSeats) {
            setShowAvailabilityErrorMessage(true);
            setAvailabilityErrorMessage(
              "Não temos disponibilidade para o horário pretendido"
            );

            return;
          }
        }

        console.log(updatedBooking);
        if (selectedBookingId) {
          const response = await updateBookings(
            selectedBookingId,
            updatedBooking
          );
          console.log("Updated booking:", response);

          // Update the bookings array with the updated booking
          bookings[bookingIndex] = updatedBooking;

          fetchBookings(selectedDate);
          setShowBookingModal(false);
        }
      } else {
        console.error("Booking not found");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
  };

  const [bookingModalPosition, setBookingModalPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleModalDrag = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = bookingModalPosition;
    setBookingModalPosition({ x: x + ui.deltaX, y: y + ui.deltaY });
  };

  const [showPastBookingErrorMessage, setShowPastBookingErrorMessage] =
    useState(false);
  const [pastBookingErrorMessage, setPastBookingErrorMessage] = useState("");

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Get the current date
      const currentDate = new Date();
      const currentDateWithoutTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // Compare the booking date with the current date using bookingId
      const booking = bookings.find((booking) => booking.id === bookingId);
      if (booking) {
        const bookingDate = new Date(booking.date);
        const bookingDateWithoutTime = new Date(
          bookingDate.getFullYear(),
          bookingDate.getMonth(),
          bookingDate.getDate()
        );

        if (bookingDateWithoutTime < currentDateWithoutTime) {
          setShowPastBookingErrorMessage(true);
          setPastBookingErrorMessage("Não é possível editar reservas passadas");
          return;
        }
      }
      // Delete the booking
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const newOrdersCountRef = useRef(0);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  async function fetchData() {
    try {
      const ordersWithProducts = await getOrders();
      const hiddenOrderIds = localStorage.getItem("hiddenOrderIds");
      const parsedHiddenOrderIds = hiddenOrderIds
        ? JSON.parse(hiddenOrderIds)
        : [];
      const updatedOrders = ordersWithProducts.map((order) => {
        return {
          ...order,
          hidden: parsedHiddenOrderIds.includes(order.id),
        };
      });
      const visibleOrders = updatedOrders.filter((order) => !order.hidden);
      setOrders(visibleOrders);

      const newOrders = visibleOrders.filter((order) => order.tableId === null);
      const newOrdersCount = newOrders.length;
      if (newOrdersCount > newOrdersCountRef.current) {
        const item = document.getElementById("delivery-icon");
        if (item) {
          setIsNewOrderModalOpen(true);
        }
      }
      newOrdersCountRef.current = newOrdersCount;
      setNewOrdersCount(newOrdersCount);
      console.log("count", newOrdersCount);
      const tableRecords = await getTables();
      setTables(tableRecords);

      // Store the hidden order IDs in local storage
      localStorage.setItem(
        "hiddenOrderIds",
        JSON.stringify(parsedHiddenOrderIds)
      );
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Fetch data every 50 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const closeNewOrderModal = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleDeliveryIcon = () => {
    navigate("/waiters/delivery");
  };

  filteredTables.sort((a, b) => a.number - b.number);

  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const users = await getUsers();
    setUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [selectedTable, setSelectedTable] = useState("");
  const [mainTables, setMainTables] = useState<{ [key: string]: number }>({});
  const [groupedTables, setGroupedTables] = useState<string[]>([]);

  useEffect(() => {
    const storedGroupedTables = localStorage.getItem(
      `groupedTables_${selectedDate}`
    );
    if (storedGroupedTables) {
      setGroupedTables(JSON.parse(storedGroupedTables));
    } else {
      setGroupedTables([]);
    }

    const storedTableColors = localStorage.getItem(
      `tableColors_${selectedDate}`
    );
    let updatedColors;
    if (storedTableColors) {
      updatedColors = JSON.parse(storedTableColors);
    } else {
      updatedColors = { ...tableColors };
    }

    const storedMainTables = localStorage.getItem(`mainTables_${selectedDate}`);
    if (storedMainTables) {
      setMainTables(JSON.parse(storedMainTables));
    }
  }, [selectedDate]);

  const handleGroupClick = (event: React.MouseEvent, tableId: string) => {
    event.stopPropagation();

    const isTableGrouped = groupedTables.includes(tableId);
    let updatedGroupedTables = [...groupedTables];
    let updatedColors = { ...tableColors };

    if (isTableGrouped) {
      // Ungroup the table
      updatedGroupedTables = updatedGroupedTables.filter(
        (groupId) => groupId !== tableId
      );
      // Update the table color to its original color
      updatedColors = {
        ...tableColors,
        [tableId]: "#5c5c5caf",
      };
      // Remove the mainTable value for the ungrouped table
      const { [tableId]: removedTable, ...updatedMainTables } = mainTables;
      setMainTables(updatedMainTables);
    } else {
      // Group the table
      updatedGroupedTables.push(tableId);
      // Update the table color to green
      updatedColors = {
        ...tableColors,
        [tableId]: "#f1878783",
      };
    }
    setIsMainTableModalOpen(false);
    setGroupedTables(updatedGroupedTables);
    setTableColors(updatedColors);
    localStorage.setItem(
      `groupedTables_${selectedDate}`,
      JSON.stringify(updatedGroupedTables)
    );
    localStorage.setItem(
      `tableColors_${selectedDate}`,
      JSON.stringify(updatedColors)
    );

    setSelectedTable("");
  };

  const handleTableClick = (tableId: string) => {
    setSelectedTable(tableId);
  };

  const handleMainTableChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tableId: string
  ) => {
    const updatedMainTables = {
      ...mainTables,
      [tableId]: Number(e.target.value),
    };
    setMainTables(updatedMainTables);
    localStorage.setItem(
      `mainTables_${selectedDate}`,
      JSON.stringify(updatedMainTables)
    );
  };

  const handleClickOutside = (event: MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const isButton = targetElement.tagName === "BUTTON";
    const isInsideTableIconWrapper = targetElement.closest(
      ".table-icon-wrapper"
    );

    if (!isButton && !isInsideTableIconWrapper) {
      setSelectedTable("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isMainTableModalOpen, setIsMainTableModalOpen] = useState(false);

  const [clickedBookings, setClickedBookings] = useState(new Set<string>());

  // Function to handle click for a specific booking
  const handleClick = (bookingId: string) => {
    if (clickedBookings.has(bookingId)) {
      clickedBookings.delete(bookingId);
    } else {
      clickedBookings.add(bookingId);
    }
    setClickedBookings(new Set(clickedBookings));
  };

  return (
    <div>
      <Navbar />
      <div className="tables-container">
        <div className="tables-bookings">
          {" "}
          <div className="input-container">
            <input
              id="date"
              name="date"
              type="date"
              required
              className="date-tables"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <table className="booking-table-tables">
            <thead>
              <tr>
                <th>Id</th>
                <th>Hora</th>
                <th>Nome</th>

                <th>Pax</th>
                <th>Observações</th>
                <th>Mesa</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const isClicked = clickedBookings.has(booking.id);
                  const timeSlot = fetchedTimes?.find(
                    (slot) => slot.id === booking.timeSlotId
                  );
                  const time = timeSlot ? timeSlot.time : "";

                  const bookingUser = users?.find(
                    (user) => user.id === booking.userId
                  );

                  return (
                    <React.Fragment key={booking.id}>
                      <tr key={booking.id}>
                        <td>
                          {" "}
                          <i
                            className="fa-solid fa-circle-info"
                            data-tooltip="Info"
                            onClick={() => handleShowContactsModal(booking.id)}
                          ></i>
                        </td>

                        <td>{time}</td>
                        <td>
                          {booking.firstName} {booking.lastName}
                        </td>
                        <td>{booking.paxNumber}</td>
                        <td>{booking.observations}</td>
                        <td>
                          {booking.table ? booking.table.number : "Sem mesa"}
                        </td>

                        <td>
                          <button className="tables-actions-buttons">
                            <i
                              className="fa-solid fa-pen-to-square"
                              data-tooltip="Editar"
                              onClick={() => handleShowModal(booking.id)}
                            ></i>
                          </button>
                          &nbsp;
                          <button className="tables-actions-buttons">
                            <i
                              className="fa-solid fa-chair"
                              data-tooltip="Mesa"
                              draggable="true"
                              onDragStart={(event) =>
                                handleBookingDragStart(event, booking)
                              }
                            ></i>
                          </button>
                          &nbsp;
                          <button className="tables-actions-buttons">
                            <i
                              className="fa-solid fa-trash"
                              data-tooltip="Cancelar"
                              onClick={() => handleCancelBooking(booking.id)}
                            ></i>
                          </button>
                          &nbsp;
                          <button
                            className={`${
                              isClicked ? "clicked-icon" : "not-clicked-icon"
                            }`}
                            onClick={() => handleClick(booking.id)}
                          >
                            <i className="fa-solid fa-circle-check"></i>
                          </button>
                          {showContactsModal && (
                            /* {bookings?.map((timeSlot) => ())} */
                            <div className="invoice-modal">
                              <Draggable
                                handle=".invoice-modal-content"
                                position={bookingModalPosition}
                                onDrag={handleModalDrag}
                              >
                                <div className="invoice-modal-content">
                                  <div className="modal-header">
                                    <i
                                      className="fas fa-times"
                                      onClick={handleCloseContactsModal}
                                    ></i>
                                  </div>
                                  <h3>Reserva </h3>
                                  <p>
                                    <i className="fa-solid fa-hashtag"></i>
                                    {booking.id.split("-").pop()}
                                  </p>
                                  <h3>Contactos de cliente:</h3>
                                  <p>
                                    <i className="fa-solid fa-user"></i>&nbsp;
                                    {bookingUser?.firstName}&nbsp;
                                    {bookingUser?.lastName}
                                  </p>
                                  <p>
                                    <i className="fa-solid fa-at"></i>&nbsp;
                                    {bookingUser?.email}
                                  </p>
                                  <p>
                                    <i className="fa-solid fa-phone"></i>&nbsp;
                                    {bookingUser?.profile.telephone}
                                  </p>
                                </div>
                              </Draggable>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>Não foram encontradas reservas</td>
                </tr>
              )}
            </tbody>
          </table>
          {showPastBookingErrorMessage && (
            <div className="modal-container">
              <p className="past-booking-error-message">
                {pastBookingErrorMessage}
              </p>
            </div>
          )}
        </div>

        <div className="tables-box">
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
                {filteredTables.map((table) => {
                  // Check if the table has an assigned booking
                  const assignedBookingId = assignedBookings[table.id];
                  const assignedBooking = bookings.find(
                    (booking) => booking.id === assignedBookingId
                  );

                  return (
                    <div
                      className="table-icon-wrapper"
                      key={table.id}
                      onDragOver={handleBookingDragOverTable}
                      onDrop={(event) =>
                        handleBookingDropOnTable(event, table.id)
                      }
                      ref={tableIconRef}
                    >
                      <div
                        key={table.id}
                        className={`table-div ${
                          selectedTable === table.id ? "clicked" : ""
                        }`}
                        style={{
                          backgroundColor: tableColors[table.id] || "#5c5c5caf",
                        }}
                        onClick={() => handleTableClick(table.id)}
                      >
                        {" "}
                        {selectedTable === table.id ? (
                          <div className="horizontal-buttons">
                            {groupedTables.includes(table.id) ? (
                              <div>
                                <button
                                  className="horizontal-button"
                                  onClick={(event) =>
                                    handleGroupClick(event, table.id)
                                  }
                                >
                                  Desagrupar
                                </button>
                                <span className="main-table-info">
                                  Mesa principal <br /> {mainTables[table.id]}
                                </span>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="horizontal-button"
                                  onClick={(event) =>
                                    handleOrderClick(
                                      event,
                                      table.id,
                                      assignedBookings[table.id]
                                    )
                                  }
                                >
                                  Pedido
                                </button>
                                <button
                                  className="horizontal-button"
                                  onClick={(event) =>
                                    handleInvoiceClick(
                                      event,
                                      table.id,
                                      assignedBookings[table.id]
                                    )
                                  }
                                >
                                  Fatura
                                </button>
                                <button
                                  className="horizontal-button"
                                  onClick={() => setIsMainTableModalOpen(true)}
                                >
                                  Agrupar
                                </button>
                              </>
                            )}
                            {isMainTableModalOpen && (
                              <div
                                className="zip-code-modal"
                                ref={tableIconRef}
                              >
                                <div className="zip-code-modal-content">
                                  <p>Mesa principal</p>
                                  <input
                                    type="number"
                                    id="main-table"
                                    name="main-table"
                                    className="main-table"
                                    value={mainTables[table.id] || ""}
                                    onChange={(e) =>
                                      handleMainTableChange(e, table.id)
                                    }
                                    min={1}
                                  />
                                  <button
                                    onClick={(e) =>
                                      handleGroupClick(
                                        e as React.MouseEvent<
                                          Element,
                                          MouseEvent
                                        >,
                                        table.id
                                      )
                                    }
                                  >
                                    Agrupar
                                  </button>
                                  <button
                                    onClick={() =>
                                      setIsMainTableModalOpen(false)
                                    }
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="table-info">
                            <span className="table-number">{table.number}</span>
                            <span className="table-seats">
                              {table.seats} pax{" "}
                            </span>
                          </div>
                        )}
                      </div>
                      {showModal && selectedTableId === table.id && (
                        <div className="action-modal">
                          <div
                            className="action-modal-content"
                            style={{
                              top: actionModalPosition.top,
                              left: actionModalPosition.left,
                              transform: "translate(-50%, -100%)",
                            }}
                          >
                            <button
                              className="action-modal-option"
                              onClick={(event) =>
                                handleOrderClick(
                                  event,
                                  table.id,
                                  assignedBookings[table.id]
                                )
                              }
                            >
                              Pedido
                            </button>

                            <button
                              className="action-modal-option"
                              onClick={(event) =>
                                handleInvoiceClick(
                                  event,
                                  table.id,
                                  assignedBookings[table.id]
                                )
                              }
                            >
                              Factura
                            </button>
                            <button
                              className="action-modal-option"
                              onClick={(event) =>
                                handleGroupClick(event, selectedTableId)
                              }
                            >
                              Agrupar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-tables">Não existem mesas para este horário.</p>
            )}
          </div>
        </div>
        {showBookingModal && (
          <div className="invoice-modal">
            <Draggable
              handle=".invoice-modal-content"
              position={bookingModalPosition}
              onDrag={handleModalDrag}
            >
              <div className="invoice-modal-content">
                <div className="modal-header">
                  <i className="fas fa-times" onClick={closeBookingModal}></i>
                </div>
                <h3>Edite a sua reserva</h3>
                <label htmlFor="date" className="modal-label">
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
                <label htmlFor="time" className="modal-label">
                  Horário
                </label>
                <select
                  name="time"
                  value={selectedTimeSlotId}
                  onChange={handleTimeSlotChange}
                  required
                  className="modal-time"
                >
                  <option value="">Seleccione o horário</option>
                  {timeSlots?.map((timeSlot) => (
                    <option key={timeSlot.id} value={timeSlot.id}>
                      {timeSlot.time}
                    </option>
                  ))}
                </select>
                <label htmlFor="pax-number" className="modal-label">
                  Número de pessoas
                </label>
                <input
                  id="pax-number"
                  name="pax-number"
                  type="number"
                  required
                  className="modal-booking-pax-number"
                  min="0"
                  value={paxNumber !== null ? paxNumber : ""}
                  onChange={(e) => setPaxNumber(Number(e.target.value))}
                  placeholder="Número de pessoas"
                />
                <label htmlFor="observations" className="modal-label">
                  Observações
                </label>
                <input
                  id="observations"
                  name="observations"
                  type="text"
                  className="modal-observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações"
                />

                {showAvailabilityErrorMessage && (
                  <p className="error-message">{availabilityErrorMessage}</p>
                )}
                <button className="update-booking-submit" onClick={update}>
                  Editar
                </button>
              </div>
            </Draggable>
          </div>
        )}
      </div>
      <div className="bookings-tables-footer-actions">
        <i
          className={`fa-solid fa-house ${
            newOrdersCount > 0 ? "green" : ""
          } delivery-big-icon`}
          id="delivery-icon"
          onClick={handleDeliveryIcon}
        >
          {newOrdersCount > 0 && (
            <span className="order-count">{newOrdersCount}</span>
          )}
        </i>
        <div className="buttons-container">
          <Link to="/waiters/dashboard" className="menu__button">
            Voltar ao painel inicial
          </Link>
          <Link to="/waiters/create-booking" className="menu__button">
            Reserva
          </Link>
          <Link to="/waiters/walk-in" className="menu__button">
            Walk-in
          </Link>
        </div>
      </div>
      {isNewOrderModalOpen && (
        <div className="delivery-modal" onClick={closeNewOrderModal}>
          <div className="delivery-modal-content">
            <p>
              Novo pedido para Entrega &nbsp;&nbsp;
              <i className="fa-solid fa-house"></i>
            </p>
          </div>
        </div>
      )}

      {/*  <div className="menu">
        <p>Pedido</p>
        <p>Fatura</p>
      </div> */}
    </div>
  );
};

export default WaitersOperation;
