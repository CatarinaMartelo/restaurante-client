import { api } from "./";

export type AuthResponse = {
  token: string;
};

export type MenuItem = {
  name: string;
  price: string;
  description: string;
  productCategory: string;
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

export async function fetchMenuItems(): Promise<AuthResponse> {
  return api
    .get("/products")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu: ${error.message}`);
    });
}

export async function getMenuItemsByCategory(
  productCategoryId: string,
  token: string
): Promise<MenuItem[]> {
  console.log("CATEGORY ID:", productCategoryId);

  return api
    .get(`/products/${productCategoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu: ${error.message}`);
    });
}
