import { OrderItem } from "../models/order";
import { api } from ".";

export type AuthResponse = {
  token: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  productCategory: string;
  quantity: number;
  tax: string;
};

export type Category = {
  name: string;
};

export async function addItem(data: MenuItem): Promise<AuthResponse> {
  console.log("OUTRO LOG", data);
  return api
    .post("/products", data) // Send the data object as the request payload
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateMenuItem(
  id: string,
  data: MenuItem
): Promise<MenuItem> {
  try {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  return api
    .get("/products")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu: ${error.message}`);
    });
}

export async function getMenuItemsByCategory(
  productCategoryId: string
): Promise<MenuItem[]> {
  console.log("CATEGORY ID:", productCategoryId);

  return api
    .get(`/products/${productCategoryId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu: ${error.message}`);
    });
}

export async function getProductById(
  id: string,
  token: string
): Promise<MenuItem> {
  console.log("ID:", id);

  return api
    .get(`/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu: ${error.message}`);
    });
}

export async function deleteMenuItem(id: string): Promise<MenuItem> {
  return api
    .delete(`/products/${id}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error deleting item SERVICES: ${error.message}`);
    });
}
