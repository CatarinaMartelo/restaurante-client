import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import Navbar from "../../waiters/components/Navbar";

import { AppContext } from "../../common/context/AppContext";

import { Link } from "react-router-dom";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useApp } from "../../common/hooks/useApp";
import { Order } from "../../common/models/order";

import { getRoleNameThroughId } from "../../common/services/role";
import { getDeliveredOrders } from "../../common/services/order";
import { TimeSlotData } from "../../common/models/timeSlot";

function BackofficeOrdersList() {
  const { user, dispatch } = useContext(AppContext);
  const { updateBookings } = useApp();
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
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

  const fetchOrders = async () => {
    try {
      const deliveredOrders = await getDeliveredOrders();

      // Set the filtered bookings in the state
      setOrders(deliveredOrders);

      localStorage.setItem("orders", JSON.stringify(deliveredOrders));
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  console.log(orders);

  const [openModal, setOpenModal] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      const isInsideOpenModal = targetElement.closest(".modal-content");

      if (!isInsideOpenModal) {
        setSelectedOrder(undefined);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOrders = selectedDate
    ? orders.filter((order) => {
        const parts = order.createdAt.split("T");
        const orderDate = parts[0];
        return orderDate === selectedDate;
      })
    : orders;

  const totalPriceOfTotalPrices = filteredOrders.reduce(
    (sum, order) =>
      sum +
      order.orderProduct.reduce(
        (orderSum, product) =>
          orderSum + product.product.price * product.quantity,
        0
      ),
    0
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );

  const handleOpenModal = (orderId: string) => {
    const order = orders.find((order) => order.id === orderId);
    setSelectedOrder(order);
  };

  function Modal({ order }: { order: Order }) {
    // Use the 'order' prop to render the modal content
    return (
      <div
        className={`user-orders-container ${order.anulled ? "anulled" : ""} `}
        key={order.id}
      >
        <div className="kitchen-orders-box">
          <div className="order-content">
            <h2 className="order-number">
              Pedido: {order.id.split("-").pop()}
            </h2>
            <div className="order-products-container">
              {order.orderProduct.length > 0 ? (
                order.orderProduct.map((orderProduct) => (
                  <div key={orderProduct.id} className="order-product">
                    <p>
                      {orderProduct.product.name}
                      &nbsp;&nbsp;
                      <span className="order-product-quantity">
                        {orderProduct.quantity}
                      </span>
                      &nbsp;&nbsp;
                      {orderProduct.product.price * orderProduct.quantity}€
                    </p>
                    <p className="order-product-observations">
                      {orderProduct.observations}
                    </p>
                  </div>
                ))
              ) : (
                <p>No order products available for this order.</p>
              )}
              <p className="total-price">
                <span className="total-price-span">TOTAL</span>
                &nbsp;&nbsp;
                {order.orderProduct.reduce(
                  (total, item) => total + item.product.price * item.quantity,
                  0
                )}
                €
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-list">
      <Navbar />
      {roleName === "Admin" || roleName === "Sala" ? (
        <div className="booking-list-container">
          <div className="booking-list-box">
            <div className="bookings-container">
              <h2 className="orders-list-title">Relatório de Faturação</h2>
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
              <div className="daily-earnings-container">
                <span className="daily-earnings-title">
                  TOTAL DIÁRIO DE FACTURAÇÃO
                </span>
                <span className="daily-earnings-value">
                  {totalPriceOfTotalPrices}€
                </span>
              </div>
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Preço Total</th>
                    <th>Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const parts = order.createdAt.split("T");
                      const date = parts[0];
                      const time = parts[1].split(".")[0];

                      const totalPrice = order.orderProduct.reduce(
                        (sum, product) =>
                          sum + product.product.price * product.quantity,
                        0
                      );

                      return (
                        <tr key={order.id}>
                          <td>{order.id.split("-").pop()}</td>
                          <td>{date}</td>
                          <td>{time}</td>
                          <td>{totalPrice}€</td>
                          <td>
                            <i
                              className="fa-solid fa-utensils"
                              onClick={() => handleOpenModal(order.id)}
                            ></i>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5}>Não foram encontrados pedidos</td>
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
          <p>Deverá fazer login com a sua conta de Administrador</p>

          <Link to="/login" className="login-button" onClick={logOut}>
            Login
          </Link>
        </div>
      )}
      {selectedOrder && (
        <div className="modal-container">
          <div className="modal-content">
            <div className="user-orders-container">
              {/* Pass the selectedOrder as a prop to the modal component */}
              <Modal order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackofficeOrdersList;
