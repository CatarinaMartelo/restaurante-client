import { api } from ".";
import { Order, OrderItem } from "../models/order";
import { AuthResponse, MenuItem } from "./menuItems";

export async function addOrder(
  bookingId: string,
  tableId: string,
  data: OrderItem[]
): Promise<AuthResponse> {
  console.log("LOG ORDER SERVICES", data);
  console.log("Received bookingId services:", bookingId);
  console.log("Received tableId services:", tableId);
  return api
    .post("/orders", { bookingId, tableId, orderProduct: data })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function addDeliveryOrder(
  userId: string,
  data: OrderItem[]
): Promise<Order> {
  console.log("LOG ORDER SERVICES", data);
  console.log("Received userId services:", userId);

  return api
    .post("/orders", { userId, orderProduct: data }) // Send the data object as the request payload
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function addOrderProduct(data: OrderItem): Promise<OrderItem> {
  console.log("LOG ORDER SERVICES", data);
  return api
    .post("/order-products", {
      productId: data.product.id,
      observations: data.observations,
      quantity: data.quantity,
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getOrders(): Promise<Order[]> {
  return api
    .get("/orders")
    .then(({ data }) =>
      data.map((order: any) => ({
        id: order.id,
        tableId: order.tableId,
        orderProduct: order.orderProduct,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.userId,
      }))
    )
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getDeliveredOrders(): Promise<Order[]> {
  return api
    .get("/orders/delivered")
    .then(({ data }) =>
      data.map((order: any) => ({
        id: order.id,
        tableId: order.tableId,
        orderProduct: order.orderProduct,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.userId,
      }))
    )
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getOrderProductsForOrder(
  orderId: string
): Promise<Order[]> {
  return api
    .get(`/orders/${orderId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getOrdersByBookingId(
  bookingId: string
): Promise<Order[]> {
  return api
    .get(`/orders/booking/${bookingId}`)
    .then(({ data }) =>
      data.map((order: any) => ({
        id: order.id,
        tableId: order.tableId,
        orderProduct: order.orderProduct,
        status: order.status,
      }))
    )
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return api
    .get(`/orders/user/${userId}`)
    .then(({ data }) =>
      data.map((order: any) => ({
        id: order.id,
        tableId: order.tableId,
        orderProduct: order.orderProduct,
        status: order.status,
        createdAt: order.createdAt,
      }))
    )
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  try {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderDeleted(
  id: string,
  deleted: boolean
): Promise<Order> {
  try {
    const response = await api.put(`/orders/${id}`, { deleted });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderHidden(
  id: string,
  hidden?: boolean,
  delivered?: boolean
): Promise<Order> {
  try {
    const response = await api.put(`/orders/${id}`, { hidden, delivered });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateOrderAnulled(
  id: string,
  anulled: boolean
): Promise<Order> {
  try {
    const response = await api.put(`/orders/${id}`, { anulled });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteOrderProduct(
  orderProductId: string
): Promise<OrderItem> {
  return api
    .delete(`/order-products/${orderProductId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
