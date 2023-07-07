import { Role } from "./role";

export type Profile = {
  id: string;
  birthday?: string;
  vatNumber?: string;
  telephone?: number;
  address?: string;
  zipCode?: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  roleName: string | undefined;
  roleId: string;
  role: Role;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
  bookings: Booking[];
};

export type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  paxNumber: number;
  observations: string;
  createdAt: string;
  updatedAt: string;
  tableId: string;
};
