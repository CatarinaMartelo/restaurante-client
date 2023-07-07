import React, { useContext, useEffect, useRef, useState } from "react";
import { Order } from "../../common/models/order";
import { TableData, getTables } from "../../common/services/tables";
import {
  getOrdersByBookingId,
  updateOrderAnulled,
} from "../../common/services/order";
import Navbar from "../components/Navbar";
import {
  InvoiceData,
  addCreditNoteInvoice,
  addInvoice,
  getInvoicesByBookingId,
  updateInvoice,
} from "../../common/services/invoices";
import { AppContext } from "../../common/context/AppContext";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "../../common/services/email";

function WaitersInvoices() {
  const { user } = useContext(AppContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorOrderId, setErrorOrderId] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  const fetchOrdersByBookingId = async () => {
    try {
      const tableId = localStorage.getItem("tableId");
      const bookingId = localStorage.getItem("localStorageBookingId"); // Update the key to "selectedBookingId"

      if (tableId && bookingId) {
        console.log("booking id & table id", bookingId, tableId);

        const fetchedOrders = await getOrdersByBookingId(bookingId);

        console.log("ordersssss", fetchedOrders);

        const totalPrice = fetchedOrders.reduce((total, order) => {
          const orderProductPrices = order.orderProduct.map(
            (orderProduct) => orderProduct.product.price * orderProduct.quantity
          );
          const orderTotal = orderProductPrices.reduce(
            (productTotal, price) => productTotal + price,
            0
          );
          return total + orderTotal;
        }, 0);

        setTotal(totalPrice);

        console.log("order IDs", orderIds);

        // Update state with order IDs
        setOrders(fetchedOrders);

        console.log("orders after setting state", orders);
        console.log("orders length after setting state", orders.length);

        console.log("fetched orders", orders);

        const tableRecords = await getTables();

        console.log("fetched tables", tableRecords);
        console.log("fetched tables length", tableRecords.length);
        setTables(tableRecords);

        localStorage.setItem("fetchedOrders", JSON.stringify(orders));
      } else {
        console.log("Invalid tableId or bookingId");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrdersByBookingId();
    fetchInvoiceByBookingId();
  }, []);

  const createInvoice = async () => {
    try {
      const tableId = localStorage.getItem("tableId");
      const bookingId = localStorage.getItem("localStorageBookingId"); // Update the key to "selectedBookingId"

      if (tableId && bookingId) {
        console.log("invoice details", bookingId, total, orders);

        const response = await addInvoice(bookingId, total, orders);

        console.log("Created invoice:", response);

        localStorage.setItem("createdInvoice", JSON.stringify(response));
        setOrderIds([]);
        fetchInvoiceByBookingId(); // Fetch invoices after creating the new one
      } else {
        console.log("Invalid tableId or bookingId");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const [invoices, setInvoices] = useState<InvoiceData[] | null>(null); // Update initial state to null
  const fetchInvoiceByBookingId = async () => {
    const bookingId = localStorage.getItem("localStorageBookingId");

    if (bookingId) {
      const response = await getInvoicesByBookingId(bookingId);

      console.log("fetched invoice:", response);

      setInvoices(response);
    }
  };

  useEffect(() => {
    console.log("invoices after setting state:", invoices);
  }, [invoices]);

  console.log("Component re-rendered");

  useEffect(() => {
    fetchInvoiceByBookingId();
  }, []);

  console.log("invoices jsx", invoices);
  console.log("invoices.order jsx", invoices);

  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [showModal, setShowModal] = useState(false);

  const updateInvoiceAndPaymentStatus = async () => {
    setShowModal(false);
    try {
      const createdInvoiceString = localStorage.getItem("createdInvoice");
      let createdInvoice;

      if (createdInvoiceString) {
        createdInvoice = JSON.parse(createdInvoiceString);
      } else {
        console.log("No created invoice found");
        return; // Return or perform an appropriate action if necessary
      }

      if (createdInvoice) {
        const newName = name.trim() !== "" ? name : createdInvoice.name;
        const newVatNumber =
          vatNumber.trim() !== "" ? vatNumber : createdInvoice.vatNumber;

        const response = await addInvoice(
          createdInvoice.bookingId,
          createdInvoice.total,
          orders,
          newVatNumber,
          newName,
          "Factura",
          createdInvoice.observations,
          paymentMethod,
          paymentStatus
        );
        console.log("Created invoice:", response);
        // Perform any other necessary actions upon successful update
        fetchInvoiceByBookingId();
      } else {
        console.log("No created invoice found");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/waiters/tables");
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

  const handleCancelOrder = async (orderId: string) => {
    const anulled = true;

    const anulledOrder = await updateOrderAnulled(orderId, anulled);

    console.log(anulledOrder);

    fetchOrdersByBookingId();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent form submission if validation fails

    // Perform your form validation logic here
    if (!paymentMethod || !paymentStatus) {
      // Display error message or perform any other action for invalid form
      return;
    }

    // If form is valid, proceed with form submission or further processing
    updateInvoiceAndPaymentStatus(); // Your function to handle form submission
  };

  const [recipient, setRecipient] = useState("");
  const divRef = useRef<HTMLDivElement | null>(null);

  const handleSendInvoice = () => {
    if (divRef.current) {
      const invoiceContent = divRef.current.innerHTML;
      const recipientEmail = recipient; // Replace with the recipient's email from the frontend

      sendEmail(invoiceContent, recipientEmail);
      setEmailModal(false);
    }
  };

  const [emailModal, setEmailModal] = useState(false);

  const closeModal = () => {
    setEmailModal(false);
    setShowModal(false);
  };

  const handleCancelInvoice = async (invoice: InvoiceData) => {
    try {
      // Cancel the current invoice
      const cancelledInvoice = await updateInvoice(
        invoice.id,
        invoice.name,
        invoice.vatNumber,
        invoice.paymentMethod,
        invoice.paymentStatus,
        true,
        invoice.type,
        invoice.observations,
        invoice.order
      );

      console.log("canceled invoice", cancelledInvoice);

      const creditNoteInvoice = await addCreditNoteInvoice(
        cancelledInvoice.bookingId,
        cancelledInvoice.total,
        cancelledInvoice.order,
        cancelledInvoice.vatNumber,
        cancelledInvoice.name,
        "Nota de Crédito",
        `Referente a FT ${cancelledInvoice.id.split("-").pop()} `
      );

      // Show the modal or perform any other necessary actions
      // You can access the cancelled invoice using 'cancelledInvoice' variable
      // You can access the credit note invoice using 'creditNoteInvoice' variable

      console.log("Cancelled invoice:", cancelledInvoice);
      console.log("Credit note invoice:", creditNoteInvoice);
      fetchInvoiceByBookingId();
      // ... (show modal or perform other actions)
    } catch (error) {
      // Handle error
      console.error("Error:", error);
    }
  };

  console.log("modal", showModal);

  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(
    null
  );
  const [action, setAction] = useState<"print" | "email" | null>(null);

  useEffect(() => {
    if (currentInvoice && action) {
      if (action === "print") {
        handlePrint();
        console.log("Print invoice:", currentInvoice);
      } else if (action === "email") {
        setEmailModal(true);
        console.log("Send by email:", currentInvoice);
      }

      // Reset the action after handling it
      setAction(null);
    }
  }, [currentInvoice, action]);

  const handleEmail = () => {
    setAction("email");
  };

  const handlePrintButton = () => {
    setAction("print");
  };

  interface InvoiceProps {
    invoice: InvoiceData;
    setCurrentInvoice: (invoice: InvoiceData) => void;
  }

  const TalaoDeControloInvoice: React.FC<InvoiceProps> = ({
    invoice,
    setCurrentInvoice,
  }) => {
    // Extract necessary data from the invoice object
    const { id, type, updatedAt, order, total, paymentStatus } = invoice;

    useEffect(() => {
      setCurrentInvoice(invoice);
    }, [invoice, setCurrentInvoice]);

    return (
      <div className="invoice-parent-container">
        {type === "Talão de Controlo" && (
          <div className="invoice-container">
            <div className="invoice-wrapper" ref={invoiceWrapperRef}>
              <div className="invoice-box" key={invoice.id}>
                <div className="restaurant-info">
                  <p>
                    Restaurante <span>Zeferino</span>
                  </p>
                  <p>Rua da Estrada, 0000-000 Lisboa</p>
                  <p>NIF: 555 555 555</p>
                </div>

                <div className="invoice-number-container">
                  <div className="invoice-number">
                    <p className="invoice-number-title">{invoice.type}</p>
                    <p className="invoice-number-number">
                      TC&nbsp;
                      {invoice.id.split("-").pop()}
                    </p>
                  </div>
                  <div className="invoice-emission-details">
                    <div className="invoice-emission">
                      <p className="not-an-invoice">Documento Original</p>
                      <p>{invoice.updatedAt.split("T")[0]}</p>
                      <p>{invoice.updatedAt.split("T")[1].substring(0, 8)}</p>
                    </div>
                    <div className="client-details">
                      <p>Preencha aqui os dados para a factura</p>
                      <p>Nome:</p>
                      <p>NIF:</p>
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
                    {invoice.order && invoice.order.length > 0 ? (
                      invoice.order.map((order) => (
                        <React.Fragment key={order.id}>
                          {order.orderProduct.map((orderProduct) => (
                            <tr key={`${order.id}-${orderProduct.id}`}>
                              <td>{orderProduct.quantity}</td>
                              <td>{orderProduct.product.name}</td>
                              <td>{orderProduct.product.tax}</td>
                              <td>{orderProduct.product.price}€</td>
                              <td>
                                {orderProduct.product.price *
                                  orderProduct.quantity}
                                €
                              </td>
                            </tr>
                          ))}
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
                  <p>{invoice.total}€</p>
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
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const total13 = vat13Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total13;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr>
                      <td>23.00%</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const total23 = vat23Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total23;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr className="iva-total">
                      <td>Total</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13 + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13 + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>{invoice.total}€</td>
                    </tr>
                  </tbody>
                </table>
                <div className="invoice-last-lines">
                  <p>Este documento não serve de fatura</p>

                  <p>
                    Antendido por {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FacturaInvoice: React.FC<InvoiceProps> = ({
    invoice,
    setCurrentInvoice,
  }) => {
    // Extract necessary data from the invoice object
    const { id, type, updatedAt, order, total, paymentStatus } = invoice;

    useEffect(() => {
      setCurrentInvoice(invoice);
      console.log("use effect factura", invoice);
    }, [invoice, setCurrentInvoice]);

    return (
      <div className="invoice-parent-container">
        {type === "Factura" && (
          <div className="invoice-container" ref={divRef}>
            <div className="invoice-wrapper" ref={invoiceWrapperRef}>
              <div className="invoice-box" key={invoice.id}>
                <div className="restaurant-info">
                  <p>
                    Restaurante <span>Zeferino</span>
                  </p>
                  <p>Rua da Estrada, 0000-000 Lisboa</p>
                  <p>NIF: 555 555 555</p>
                </div>

                <div className="invoice-number-container">
                  <div className="invoice-number">
                    <p className="invoice-number-title">{invoice.type}</p>
                    <p className="invoice-number-number">
                      FT&nbsp;
                      {invoice.id.split("-").pop()}
                    </p>
                  </div>
                  <div className="invoice-emission-details">
                    <div className="invoice-emission">
                      <p className="not-an-invoice">Documento Original</p>
                      <p>{invoice.updatedAt.split("T")[0]}</p>
                      <p>{invoice.updatedAt.split("T")[1].substring(0, 8)}</p>
                    </div>

                    <div className="client-details">
                      <p>Dados de cliente:</p>
                      <p>Nome: {invoice.name}</p>
                      <p>NIF: {invoice.vatNumber}</p>
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
                    {invoice.order && invoice.order.length > 0 ? (
                      invoice.order.map((order) => (
                        <React.Fragment key={order.id}>
                          {order.orderProduct.map((orderProduct) => (
                            <tr key={orderProduct.id}>
                              <td>{orderProduct.quantity}</td>
                              <td>{orderProduct.product.name}</td>
                              <td>{orderProduct.product.tax}</td>
                              <td>{orderProduct.product.price}€</td>
                              <td>
                                {orderProduct.product.price *
                                  orderProduct.quantity}
                                €
                              </td>
                            </tr>
                          ))}
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
                  <p>{invoice.total}€</p>
                </div>
                <div className="invoice-payment">
                  <p>{invoice.paymentMethod}</p>
                  <p>{invoice.total}€</p>
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
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const total13 = vat13Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total13;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr>
                      <td>23.00%</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const total23 = vat23Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total23;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr className="iva-total">
                      <td>Total</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13 + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13 + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>

                      <td>{invoice.total}€</td>
                    </tr>
                  </tbody>
                </table>
                <div className="invoice-last-lines">
                  <p>
                    Antendido por {user?.firstName} {user?.lastName}
                  </p>
                  <p>{invoice.observations}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const NotaDeCreditoInvoice: React.FC<InvoiceProps> = ({
    invoice,
    setCurrentInvoice,
  }) => {
    // Extract necessary data from the invoice object
    const { id, type, updatedAt, order, total, paymentStatus } = invoice;

    useEffect(() => {
      setCurrentInvoice(invoice);
      console.log("use effect invoice", invoice);
    }, [invoice, setCurrentInvoice]);

    return (
      <div className="invoice-parent-container">
        {type === "Nota de Crédito" && (
          <div className="invoice-container" ref={divRef}>
            <div className="invoice-wrapper" ref={invoiceWrapperRef}>
              <div className="invoice-box" key={invoice.id}>
                <div className="restaurant-info">
                  <p>
                    Restaurante <span>Zeferino</span>
                  </p>
                  <p>Rua da Estrada, 0000-000 Lisboa</p>
                  <p>NIF: 555 555 555</p>
                </div>

                <div className="invoice-number-container">
                  <div className="invoice-number">
                    <p className="invoice-number-title">{invoice.type}</p>
                    <p className="invoice-number-number">
                      FT&nbsp;
                      {invoice.id.split("-").pop()}
                    </p>
                  </div>
                  <div className="invoice-emission-details">
                    <div className="invoice-emission">
                      <p className="not-an-invoice">Documento Original</p>
                      <p>{invoice.updatedAt.split("T")[0]}</p>
                      <p>{invoice.updatedAt.split("T")[1].substring(0, 8)}</p>
                    </div>
                    <div className="client-details">
                      <p>Dados de cliente:</p>
                      <p>Nome: {invoice.name}</p>
                      <p>NIF: {invoice.vatNumber}</p>
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
                    {invoice.order && invoice.order.length > 0 ? (
                      invoice.order.map((order) => (
                        <React.Fragment key={order.id}>
                          {order.orderProduct.map((orderProduct) => (
                            <tr key={orderProduct.id}>
                              <td>{orderProduct.quantity}</td>
                              <td>{orderProduct.product.name}</td>
                              <td>{orderProduct.product.tax}</td>
                              <td>{orderProduct.product.price}€</td>
                              <td>
                                {orderProduct.product.price *
                                  orderProduct.quantity}
                                €
                              </td>
                            </tr>
                          ))}
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
                  <p>{invoice.total}€</p>
                </div>
                <div className="invoice-payment">
                  <p>{invoice.paymentMethod}</p>
                  <p>{invoice.total}€</p>
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
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const total13 = vat13Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total13;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr>
                      <td>23.00%</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const total23 = vat23Products.reduce(
                                (totalAcc, orderProduct) =>
                                  totalAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity,
                                0
                              );
                              return acc + total23;
                            }, 0)
                          : 0}
                        €
                      </td>
                    </tr>
                    <tr className="iva-total">
                      <td>Total</td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const base13 = vat13Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const base23 = vat23Products.reduce(
                                (baseAcc, orderProduct) =>
                                  baseAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (1 -
                                      parseFloat(orderProduct.product.tax) /
                                        100),
                                0
                              );
                              return acc + base13 + base23;
                            }, 0)
                          : 0}
                        €
                      </td>
                      <td>
                        {invoice.order && invoice.order.length > 0
                          ? invoice.order.reduce((acc, order) => {
                              const vat13Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "13%"
                              );
                              const iva13 = vat13Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              const vat23Products = order.orderProduct.filter(
                                (orderProduct) =>
                                  orderProduct.product.tax === "23%"
                              );
                              const iva23 = vat23Products.reduce(
                                (ivaAcc, orderProduct) =>
                                  ivaAcc +
                                  orderProduct.product.price *
                                    orderProduct.quantity *
                                    (parseFloat(orderProduct.product.tax) /
                                      100),
                                0
                              );
                              return acc + iva13 + iva23;
                            }, 0)
                          : 0}
                        €
                      </td>

                      <td>{invoice.total}€</td>
                    </tr>
                  </tbody>
                </table>
                <div className="invoice-last-lines">
                  <p>{invoice.observations}</p>
                  <p>
                    Antendido por {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [currentIndex, setCurrentIndex] = useState(
    invoices?.length ? invoices.length - 1 : 0
  ); // Start with the latest invoice

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      console.log("Previous index:", prevIndex);
      const newIndex = prevIndex - 1;
      console.log("New index:", newIndex);
      const previousInvoice = invoices && invoices[newIndex];
      console.log("Previous invoice:", previousInvoice);
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      console.log("Previous index:", prevIndex);
      const newIndex = prevIndex + 1;
      console.log("New index:", newIndex);
      const nextInvoice = invoices && invoices[newIndex];
      console.log("Next invoice:", nextInvoice);
      return newIndex;
    });
  };

  const invoice: InvoiceData | null =
    invoices && invoices.length > 0 ? invoices[currentIndex] : null;

  // Render the invoice component based on its type
  let invoiceComponent: JSX.Element | null = null;
  if (invoice && invoice.type === "Talão de Controlo") {
    invoiceComponent = (
      <TalaoDeControloInvoice
        invoice={invoice}
        setCurrentInvoice={setCurrentInvoice}
      />
    );
  } else if (invoice && invoice.type === "Factura") {
    invoiceComponent = (
      <FacturaInvoice invoice={invoice} setCurrentInvoice={setCurrentInvoice} />
    );
  } else if (invoice && invoice.type === "Nota de Crédito") {
    invoiceComponent = (
      <NotaDeCreditoInvoice
        invoice={invoice}
        setCurrentInvoice={setCurrentInvoice}
      />
    );
  }

  const [optionsModal, setOptionsModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      const isInsideOptionsModal = targetElement.closest(
        ".options-modal-content"
      );

      if (!isInsideOptionsModal) {
        setOptionsModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("booking orders", orders);
  return (
    <div className="kitchen-orders-grid-container">
      <div className="kitchen-orders-grid noPrint">
        <Navbar />

        {orders &&
          orders.length > 0 &&
          orders.map((order) => {
            const table = tables.find((table) => table.id === order.tableId);

            return (
              <div
                className={`kitchen-orders-container ${
                  order.anulled ? "anulled" : ""
                } `}
                key={order.id}
              >
                <div className="kitchen-orders-box">
                  <div className="order-content">
                    <h2 className="order-number">
                      Pedido: {order.id.split("-").pop()}
                    </h2>

                    <i
                      className="fa-solid fa-trash"
                      onClick={() => handleCancelOrder(order.id)}
                    ></i>
                    {errorOrderId === order.id && showErrorMessage && (
                      <p className="error-message">{errorMessage}</p>
                    )}
                    <h3 className="order-table-number">Mesa {table?.number}</h3>

                    <div className="order-products-container">
                      {order.orderProduct.length > 0 ? (
                        order.orderProduct.map((orderProduct) => (
                          <div key={orderProduct.id} className="order-product">
                            <p>
                              {orderProduct.product.name}&nbsp;&nbsp;
                              <span className="order-product-quantity">
                                {orderProduct.quantity}
                              </span>
                              &nbsp;&nbsp;
                              {orderProduct.product.price *
                                orderProduct.quantity}
                              €
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
                          (total, item) =>
                            total + item.product.price * item.quantity,
                          0
                        )}
                        €
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {invoices && invoices.length > 0 ? (
        <div key={invoice?.id} className="invoice-parent-container">
          {/* Button to navigate to the previous invoice */}
          <button
            className="previousInvoice"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {/* Button to navigate to the next invoice */}
          <button
            className="nextInvoice"
            onClick={handleNext}
            disabled={currentIndex === invoices.length - 1}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          {invoiceComponent}

          <div className="invoice-buttons noPrint">
            <button
              className="invoice-button"
              onClick={() => setOptionsModal(true)}
            >
              Opções
            </button>
            {optionsModal && (
              <div className="options-modal">
                <div className="options-modal-content">
                  <div className="invoice-buttons-container">
                    <button
                      className="invoice-button"
                      onClick={handlePrintButton}
                    >
                      Imprimir
                    </button>
                    <button
                      className="invoice-button"
                      onClick={handleShowModal}
                    >
                      Emitir factura
                    </button>
                    <button className="invoice-button" onClick={handleEmail}>
                      Enviar por email
                    </button>
                    <button
                      className="invoice-button"
                      onClick={() => invoice && handleCancelInvoice(invoice)}
                    >
                      Nota de Crédito
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button className="invoice-button" onClick={handleGoBack}>
              Voltar
            </button>
          </div>
          {emailModal && (
            <div className="zip-code-modal">
              <div className="zip-code-modal-content">
                <div className="modal-header">
                  <i className="fas fa-times" onClick={closeModal}></i>
                </div>
                <input
                  className="modal-recipient"
                  type="text"
                  placeholder="E-mail"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <button className="invoice-button" onClick={handleSendInvoice}>
                  Enviar
                </button>
              </div>
            </div>
          )}
          {showModal && (
            <div className="invoice-modal">
              <div className="invoice-modal-content">
                <div className="modal-header">
                  <i className="fas fa-times" onClick={closeModal}></i>
                </div>
                <h3>Editar Dados de Factura</h3>
                <form onSubmit={handleFormSubmit}>
                  <input
                    className="modal-name"
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="payment-method-buttons">
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Dinheiro"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                      />
                      <i className="fa-solid fa-sack-dollar"></i>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Multibanco"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                      />
                      <i className="fa-solid fa-credit-card"></i>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Visa"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-brands fa-cc-visa"></i>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Mastercard"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-brands fa-cc-mastercard"></i>{" "}
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="AMEX"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-brands fa-cc-amex"></i>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="MBWay"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-solid fa-mobile-screen-button"></i>{" "}
                    </label>
                  </div>

                  <input
                    className="modal-vat-number"
                    type="text"
                    placeholder="Número de Contribuinte"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />

                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value)}
                    required
                    className="modal-payment-status"
                  >
                    <option value="">Estado de Pagamento</option>
                    <option value="Pago">Pago</option>
                  </select>
                  <button type="submit">Facturar</button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="invoice-buttons-container">
          <p className="total-bill">TOTAL {total}€</p>
          <button className="invoice-button" onClick={createInvoice}>
            Consulta de Conta
          </button>
        </div>
      )}
    </div>
  );
}

export default WaitersInvoices;
