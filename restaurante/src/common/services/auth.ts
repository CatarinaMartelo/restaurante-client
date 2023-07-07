import { Profile } from "../models/user";
import { User } from "../models/user";
import { api } from ".";

type AuthResponse = {
  token: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  roleName?: string;
};

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return api
    .post("/auth/login", { email, password })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return api
    .post("/auth/register", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function profile(): Promise<User> {
  return api
    .get("/auth/profile")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateProfile(
  id: string,
  formData: {
    birthday: string | null;
    vatNumber: string | null;
    telephone: number | null;
  }
): Promise<Profile> {
  try {
    const response = await api.put(`/auth/profile/${id}`, formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function findByEmail(email: string): Promise<User> {
  return api
    .get(`/auth/user/${email}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getUsers(): Promise<User[]> {
  return api
    .get(`/auth/user/`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function deleteUser(id: string): Promise<User[]> {
  return api
    .delete(`/auth/user/${id}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
