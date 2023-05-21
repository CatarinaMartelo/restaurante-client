type Profile = {
  firstName: string;
  lastName?: string;
  birthday?: string;
  vatNumber?: string;
  telephone?: number;
};

export type User = {
  id: string;
  email: string;
  profile: Profile;
  createdAt: string;
  updatedAt: string;
};
