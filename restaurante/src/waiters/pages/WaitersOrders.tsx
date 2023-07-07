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
import { Link, useLocation } from "react-router-dom";
import {
  addOrderProduct,
  deleteOrderProduct,
} from "../../common/services/order";
import { OrderItem } from "../../common/models/order";
import { addOrder } from "../../common/services/order";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";
import { fetchMenuItems } from "../../common/services/menuItems";

const WaitersOrders = () => {
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
      } catch (error) {
        console.error("Error adding order product:", error);
        // Handle the error appropriately
      }
    }
  };

  const handleRemoveFromOrder = async (item: OrderItem) => {
    setOrderItems((prevItems) =>
      prevItems.filter((prevItem) => prevItem !== item)
    );

    await deleteOrderProduct(item.id);
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

  const createOrder = async () => {
    try {
      const tableId = localStorage.getItem("tableId");
      const bookingId = localStorage.getItem("localStorageBookingId"); // Update the key to "selectedBookingId"

      if (tableId && bookingId) {
        console.log("orderItems:", orderItems);
        console.log("order details", bookingId, tableId, orderItems);

        if (orderItems !== null && orderItems.length > 0) {
          const response = await addOrder(bookingId, tableId, orderItems);

          console.log("Created order:", response);

          localStorage.setItem("createdOrder", JSON.stringify(response));
          setOrderItems([]);
        }
      } else {
        console.log("Invalid tableId or bookingId");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const tableId = localStorage.getItem("tableId");
      const tableRecords = await getTables();
      console.log("records", tableRecords);
      console.log(tableId);
      const filteredTable = tableRecords.find((table) => tableId === table.id);

      setTable(filteredTable);
    } catch (error) {
      // Rest of your code...
      console.log("Error fetching tables:", error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  console.log("orderItems", orderItems);

  return (
    <div className="order-container">
      <Navbar />
      {roleName === "Sala" ? (
        <div className="flex-order">
          <div className="order-menu-container">
            <h2 className="menu-title">Mesa {table?.number}</h2>
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

          <div className="order-request">
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
              <Link to="/waiters/tables" className="menu__button">
                Voltar às mesas
              </Link>
              <button className="menu__button" onClick={createOrder}>
                Enviar pedido
              </button>
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
};

export default WaitersOrders;
