import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import {
  MenuItem,
  deleteMenuItem,
  fetchMenuItems,
  getMenuItemsByCategory,
  updateMenuItem,
} from "../../common/services/menuItems";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

function BackofficeMenu() {
  const [selectedCategory, setSelectedCategory] = useState("Entradas");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | undefined>();
  const [description, setDescription] = useState("");
  const [iva, setIva] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const categories = ["Entradas", "Carne", "Peixe", "Bebidas", "Sobremesas"];

  const fetchProducts = async () => {
    try {
      const items = await getMenuItemsByCategory(selectedCategory);
      setMenuItems(items); // Set the fetched items in the state
    } catch (error) {
      console.log("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const isSelected = (category: string) => {
    return selectedCategory === category;
  };

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

  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = modalPosition;
    setModalPosition({ x: x + ui.deltaX, y: y + ui.deltaY });
  };

  const [selectedItemId, setSelectedItemId] = useState("");
  const [error, setError] = useState("");

  const handleShowModal = (itemId: string) => {
    // Update the state to set the itemId for the modal
    setSelectedItemId(itemId);
    setShowModal(true);
  };

  const update = async () => {
    setShowModal(false);
    try {
      const menuItems = await fetchMenuItems();

      const existingItem = menuItems.find((item) => item.id === selectedItemId);

      const updatedItem: Partial<MenuItem> = existingItem
        ? {
            ...existingItem,
            name: name !== "" ? name : existingItem.name,
            price: price !== undefined ? price : existingItem.price,
            description:
              description !== "" ? description : existingItem.description,
            tax: iva !== "" ? iva : existingItem.tax,
          }
        : {};

      const isUpdated =
        name !== "" || price !== undefined || description !== "" || iva !== "";

      if (isUpdated) {
        // Check for duplicate name
        const isDuplicateName = menuItems.some(
          (item) =>
            item.name?.toLowerCase() === updatedItem.name?.toLowerCase() &&
            item.id !== selectedItemId
        );

        if (isDuplicateName) {
          setShowErrorMessage(true);
          setError("Nome duplicado. Escolha um nome diferente");
          return;
        }

        const response = await updateMenuItem(
          selectedItemId,
          updatedItem as MenuItem
        );
        console.log("Updated menuItem:", response);

        fetchProducts();
        // Optionally, update the menuItems state or perform any other necessary actions
      } else {
        console.log("No properties updated.");
      }
    } catch (error) {
      console.error("Error updating menuItem:", error);
    }
  };

  const handleWindowClick = () => {
    setShowErrorMessage(false);
  };

  useEffect(() => {
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    try {
      const deletedBooking = await deleteMenuItem(itemId);
      console.log("deleted booking", deletedBooking);

      // Remove the deleted booking from the bookings array
      const updatedMenuItems = menuItems.filter((item) => item.id !== itemId);

      setMenuItems(updatedMenuItems);
    } catch (error) {
      console.log("Error deleting booking:", error);
    }
  };

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  console.log("items", menuItems);
  /* ---------------------------- */

  return (
    <div>
      <Navbar />
      {roleName === "Admin" ? (
        <div className="container">
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
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>IVA</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length > 0 ? (
                  menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>{item.price}€</td>
                      <td>{item.tax}</td>
                      <td>
                        <button className="tables-actions-buttons">
                          <i
                            className="fa-solid fa-pen-to-square"
                            data-tooltip="Editar"
                            onClick={() => handleShowModal(item.id)}
                          ></i>
                        </button>
                        {showModal && (
                          <div className="invoice-modal">
                            <Draggable
                              handle=".invoice-modal-content"
                              position={modalPosition}
                              onDrag={handleDrag}
                            >
                              <div className="invoice-modal-content">
                                <div className="modal-header">
                                  <i
                                    className="fas fa-times"
                                    onClick={closeModal}
                                  ></i>
                                </div>
                                <h3>Edite o item do menu</h3>
                                <label htmlFor="date" className="modal-label">
                                  Nome
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  className="modal-name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  required
                                />

                                <label
                                  htmlFor="description"
                                  className="modal-label"
                                >
                                  Descrição
                                </label>
                                <input
                                  id="description"
                                  name="description"
                                  type="text"
                                  className="modal-description"
                                  value={description}
                                  onChange={(e) =>
                                    setDescription(e.target.value)
                                  }
                                />
                                <label htmlFor="price" className="modal-label">
                                  Preço
                                </label>
                                <input
                                  id="price"
                                  name="price"
                                  type="text"
                                  required
                                  className="modal-price"
                                  value={price}
                                  onChange={(e) =>
                                    setPrice(Number(e.target.value))
                                  }
                                />
                                <label htmlFor="iva" className="form-label">
                                  IVA
                                </label>
                                <div className="input-container">
                                  <input
                                    id="iva"
                                    name="iva"
                                    type="text"
                                    required
                                    className="iva-input"
                                    value={iva}
                                    onChange={(e) => setIva(e.target.value)}
                                  />
                                </div>
                                <button
                                  className="update-booking-submit"
                                  onClick={update}
                                >
                                  Editar
                                </button>
                              </div>
                            </Draggable>
                          </div>
                        )}
                        <button className="tables-actions-buttons">
                          <i
                            className="fa-solid fa-trash"
                            data-tooltip="Cancelar"
                            onClick={() => handleDeleteItem(item.id)}
                          ></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Não foram encontrados items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {showErrorMessage && <p className="error-message">{error}</p>}
          <div className="buttons-container">
            <Link to="/backoffice/menu/edit" className="menu__button">
              Adicionar item
            </Link>
            <Link to="/backoffice/dashboard" className="menu__button">
              Voltar ao painel
            </Link>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login com a sua conta de Admnistrador</p>

          <Link
            to="/backoffice/login"
            className="login-button"
            onClick={logOut}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default BackofficeMenu;
