import { User } from "../models/user";
import { api } from "./";

type AuthResponse = {
  token: string;
};

export type BookingData = {
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  paxNumber: number | null;
  observations: string;
};

export async function book(data: BookingData): Promise<AuthResponse> {
  return api
    .post("/bookings", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getBookings(): Promise<User> {
  return api
    .get("/bookings")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
