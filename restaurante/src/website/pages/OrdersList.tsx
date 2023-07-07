import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import { AppContext } from "../../common/context/AppContext";

import { getRoleNameThroughId } from "../../common/services/role";
import { Link } from "react-router-dom";

import { getOrdersByUserId } from "../../common/services/order";
import { Order } from "../../common/models/order";

function OrdersList() {
  const { user, dispatch } = useContext(AppContext);

  const [orders, setOrders] = useState<Order[]>([]);

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

  const fetchOrders = async (userId: string) => {
    try {
      const userOrders = await getOrdersByUserId(userId);

      // Set the filtered bookings in the state
      setOrders(userOrders);

      localStorage.setItem("orders", JSON.stringify(userOrders));
    } catch (error) {
      console.log("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(user.id);
    }
  }, [user?.id]);

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  console.log(orders);

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
    <div className="order-list">
      <Navbar />
      {roleName === "Client" ? (
        <div className="booking-list-container">
          <div className="booking-list-box">
            <div className="bookings-container">
              <h2 className="client-order-list-title">Histórico de Pedidos</h2>
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const parts = order.createdAt.split("T");
                      const date = parts[0];
                      const time = parts[1].split(".")[0];

                      return (
                        <tr key={order.id}>
                          <td>{order.id.split("-").pop()}</td>
                          <td>{date}</td>
                          <td>{time}</td>
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
                      <td colSpan={6}>Não foram encontrados pedidos</td>
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

export default OrdersList;
