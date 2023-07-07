import { FormEvent, useContext, useEffect, useState } from "react";
import Loader from "../../common/components/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../common/hooks/useApp";
import Navbar from "../components/Navbar";
import { MenuItem } from "../../common/services/menuItems";
import { api } from "../../common/services";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";

function EditMenu() {
  const { isItemAdded, attemptAddingItem } = useApp();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    isItemAdded && navigate("/backoffice/menu");
  }, [isItemAdded]);

  useEffect(() => {
    fetchMenuItems(); // Fetch menu items
  }, []);

  async function fetchMenuItems(): Promise<void> {
    try {
      const response = await api.get("/products");
      setMenuItems(response.data); // Update the menu items in the state
    } catch (error: any) {
      throw new Error(`Error fetching menu items: ${error.message}`);
    }
  }

  console.log("Selected Category frontend:", selectedCategory);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setLoading(true);

    const target = event.target as HTMLFormElement;
    const name = target.elements.namedItem("name") as HTMLInputElement;
    const price = target.elements.namedItem("price") as HTMLInputElement;
    const iva = target.elements.namedItem("iva") as HTMLInputElement;
    const description = target.elements.namedItem(
      "description"
    ) as HTMLInputElement;

    console.log("price", price);
    const newItem: MenuItem = {
      id: "",
      quantity: 0,
      name: name.value,
      price: Number(price.value),
      description: description.value,
      productCategory: selectedCategory,
      tax: iva.value,
    };

    console.log("LOG NEW ITEM", newItem);
    attemptAddingItem(newItem)
      .then(() => {
        // Fetch the updated menu items
        fetchMenuItems().then(() => {
          navigate("/backoffice/menu");
        });
      })
      .catch((e) => {
        setError(true);
        console.log(e);
      })
      .finally(() => setLoading(false));
    console.log("FIM:", newItem);
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

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  /* ---------------------------- */

  return (
    <div>
      <Navbar />
      {roleName === "Admin" ? (
        <div className="add-item-container">
          <div className="add-item-box">
            <div className="sign-in">
              <h2 className="sign-in-text">Adicione items ao menu</h2>
            </div>

            <div className="form-container">
              <form className="login-form" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="form-label">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="off"
                    required
                    className="name"
                  />
                  <label htmlFor="description" className="form-label">
                    Descrição
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    autoComplete="off"
                    required
                    className="description"
                  />
                  <label htmlFor="price" className="form-label">
                    Preço
                  </label>
                  <div className="input-container">
                    <input
                      id="price"
                      name="price"
                      type="text"
                      required
                      className="price"
                    />
                  </div>
                  <label htmlFor="category" className="form-label">
                    Categoria
                  </label>
                  <div className="input-container">
                    <select
                      id="category"
                      name="category"
                      value={selectedCategory}
                      onChange={(event) =>
                        setSelectedCategory(event.target.value)
                      }
                      required
                      className="category"
                    >
                      <option value="">Seleccione uma categoria</option>
                      <option value="Entradas">Entradas</option>
                      <option value="Carne">Carne</option>
                      <option value="Peixe">Peixe</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Sobremesas">Sobremesas</option>
                    </select>
                  </div>
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
                      placeholder="Adicionar símbolo %"
                    />
                  </div>
                </div>
                <div className="submit-button-box-backoffice">
                  <button type="submit" className="submit-button">
                    Adicionar
                  </button>
                  <Link to="/backoffice/dashboard" className="go-back__button">
                    Voltar ao painel
                  </Link>
                </div>
              </form>
            </div>
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

export default EditMenu;
