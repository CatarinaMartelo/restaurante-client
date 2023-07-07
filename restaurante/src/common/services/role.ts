import { api } from ".";
import { Role } from "../models/role";

export async function getRoleNameThroughId(roleId: string): Promise<Role> {
  return api
    .get(`/roles/${roleId}`)
    .then(({ data }) => data)
    .catch((error) => {
      throw new Error(error.message);
    });
}
