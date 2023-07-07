import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Navbar from "../components/Navbar";
import {
  MenuItem,
  getMenuItemsByCategory,
} from "../../common/services/menuItems";

import { TableData, getTables } from "../../common/services/tables";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  addDeliveryOrder,
  addOrderProduct,
  deleteOrderProduct,
} from "../../common/services/order";
import { OrderItem } from "../../common/models/order";
import { addOrder } from "../../common/services/order";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";
import { fetchMenuItems } from "../../common/services/menuItems";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { addDeliveryInvoice } from "../../common/services/invoices";
import { getUsers } from "../../common/services/auth";

const Orders = () => {
  const [selectedCategory, setSelectedCategory] = useState("Entradas");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [table, setTable] = useState<TableData>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<{
    [itemId: string]: number;
  }>({});

  /* ---------- PERMISSÕES -------------- */

  const { user, dispatch } = useContext(AppContext);
  const [roleName, setRoleName] = useState("");

  const roleId = user?.roleId;

  if (roleId) {
    const fetchRoleName = async () => {
      try {
        const role = await getRoleNameThroughId(roleId);
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

  const [initialModal, setInitialModal] = useState(false);

  useEffect(() => {
    setInitialModal(true);
  }, []);

  /* ---------------------------- */

  const categories = ["Entradas", "Carne", "Peixe", "Bebidas", "Sobremesas"];

  const fetchProducts = async () => {
    try {
      const items = await getMenuItemsByCategory(selectedCategory);
      setMenuItems(items); // Set the fetched items in the state
    } catch (error) {
      console.log("Error fetching menu items:", error);
    }
  };

  const handleAddToOrder = async (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    item: MenuItem
  ) => {
    console.log("start");

    const quantity = selectedQuantity[item.id] || 1; // Get the quantity for the selected item

    const observationsElement = event.currentTarget
      .closest("tr")
      ?.querySelector(".observations") as HTMLInputElement;
    const observations = observationsElement?.value || "";

    const products = await fetchMenuItems();

    const filteredProduct = products.find((product) => item.id === product.id);

    console.log(filteredProduct);

    if (filteredProduct) {
      const newOrderProduct: OrderItem = {
        quantity: quantity,
        observations: observations,
        product: {
          id: filteredProduct.id,
          name: filteredProduct.name,
          price: filteredProduct.price,
          tax: filteredProduct.tax,
        },
        id: "",
      };

      console.log("new order item", newOrderProduct);

      try {
        const addedProduct = await addOrderProduct(newOrderProduct);
        console.log("added product:", addedProduct);
        setOrderItems((prevItems) => [...prevItems, addedProduct]);
        console.log("orderItems", orderItems);

        // Perform any other actions after successfully creating the OrderProduct

        const orderItemsString = JSON.stringify([...orderItems, addedProduct]);
        localStorage.setItem("orderItems", orderItemsString);
      } catch (error) {
        console.error("Error adding order product:", error);
        // Handle the error appropriately
      }
    }
  };

  // When the component loads or initializes, retrieve the stored order items from local storage
  useEffect(() => {
    const retrievedOrderItemsString = localStorage.getItem("orderItems");
    if (retrievedOrderItemsString) {
      const retrievedOrderItems = JSON.parse(retrievedOrderItemsString);
      setOrderItems(retrievedOrderItems);
    }
  }, []);

  // When the orderItems state changes, update the local storage
  useEffect(() => {
    const orderItemsString = JSON.stringify(orderItems);
    localStorage.setItem("orderItems", orderItemsString);
  }, [orderItems]);

  const handleRemoveFromOrder = async (item: OrderItem) => {
    setOrderItems((prevItems) =>
      prevItems.filter((prevItem) => prevItem !== item)
    );

    await deleteOrderProduct(item.id);

    console.log("deleted");
  };

  const handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement>,
    item: MenuItem
  ) => {
    const { value } = event.target;
    setSelectedQuantity((prevSelectedQuantity) => ({
      ...prevSelectedQuantity,
      [item.id]: parseInt(value, 10),
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const clearLocalStorageBookingId = () => {
    localStorage.removeItem("localStorageBookingId");
  };

  const [showModal, setShowModal] = useState(false);

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = modalPosition;
    setModalPosition({ x: x + ui.deltaX, y: y + ui.deltaY });
  };

  const createOrder = async () => {
    try {
      const userId = user?.id;

      if (userId) {
        console.log("orderItems:", orderItems);
        console.log("userId", userId);

        if (orderItems !== null && orderItems.length > 0) {
          const response = await addDeliveryOrder(userId, orderItems);

          const orderArray = [response];

          console.log("Created order:", orderArray);

          localStorage.setItem("createdOrder", JSON.stringify(orderArray));
          setOrderItems([]);
          setShowModal(true);

          const totalPrice = response.orderProduct.reduce((acc, orderItem) => {
            const productPrice = orderItem.product.price;
            const productQuantity = orderItem.quantity;
            const productTotalPrice = productPrice * productQuantity;

            return acc + productTotalPrice;
          }, 0);

          console.log("Total Price:", totalPrice);

          const users = await getUsers();
          const currentUser = users.find(
            (fetchedUser) => fetchedUser.profile.id === user.profile.id
          );
          let vatNumber = currentUser?.profile?.vatNumber;

          const address = currentUser?.profile?.address;
          const zipCode = currentUser?.profile?.zipCode;
          const bookingId = null;
          const paymentStatus = "Pago";

          let name = currentUser?.firstName + " " + currentUser?.lastName;

          if (vatNumber === null) {
            name = "Consumidor final";
            vatNumber = "999999990";
          }

          console.log(
            "invoice details",
            userId,
            address,
            zipCode,
            totalPrice,
            orderArray
          );
          if (address && zipCode && vatNumber) {
            const invoice = await addDeliveryInvoice(
              bookingId,
              totalPrice,
              paymentStatus,
              orderArray,
              vatNumber,
              userId,
              address,
              zipCode,
              name
            );

            console.log("Created invoice:", invoice);

            localStorage.setItem("createdInvoice", JSON.stringify(invoice));
            localStorage.removeItem("orderItems");
          }
        }
      } else {
        console.log("Invalid userId");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setInitialModal(false);
  };
  console.log("orderItems", orderItems);

  const navigate = useNavigate();

  const goBack = () => {
    navigate("/home");
  };

  return (
    <div className="client-order-container">
      <Navbar />

      {initialModal && (
        <div className="zip-code-modal">
          <div className="zip-code-modal-content">
            <div className="modal-header">
              <i className="fas fa-times" onClick={closeModal}></i>
            </div>
            <p>
              Certifique-se de que tem a morada e código-postal correctos na sua
              área de cliente.
            </p>
          </div>
        </div>
      )}
      {roleName === "Client" ? (
        <div className="flex-order">
          <div className="client-order-menu-container">
            <h2 className="menu-title">Faça a sua encomenda</h2>
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    backgroundColor:
                      selectedCategory === category ? "#4caf50" : "",
                    color: selectedCategory === category ? "#ffffff" : "",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="scrollable-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>

                    <th>Preço</th>
                    <th>Quantidade</th>
                    <th>Observações</th>
                    <th>Adicionar</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <tr key={item.name}>
                        <td>{item.name}</td>

                        <td>{item.price}€</td>
                        <td>
                          <input
                            id="quantity"
                            name="quanity"
                            type="number"
                            required
                            className="quantity"
                            min={1}
                            value={selectedQuantity[item.id] || 1}
                            onChange={(event) =>
                              handleQuantityChange(event, item)
                            }
                          />
                        </td>
                        <td>
                          <input
                            id="observations"
                            name="observations"
                            type="text"
                            className="observations"
                          />
                        </td>
                        <td>
                          {" "}
                          <i
                            className="fa-solid fa-circle-plus"
                            onClick={(event) => handleAddToOrder(event, item)}
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>Não foram encontrados items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="client-order-request">
            <h2 className="order-request-title">Pedido</h2>
            <div className="scrollable-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Observações</th>
                    <th>Preço</th>
                    <th>Remover</th>
                  </tr>
                </thead>

                <tbody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.observations}</td>
                        <td>{item.product.price * item.quantity}€</td>
                        <td>
                          <i
                            className="fa-solid fa-circle-minus"
                            onClick={() => handleRemoveFromOrder(item)}
                          ></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>Não foram encontrados items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="total-price">
              <span className="total-price-span">TOTAL</span>&nbsp;&nbsp;
              {orderItems.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0
              )}
              €
            </p>
            <div className="order-buttons-container">
              <button className="menu__button" onClick={createOrder}>
                Enviar pedido
              </button>
              <button className="menu__button" onClick={goBack}>
                Voltar
              </button>
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
      {showModal && (
        <div className="invoice-modal">
          <Draggable
            handle=".confirmed-order-modal-content"
            position={modalPosition}
            onDrag={handleDrag}
          >
            <div className="confirmed-order-modal-content">
              <div className="modal-header">
                <i className="fas fa-times" onClick={closeModal}></i>
              </div>
              <h3>
                Encomenda concluída!&nbsp;&nbsp;&nbsp;
                <i className="fa-solid fa-circle-check"></i>
              </h3>
              <p>A encomenda será entregue na morada do seu perfil.</p>
              <p>O pagamento deverá ser efectuado junto do nosso entregador.</p>

              <p>O tempo de entrega estimado são 30 minutos a 1 hora.</p>
            </div>
          </Draggable>
        </div>
      )}
    </div>
  );
};

export default Orders;
