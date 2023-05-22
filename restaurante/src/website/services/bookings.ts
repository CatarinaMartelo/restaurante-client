import { User } from "../models/user";
import { api } from "./";

type AuthResponse = {
  token: string;
};

export type MakeBooking = {
  firstName: string;
  lastName: string;
  date: string;
  paxNumber: number;
};

export async function book(data: MakeBooking): Promise<AuthResponse> {
  return api
    .post("/auth/bookings", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getBookings(): Promise<User> {
  return api
    .get("/auth/bookings")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
