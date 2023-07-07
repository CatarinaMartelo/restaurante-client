import { api } from ".";
import { AuthResponse } from "./menuItems";

export type TableData = {
  id: string;
  number: number;
  timeSlot: string;
  seats: number;
  timeSlotId: string;
};

export async function addTable(data: TableData): Promise<TableData> {
  return api
    .post("/tables", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getTables(): Promise<TableData[]> {
  return api
    .get("/tables")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function deleteTable(tableId: string): Promise<TableData> {
  return api
    .delete(`/tables/${tableId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function getTablesByTimeSlot(
  timeSlot: string
): Promise<TableData[]> {
  return api
    .get(`/tables/time/${timeSlot}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
