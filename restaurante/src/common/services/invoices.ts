import { Order } from "../models/order";
import { TableData } from "./tables";
import { User } from "../models/user";
import { api } from ".";
import { AuthResponse, MenuItem } from "./menuItems";

export type InvoiceData = {
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  id: string;
  type: string;
  observations: string;
  name: string;
  vatNumber: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  order: Order[];
  address: string;
  zipCode: string;
  cancelled: boolean;
};

export async function addInvoice(
  bookingId: string,
  total: number,
  order: Order[],
  vatNumber?: string,
  name?: string,
  type?: string,
  observations?: string,
  paymentMethod?: string,
  paymentStatus?: string
): Promise<InvoiceData> {
  console.log("LOG ORDER SERVICES", order);
  console.log("Received bookingId services:", bookingId);
  console.log("Received total services:", total);
  return api
    .post("/invoices", {
      bookingId,
      total,
      order,
      vatNumber,
      name,
      type,
      observations,
      paymentMethod,
      paymentStatus,
    }) // Send the data object as the request payload
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function addDeliveryInvoice(
  bookingId: null,
  total: number,
  paymentStatus: string,
  order: Order[],
  vatNumber: string,
  userId: string,
  address: string,
  zipCode: string,
  name: string
): Promise<AuthResponse> {
  console.log("LOG ORDER SERVICES", order);
  console.log("Received userId services:", userId);
  console.log("Received total services:", total);
  return api
    .post("/invoices", {
      bookingId,
      total,
      paymentStatus,
      order,
      vatNumber,
      userId,
      address,
      zipCode,
      name,
    }) // Send the data object as the request payload
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getInvoicesByBookingId(
  bookingId: string
): Promise<InvoiceData[]> {
  return api
    .get(`/invoices/booking/${bookingId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getInvoiceByOrderId(
  orderId: string
): Promise<InvoiceData> {
  return api
    .get(`/invoices/order/${orderId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateInvoice(
  id: string,
  name: string,
  vatNumber: string,
  paymentMethod: string,
  paymentStatus: string,
  cancelled: boolean,
  type: string,
  observations: string,
  order: Order[]
): Promise<InvoiceData> {
  try {
    const response = await api.put(`/invoices/${id}`, {
      name,
      vatNumber,
      paymentMethod,
      paymentStatus,
      cancelled,
      type,
      observations,
      order,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function addCreditNoteInvoice(
  bookingId: string,
  total: number,
  order: Order[],
  vatNumber: string,
  name: string,
  type: string,
  observations: string
): Promise<InvoiceData> {
  const response = await addInvoice(
    bookingId,
    total,
    order,
    vatNumber,
    name,
    type,
    observations
  );

  return response;
}
