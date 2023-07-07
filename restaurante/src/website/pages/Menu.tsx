import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";

import { getMenuItemsByCategory } from "../../common/services/menuItems";
import { getRoleNameThroughId } from "../../common/services/role";
import { AppContext } from "../../common/context/AppContext";

interface MenuItem {
  productCategory: string;
  name: string;
  description: string;
  price: number;
}

function Menu() {
  const { user } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState("Entradas");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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

  return (
    <div className="client-menu-container">
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
              </tr>
            </thead>
            <tbody>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.price}€</td>
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
          <Link to="/home" className="menu__button">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Menu;
