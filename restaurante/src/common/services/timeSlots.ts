import { api } from ".";
import { TimeSlotData } from "../models/timeSlot";

export async function getTimeSlots(): Promise<TimeSlotData[]> {
  return api
    .get("/time-slots")
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

export async function createTimeSlots(
  data: TimeSlotData
): Promise<TimeSlotData> {
  return api
    .post("/time-slots", data)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
