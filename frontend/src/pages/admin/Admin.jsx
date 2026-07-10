import { useEffect, useMemo, useState } from "react";
import "./Admin.css";
import ActivityTable from "../overview/components/ActivityTable/ActivityTable.jsx";
import Modal from "../../components/ui/Modal/Modal.jsx";
import Pagination from "../../components/ui/Pagination/Pagination.jsx";
import { IconSearch, IconPlus } from "../vacancies/icons.jsx";
import { fetchManagedUsers, changeUserRole, setUserActive } from "../../api/users.js";
import { fetchPermissions } from "../../api/permissions.js";
import { apiPost } from "../../api/client.js";
import { formatDateTime } from "../../api/format.js";

// роли бэка ↔ человекочитаемые подписи в UI
const ROLE_LABELS = { HR: "HR-менеджер", Admin: "Администратор", DecisionMaker: "Согласующий" };
const ROLE_CODES = { "HR-менеджер": "HR", "Администратор": "Admin", "Согласующий": "DecisionMaker" };
const ROLES = ["HR-менеджер", "Администратор", "Согласующий"];

const PAGE_SIZE = 8;

// ключи прав бэка → подписи чеклиста (порядок сохраняем)
const PERMISSION_LABELS = {
  "candidates.edit": "Редактирование кандидатов",
  "candidates.delete": "Удаление кандидатов",
  "vacancies.edit": "Редактирование вакансий",
  "interviews.schedule": "Назначение интервью",
  "documents.print": "Печать документов",
  "users.manage": "Управление пользователями",
  "audit.view": "Просмотр журнала активности",
};
const PERMISSION_ORDER = Object.keys(PERMISSION_LABELS);

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [permsByRole, setPermsByRole] = useState({});
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draftRole, setDraftRole] = useState("HR-менеджер");
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserLogin, setNewUserLogin] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("HR-менеджер");
  const [addError, setAddError] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = () =>
    fetchManagedUsers()
      .then((list) => {
        const mapped = list.map((user) => ({
          id: String(user.id),
          name: user.fullName,
          email: user.email || user.login,
          roleCode: user.role,
          role: ROLE_LABELS[user.role] ?? user.role,
          isActive: user.isActive,
          status: user.isActive ? "Активен" : "Заблокирован",
          lastLogin: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—",
        }));
        setUsers(mapped);
        setSelectedUserId((prev) => prev ?? mapped[0]?.id ?? null);
        setLoadError("");
      })
      .catch((error) => setLoadError(error.message || "Нет доступа к управлению пользователями"));

  useEffect(() => {
    loadUsers();
    fetchPermissions().then(setPermsByRole).catch(() => {});
  }, []);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ||
    users[0] || { name: "—", email: "", role: draftRole, roleCode: "HR", isActive: true };

  const visibleUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return users;
    }
    return users.filter((user) =>
      [user.name, user.email, user.role, user.status].join(" ").toLowerCase().includes(search)
    );
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageUsers = visibleUsers.slice(0, safePage * PAGE_SIZE);

  const rolePerms = permsByRole[selectedUser.roleCode] || [];

  const applyRole = async (userId, roleLabel) => {
    setActionError("");
    try {
      await changeUserRole(userId, ROLE_CODES[roleLabel] ?? "HR");
      await loadUsers();
    } catch (error) {
      setActionError(error.message || "Не удалось сменить роль");
    }
  };

  const selectUser = (user) => {
    setSelectedUserId(user.id);
    setDraftRole(user.role);
  };

  const saveRole = async () => {
    setConfirmSave(false);
    await applyRole(selectedUserId, draftRole);
  };

  const toggleActive = async () => {
    setConfirmToggle(false);
    setActionError("");
    try {
      await setUserActive(selectedUser.id, !selectedUser.isActive);
      await loadUsers();
    } catch (error) {
      setActionError(error.message || "Не удалось изменить статус пользователя");
    }
  };

  const addUser = async () => {
    setAddError("");
    try {
      await apiPost("/auth/register", {
        username: newUserLogin.trim(),
        password: newUserPassword,
        fullName: newUserName.trim() || newUserLogin.trim(),
        role: ROLE_CODES[newUserRole] ?? "HR",
      });
      setNewUserName("");
      setNewUserLogin("");
      setNewUserPassword("");
      setNewUserRole("HR-менеджер");
      setConfirmAdd(false);
      await loadUsers();
    } catch (error) {
      setAddError(error.message || "Не удалось добавить пользователя");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Администрирование</h1>
      {loadError && <div className="field-error" style={{ marginBottom: 12 }}>{loadError}</div>}
      {actionError && <div className="field-error" style={{ marginBottom: 12 }}>{actionError}</div>}

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
            <button type="button" className="admin-add-btn" onClick={() => setConfirmAdd(true)}>
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
                      onChange={(event) => applyRole(user.id, event.target.value)}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`admin-status ${user.isActive ? "online" : "offline"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="admin-last-login">{user.lastLogin}</td>
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
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <div className="admin-permissions-title">Права роли (задаются системно)</div>
          <div className="admin-permissions-list">
            {PERMISSION_ORDER.map((key) => (
              <label key={key} className="admin-permission-row">
                <input type="checkbox" checked={rolePerms.includes(key)} readOnly disabled />
                <span>{PERMISSION_LABELS[key]}</span>
              </label>
            ))}
          </div>

          <div className="admin-role-actions">
            <button
              type="button"
              className="admin-delete-btn"
              onClick={() => setConfirmToggle(true)}
            >
              {selectedUser.isActive ? "Заблокировать" : "Разблокировать"}
            </button>
            <div className="admin-role-actions-right">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() => setDraftRole(selectedUser.role)}
              >
                Отмена
              </button>
              <button type="button" className="admin-save-btn" onClick={() => setConfirmSave(true)}>
                Сохранить роль
              </button>
            </div>
          </div>
        </aside>
      </div>

      <ActivityTable />

      <Modal open={confirmAdd} onClose={() => setConfirmAdd(false)}>
        <p className="admin-modal-title">Добавить пользователя</p>
        <div className="admin-add-form">
          <input type="text" placeholder="ФИО" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
          <input type="text" placeholder="Логин" value={newUserLogin} onChange={(e) => setNewUserLogin(e.target.value)} />
          <input type="password" placeholder="Пароль (мин. 6 символов)" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
          <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {addError && <div className="field-error">{addError}</div>}
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="admin-ghost-btn" onClick={() => setConfirmAdd(false)}>Отмена</button>
          <button type="button" className="admin-save-btn" onClick={addUser}>Добавить</button>
        </div>
      </Modal>

      <Modal open={confirmSave} onClose={() => setConfirmSave(false)}>
        <p className="admin-modal-title">
          Сохранить роль «{draftRole}» для пользователя {selectedUser.name}?
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-ghost-btn" onClick={() => setConfirmSave(false)}>Отмена</button>
          <button type="button" className="admin-save-btn" onClick={saveRole}>Сохранить</button>
        </div>
      </Modal>

      <Modal open={confirmToggle} onClose={() => setConfirmToggle(false)}>
        <p className="admin-modal-title">
          {selectedUser.isActive ? "Заблокировать" : "Разблокировать"} пользователя {selectedUser.name}?
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-ghost-btn" onClick={() => setConfirmToggle(false)}>Отмена</button>
          <button type="button" className="admin-delete-btn" onClick={toggleActive}>
            {selectedUser.isActive ? "Заблокировать" : "Разблокировать"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
