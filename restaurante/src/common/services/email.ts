import axios from "axios";
import { AuthResponse } from "./menuItems";
import { api } from ".";

export async function sendEmail(
  invoiceContent: string,
  recipientEmail: string
): Promise<AuthResponse> {
  return api
    .post("/send-email", { invoiceContent, recipientEmail })
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
