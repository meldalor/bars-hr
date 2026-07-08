import "./ActivityTable.css";
import { getActivityByVacancy } from "../../../../mocks/activity";

function ActivityTable() {
    const activity = getActivityByVacancy();

    return (
        <section className="activity-table-card">
            <div className="activity-header">
                <h2 className="activity-title">Журнал активности</h2>

                <div className="activity-toolbar">
                    <input
                        type="text"
                        placeholder="Поиск"
                        className="activity-search"
                    />

                    <button className="activity-button">
                        Фильтры
                    </button>

                    <button className="activity-button">
                        Выбрать дату
                    </button>
                </div>
            </div>

            <div className="activity-table-wrapper">
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Дата и время</th>
                            <th>Пользователь</th>
                            <th>Роль</th>
                            <th>Действие</th>
                            <th>Детали</th>
                        </tr>
                    </thead>

                    <tbody>
                        {activity.map((item) => (
                            <tr key={item.id}>
                                <td>{item.datetime}</td>
                                <td>{item.user}</td>
                                <td>{item.role}</td>
                                <td>{item.action}</td>
                                <td>{item.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default ActivityTable;