import { useEffect, useRef, useState } from "react";
import { Order } from "../../common/models/order";
import { TableData, getTables } from "../../common/services/tables";
import {
  getOrders,
  updateOrderDeleted,
  updateOrderHidden,
  updateOrderStatus,
} from "../../common/services/order";
import Navbar from "../components/Navbar";

function KitchenOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorOrderId, setErrorOrderId] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
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

    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Fetch data every 50 seconds

    return () => {
      clearInterval(intervalId); // Clear the interval when the component is unmounted
    };
  }, []);

  function getStatusClass(status: string): string {
    if (status === "Pendente") {
      return "status-pendente";
    } else if (status === "Em preparação") {
      return "status-em-preparacao";
    } else if (status === "Completo") {
      return "status-completo";
    }
    return "";
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      // Update the order status locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    } catch (error) {
      // Handle any errors that occurred during the update
      console.error("Error updating order status:", error);
    }
  }

  function handleTrashClick(
    event: React.MouseEvent,
    orderId: string,
    status: string,
    tableId: string
  ) {
    event.stopPropagation();

    if (status === "Completo" && tableId !== null) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, hidden: true, delivered: true }
            : order
        )
      );

      // Make the PUT request to update the hidden state
      updateOrderHidden(orderId, true, true)
        .then((updatedOrder) => {
          // Handle the successful response
          console.log("Order hidden successfully:", updatedOrder);
        })
        .catch((error) => {
          // Handle any errors that occurred during the update
          console.error("Error updating order hidden state:", error);
        });
    } else if (status === "Completo" && tableId === null) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, hidden: true } : order
        )
      );

      // Make the PUT request to update the hidden state
      updateOrderHidden(orderId, true, false)
        .then((updatedOrder) => {
          // Handle the successful response
          console.log("Order hidden successfully:", updatedOrder);
        })
        .catch((error) => {
          // Handle any errors that occurred during the update
          console.error("Error updating order hidden state:", error);
        });
    } else {
      setErrorOrderId(orderId);
      setErrorMessage(`Erro: Pedido ${status}`);
      setShowErrorMessage(true);
    }
  }

  const handleWindowClick = () => {
    setShowErrorMessage(false);
  };

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  console.log(orders);

  return (
    <div className="kitchen-orders-grid-container">
      <div className="kitchen-orders-grid">
        <Navbar />
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const table = tables.find((table) => table.id === order.tableId);
            console.log("length", order.orderProduct);
            return (
              <div
                className={`kitchen-orders-container ${
                  order.hidden ? "hidden" : ""
                }`}
                key={order.id}
              >
                <div className="kitchen-orders-box">
                  <div className="order-content">
                    <h2 className="order-number">
                      Pedido: {order.id.split("-").pop()}
                    </h2>
                    <h2>Hora: {order.createdAt.split("T")[1].slice(0, 8)}</h2>

                    <i
                      className="fa-solid fa-trash"
                      onClick={(event) =>
                        handleTrashClick(
                          event,
                          order.id,
                          order.status,
                          order.tableId
                        )
                      }
                    ></i>
                    {errorOrderId === order.id && showErrorMessage && (
                      <p className="error-message">{errorMessage}</p>
                    )}
                    {table?.number ? (
                      <h3 className="order-table-number">
                        Mesa {table?.number}
                      </h3>
                    ) : (
                      <h3 className="order-table-number">Entrega</h3>
                    )}
                    <div className="order-products-container">
                      {order.orderProduct.length > 0 ? (
                        order.orderProduct.map((orderProduct) => (
                          <div key={orderProduct.id} className="order-product">
                            <p>
                              {orderProduct.product.name}&nbsp;&nbsp;
                              <span className="order-product-quantity">
                                {orderProduct.quantity}
                              </span>
                            </p>
                            <p className="order-product-observations">
                              {orderProduct.observations}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No order products available for this order.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="status-container">
                  <p className={`status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </p>
                  <button
                    className="preparation-button"
                    onClick={() =>
                      handleStatusUpdate(order.id, "Em preparação")
                    }
                  >
                    Em preparação
                  </button>
                  &nbsp;
                  <button
                    className="complete-button"
                    onClick={() => handleStatusUpdate(order.id, "Completo")}
                  >
                    Completo
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No orders available.</p>
        )}
      </div>
    </div>
  );
}

export default KitchenOrders;
