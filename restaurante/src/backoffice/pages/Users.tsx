import { useContext, useEffect, useState } from "react";
import { deleteUser, getUsers } from "../../common/services/auth";
import Navbar from "../components/Navbar";
import { User } from "../../common/models/user";
import { AppContext } from "../../common/context/AppContext";
import { getRoleNameThroughId } from "../../common/services/role";
import { Link } from "react-router-dom";

function Users() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const users = await getUsers();

      const fetchRoleName = async (roleId: string) => {
        try {
          const role = await getRoleNameThroughId(roleId);
          return role.name;
        } catch (error) {
          console.log("Error fetching role name:", error);
          return undefined;
        }
      };

      const filteredUsers = await Promise.all(
        users.map(async (user) => {
          const roleName = await fetchRoleName(user.roleId);
          return { ...user, roleName };
        })
      ).then((usersWithRoleNames) =>
        usersWithRoleNames.filter(
          (user) => user.roleName === "Cozinha" || user.roleName === "Sala"
        )
      );

      console.log("Filtered users:", filteredUsers);

      setUsers(filteredUsers);
      // Optionally, update state or perform any other necessary actions with the filtered users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const deletedBooking = await deleteUser(userId);
      console.log("deleted booking", deletedBooking);

      // Remove the deleted booking from the bookings array
      const updatedUsers = users.filter((user) => user.id !== userId);

      setUsers(updatedUsers);
    } catch (error) {
      console.log("Error deleting booking:", error);
    }
  };

  const { user, dispatch } = useContext(AppContext);
  const [roleName, setRoleName] = useState("");

  const roleId = user?.roleId;

  if (roleId) {
    const fetchRoleName = async () => {
      try {
        const role = await getRoleNameThroughId(roleId);
        setRoleName(role.name);
      } catch (error) {
        console.log("Error fetching role name:", error);
      }
    };

    fetchRoleName();
  }

  const logOut = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <div className="users-container">
      <Navbar />
      {roleName === "Admin" ? (
        <div className="users-table-container">
          <h2>Gerir colaboradores</h2>
          <table className="users-table">
            <thead className="users-table-header">
              <tr>
                <th>ID Colaborador</th>
                <th>Nome</th>
                <th>Secção</th>
                <th>Remover</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="users-table-row">
                  <td>{user.id.split("-").pop()}</td>
                  <td>
                    {user.firstName}&nbsp;{user.lastName}
                  </td>
                  <td>{user.roleName}</td>
                  <td>
                    {" "}
                    <i
                      className="fa-solid fa-trash"
                      data-tooltip="Cancelar"
                      onClick={() => handleDeleteUser(user.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="users-button">
            <Link to="/backoffice/dashboard" className="menu__button-users">
              Voltar ao painel
            </Link>
          </div>
        </div>
      ) : (
        <div className="non-authorized">
          <p>Ups. Não tem acesso a esta página.</p>
          <i className="fa-solid fa-hand"></i>
          <p>Deverá fazer login com a sua conta de Admnistrador</p>

          <Link
            to="/backoffice/login"
            className="login-button"
            onClick={logOut}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default Users;
