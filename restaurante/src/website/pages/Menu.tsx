import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

import { getMenuItemsByCategory } from "../../website/services/menuItems";

interface MenuItem {
  productCategory: string;
  name: string;
  description: string;
  price: string;
}

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("Entradas");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const categories = ["Entradas", "Carne", "Peixe", "Bebidas", "Sobremesas"];

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const items = await getMenuItemsByCategory(selectedCategory, token);
      setMenuItems(items); // Set the fetched items in the state
    } catch (error) {
      console.log("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                backgroundColor: selectedCategory === category ? "#4caf50" : "",
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
                <th>Remover Item</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.price}</td>
                    <td>
                      <i className="fa-solid fa-trash-can"></i>
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
        <div className="buttons-container">
          <Link to="/profile" className="menu__button">
            Voltar ao perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Menu;
