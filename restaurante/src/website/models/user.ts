export type Profile = {
  birthday?: string;
  vatNumber?: string;
  telephone?: number;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  time: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
};
