import React, { useContext, useEffect, useRef, useState } from "react";
import { Order } from "../../common/models/order";
import { TableData, getTables } from "../../common/services/tables";
import {
  getOrders,
  updateOrderAnulled,
  updateOrderDeleted,
  updateOrderHidden,
  updateOrderStatus,
} from "../../common/services/order";
import Navbar from "../components/Navbar";
import { getUsers } from "../../common/services/auth";
import { User } from "../../common/models/user";
import {
  InvoiceData,
  addInvoice,
  getInvoiceByOrderId,
} from "../../common/services/invoices";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";
import { Link } from "react-router-dom";

function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorOrderId, setErrorOrderId] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

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

      const newOrders = updatedOrders.filter((order) => order.tableId === null);
      const newOrdersCount = newOrders.length;
      setOrders(newOrders);
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

  function handleOrderDelivered(event: React.MouseEvent, orderId: string) {
    event.stopPropagation();

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

  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const users = await getUsers();
    setUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [noInvoiceError, setNoInvoiceError] = useState(false);

  const handleLocationClick = async (orderId: string) => {
    setSelectedOrderId(orderId);
    console.log("orderId", orderId);

    const invoice = await getInvoiceByOrderId(orderId);

    if (invoice !== null) {
      setShowModal(true);
      setInvoice(invoice);
    } else {
      setNoInvoiceError(true);
    }
  };

  const invoiceWrapperRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = () => {
    if (invoiceWrapperRef.current) {
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join("\n");

      const content = `
      <html>
      <head>
        <style>
          @media print {
            @page {
              size: 400px ${invoiceWrapperRef.current.offsetHeight}px;
              margin: 0; 
            }
          
          }
          ${styles}
        </style>
      </head>
      <body>
        ${invoiceWrapperRef.current.innerHTML}
      </body>
    </html>
      `;

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        const iframeDocument = iframeWindow.document;

        iframeDocument.open();
        iframeDocument.write(content);
        iframeDocument.close();

        iframeWindow.addEventListener("load", () => {
          iframeWindow.print();
          document.body.removeChild(iframe);
        });
      }
    }
  };

  /* ---------- PERMISSÕES -------------- */

  const { user, dispatch } = useContext(AppContext);

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

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  const handleCancelOrder = async (orderId: string) => {
    const anulled = true;

    const anulledOrder = await updateOrderAnulled(orderId, anulled);

    console.log(anulledOrder);

    fetchData();
  };

  console.log("invoiceeee", invoice);
  return (
    <div className="kitchen-orders-grid-container">
      <Navbar />
      {roleName === "Sala" ? (
        <div className="kitchen-orders-grid">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const table = tables.find((table) => table.id === order.tableId);
              const user = users.find((user) => user.id === order.userId);
              console.log("length", order.orderProduct);

              return (
                <div
                  className={`kitchen-orders-container ${
                    order.hidden ? "hidden" : ""
                  }`}
                  key={order.id}
                  onClick={() => console.log("user", order.userId)}
                >
                  <div className="kitchen-orders-box">
                    <div className="order-content">
                      <h2 className="order-number">
                        Pedido: {order.id.split("-").pop()}
                      </h2>
                      <h2>Hora: {order.createdAt.split("T")[1].slice(0, 8)}</h2>
                      <i
                        className="fa-solid fa-receipt"
                        onClick={() => handleLocationClick(order.id)}
                      ></i>

                      {noInvoiceError && (
                        <div
                          className="zip-code-modal"
                          onClick={() => setNoInvoiceError(false)}
                        >
                          <p className="error-message">Sem Factura</p>
                        </div>
                      )}

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
                            <div
                              key={orderProduct.id}
                              className="order-product"
                            >
                              <p>
                                {orderProduct.product.name}&nbsp;&nbsp;
                                <span className="order-product-quantity">
                                  {orderProduct.quantity}
                                </span>
                              </p>
                              <p className="order-product-observations">
                                {orderProduct.observations}
                              </p>
                              <p className="order-product-price">
                                {orderProduct.product.price}€ x{" "}
                                {orderProduct.quantity} ={" "}
                                {orderProduct.product.price *
                                  orderProduct.quantity}
                                €
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
                            (total, item) =>
                              total + item.product.price * item.quantity,
                            0
                          )}
                          €
                        </p>
                      </div>
                    </div>
                  </div>
                  <i
                    className="fa-solid fa-house-circle-check"
                    onClick={(event) => handleOrderDelivered(event, order.id)}
                  ></i>
                  <i
                    className="fa-solid fa-trash delivery-icon"
                    onClick={() => handleCancelOrder(order.id)}
                  ></i>
                  {showModal && (
                    <div className="invoice-modal">
                      <div className="invoice-modal-content delivery-invoice">
                        <i className="fas fa-times" onClick={closeModal}></i>
                        <button
                          className="invoice-button "
                          onClick={handlePrint}
                        >
                          Imprimir
                        </button>

                        <div
                          className="invoice-wrapper"
                          ref={invoiceWrapperRef}
                        >
                          <div className="invoice-box" key={invoice?.id}>
                            <div className="restaurant-info">
                              <p>
                                Restaurante <span>Zeferino</span>
                              </p>
                              <p>Rua da Estrada, 0000-000 Lisboa</p>
                              <p>NIF: 555 555 555</p>
                            </div>

                            <div className="invoice-number-container">
                              <div className="invoice-number">
                                <p className="invoice-number-title">Factura</p>
                                <p className="invoice-number-number">
                                  FT&nbsp;
                                  {invoice?.id.split("-").pop()}
                                </p>
                              </div>
                              <div className="invoice-emission-details">
                                <div className="invoice-emission">
                                  <p className="not-an-invoice">
                                    Documento Original
                                  </p>
                                  <p>{invoice?.updatedAt.split("T")[0]}</p>
                                  <p>
                                    {invoice?.updatedAt
                                      .split("T")[1]
                                      .substring(0, 8)}
                                  </p>
                                </div>
                                <div className="client-details">
                                  <p>Dados de cliente:</p>
                                  <p>Nome: {invoice?.name}</p>
                                  <p>NIF: {invoice?.vatNumber}</p>
                                  <p>Morada: {invoice?.address}</p>
                                  <p>Código-Postal: {invoice?.zipCode}</p>
                                </div>
                              </div>
                            </div>
                            <table className="invoice-table">
                              <thead>
                                <tr className="table-headers">
                                  <th>Qtd</th>
                                  <th>Artigo</th>
                                  <th>Iva</th>
                                  <th>Preço</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoice?.order && invoice.order.length > 0 ? (
                                  invoice.order.map((order) => (
                                    <React.Fragment key={order.id}>
                                      {order.orderProduct.map(
                                        (orderProduct) => (
                                          <tr key={orderProduct.id}>
                                            <td>{orderProduct.quantity}</td>
                                            <td>{orderProduct.product.name}</td>
                                            <td>{/* Add Iva value here */}</td>
                                            <td>
                                              {orderProduct.product.price}€
                                            </td>
                                            <td>
                                              {orderProduct.product.price *
                                                orderProduct.quantity}
                                              €
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </React.Fragment>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4}>No orders found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>

                            <div className="invoice-total">
                              <p>TOTAL</p>
                              <p>{invoice?.total}€</p>
                            </div>
                            <div className="invoice-payment">
                              <p>{invoice?.paymentMethod}</p>
                              <p>{invoice?.total}€</p>
                            </div>
                            <div className="invoice-payment">
                              <p>Troco</p>
                              <p>0.00€</p>
                            </div>
                            <table className="iva-table">
                              <thead>
                                <tr className="table-headers">
                                  <th>%IVA</th>
                                  <th>Base</th>
                                  <th>IVA</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>13.00%</td>
                                  <td>??</td>
                                  <td>??</td>
                                  <td>??</td>
                                </tr>
                                <tr>
                                  <td>23.00%</td>
                                  <td>??</td>
                                  <td>??</td>
                                  <td>??</td>
                                </tr>
                                <tr className="iva-total">
                                  <td>Total</td>
                                  <td>??</td>
                                  <td>??</td>
                                  <td>{invoice?.total}€</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="invoice-last-lines">
                              <p>Encomenda feita em:</p>
                              <p>www.zeferino.pt</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No orders available.</p>
          )}
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

export default DeliveryOrders;
