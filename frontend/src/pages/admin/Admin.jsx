import { useMemo, useState } from "react";
import "./Admin.css";
import ActivityTable from "../overview/components/ActivityTable/ActivityTable.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import Pagination from "../../components/ui/Pagination/Pagination.jsx";
import { IconSearch, IconPlus } from "../vacancies/icons.jsx";

const INITIAL_USERS = [
  {
    id: "u1",
    name: "Скворцова Арина",
    email: "qwerty@yandex.ru",
    role: "HR-менеджер",
    status: "Онлайн",
    lastLogin: "30.06.26\n17:35",
  },
  {
    id: "u2",
    name: "Скворцова Арина",
    email: "qwerty@yandex.ru",
    role: "Администратор",
    status: "Оффлайн",
    lastLogin: "30.06.26\n17:35",
  },
  {
    id: "u3",
    name: "Скворцова Арина",
    email: "qwerty@yandex.ru",
    role: "Согласующий",
    status: "Онлайн",
    lastLogin: "30.06.26\n17:35",
  },
  {
    id: "u4",
    name: "Скворцова Арина",
    email: "qwerty@yandex.ru",
    role: "HR-менеджер",
    status: "Онлайн",
    lastLogin: "30.06.26\n17:35",
  },
  {
    id: "u5",
    name: "Скворцова Арина",
    email: "qwerty@yandex.ru",
    role: "HR-менеджер",
    status: "Онлайн",
    lastLogin: "30.06.26\n17:35",
  },
];

const ROLES = ["HR-менеджер", "Администратор", "Согласующий"];

const PAGE_SIZE = 20;

const PERMISSIONS = [
  "Удаление кандидатов",
  "Редактирование кандидатов",
  "Редактирование вакансий",
  "Назначение интервью",
  "Печать документов",
  "Управление пользователями",
  "Просмотр журнала активности",
];

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function Admin() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(INITIAL_USERS[0].id);
  const [draftRole, setDraftRole] = useState(INITIAL_USERS[0].role);
  const [permissions, setPermissions] = useState(["Удаление кандидатов"]);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [page, setPage] = useState(1);

  const selectedUser = users.find((user) => user.id === selectedUserId) || users[0];

  const visibleUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role, user.status, user.lastLogin]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageUsers = visibleUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeUserRole = (userId, role) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    if (userId === selectedUserId) {
      setDraftRole(role);
    }
  };

  const selectUser = (user) => {
    setSelectedUserId(user.id);
    setDraftRole(user.role);
  };

  const togglePermission = (permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  const saveRole = () => {
    changeUserRole(selectedUserId, draftRole);
    setConfirmSave(false);
  };

  const deleteUser = () => {
    setUsers((prev) => {
      const next = prev.filter((user) => user.id !== selectedUserId);
      const fallback = next[0];
      if (fallback) {
        setSelectedUserId(fallback.id);
        setDraftRole(fallback.role);
      }
      return next;
    });
    setConfirmDelete(false);
  };

  const addUser = () => {
    const user = {
      id: `u${Date.now()}`,
      name: "Новый пользователь",
      email: "new-user@huntly.ru",
      role: "HR-менеджер",
      status: "Оффлайн",
      lastLogin: "—\n—",
    };

    setUsers((prev) => [user, ...prev]);
    setSelectedUserId(user.id);
    setDraftRole(user.role);
    setConfirmAdd(false);
    setPage(1);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Администрирование</h1>

      <div className="admin-grid">
        <section className="admin-users-card">
          <div className="admin-card-header">
            <h2>Пользователи и роли</h2>
            <div className="admin-search">
              <IconSearch size={20} />
              <input
                type="text"
                placeholder="Поиск"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="admin-add-btn"
              onClick={() => setConfirmAdd(true)}
            >
              <IconPlus size={18} />
              Добавить
            </button>
          </div>

          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Последний вход</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((user) => (
                <tr
                  key={user.id}
                  className={selectedUserId === user.id ? "selected" : ""}
                  onClick={() => selectUser(user)}
                >
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-avatar">{initials(user.name)}</span>
                      <div>
                        <div className="admin-user-name">{user.name}</div>
                        <div className="admin-user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <select
                      className={`admin-role-select admin-role-${user.role}`}
                      value={user.role}
                      onChange={(event) => changeUserRole(user.id, event.target.value)}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`admin-status ${user.status === "Онлайн" ? "online" : "offline"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="admin-last-login">
                    {user.lastLogin.split("\n").map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </section>

        <aside className="admin-role-card">
          <h2>Редактирование роли</h2>
          <div className="admin-role-person">
            <span className="admin-avatar">{initials(selectedUser.name)}</span>
            <div>
              <div className="admin-user-name">{selectedUser.name}</div>
              <div className="admin-user-email">{selectedUser.email}</div>
            </div>
          </div>

          <select
            className={`admin-role-select admin-role-${draftRole}`}
            value={draftRole}
            onChange={(event) => setDraftRole(event.target.value)}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="admin-permissions-title">Права доступа</div>
          <div className="admin-permissions-list">
            {PERMISSIONS.map((permission) => (
              <label key={permission} className="admin-permission-row">
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                />
                <span>{permission}</span>
              </label>
            ))}
          </div>

          <div className="admin-role-actions">
            <button
              type="button"
              className="admin-delete-btn"
              onClick={() => setConfirmDelete(true)}
            >
              Удалить
            </button>
            <div className="admin-role-actions-right">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() => setDraftRole(selectedUser.role)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="admin-save-btn"
                onClick={() => setConfirmSave(true)}
              >
                Сохранить
              </button>
            </div>
          </div>
        </aside>
      </div>

      <ActivityTable />

      <Modal open={confirmAdd} onClose={() => setConfirmAdd(false)}>
        <p className="admin-modal-title">Добавить нового пользователя?</p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-ghost-btn"
            onClick={() => setConfirmAdd(false)}
          >
            Отмена
          </button>
          <button type="button" className="admin-save-btn" onClick={addUser}>
            Добавить
          </button>
        </div>
      </Modal>

      <Modal open={confirmSave} onClose={() => setConfirmSave(false)}>
        <p className="admin-modal-title">
          Сохранить роль «{draftRole}» для пользователя {selectedUser.name}?
        </p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-ghost-btn"
            onClick={() => setConfirmSave(false)}
          >
            Отмена
          </button>
          <button type="button" className="admin-save-btn" onClick={saveRole}>
            Сохранить
          </button>
        </div>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <p className="admin-modal-title">
          Удалить пользователя {selectedUser.name}?
        </p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-ghost-btn"
            onClick={() => setConfirmDelete(false)}
          >
            Отмена
          </button>
          <button type="button" className="admin-delete-btn" onClick={deleteUser}>
            Удалить
          </button>
        </div>
      </Modal>
    </div>
  );
}
