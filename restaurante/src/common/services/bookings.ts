import { TableData } from "./tables";
import { User } from "../models/user";
import { api } from ".";
import { MenuItem } from "./menuItems";

type AuthResponse = {
  token: string;
};

export type BookingData = {
  selectedTableId: string;
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  date: string;
  timeSlotId: string;
  paxNumber: number | undefined;
  observations: string;
  table: TableData;
  status: string;
  deleted: boolean;
};

export async function book(data: BookingData): Promise<AuthResponse> {
  return api
    .post("/bookings", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateBooking(
  id: string,
  data: BookingData
): Promise<BookingData> {
  try {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getBookingsByUser(
  userId: string,
  token: string
): Promise<BookingData[]> {
  return api
    .get(`/bookings/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getBookingsByDate(
  date: string,
  token: string
): Promise<BookingData[]> {
  console.log("DATE SERVICES:", date);

  return api
    .get(`/bookings/date/${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu SERVICES: ${error.message}`);
    });
}

export async function getBookings(): Promise<BookingData[]> {
  return api
    .get("/bookings")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu SERVICES: ${error.message}`);
    });
}

export async function deleteBooking(id: string): Promise<BookingData> {
  return api
    .delete(`/bookings/${id}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(`Error fetching menu SERVICES: ${error.message}`);
    });
}
