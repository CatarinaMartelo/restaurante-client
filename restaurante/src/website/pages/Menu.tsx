import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3001";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItemsByCategory();
  }, [menuItems, currentCategory]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get<MenuItem[]>(`${BASE_URL}/products`);
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const filterItemsByCategory = () => {
    const filtered = menuItems.filter(
      (menuItem) => menuItem.category === currentCategory
    );
    setFilteredItems(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  const categories = ["starters", "meat", "fish", "drinks", "desserts"];

  return (
    <div className="container">
      <div className="category-buttons">
        {categories.map((category) => (
          <button key={category} onClick={() => handleCategoryChange(category)}>
            {category}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((menuItem) => (
            <tr key={menuItem.id}>
              <td>{menuItem.name}</td>
              <td>{menuItem.description}</td>
              <td>{menuItem.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Menu;
