import "./ActivityTable.css";
import { getActivityByVacancy } from "../../../../mocks/activity";

import searchIcon from "../../../../assets/overview/search.svg";
import filterIcon from "../../../../assets/overview/nastroyky.svg";
import calendarIcon from "../../../../assets/overview/calendar.svg";
import chevronDownIcon from "../../../../assets/overview/Chevron down.svg";

function ActivityTable() {
    const activity = getActivityByVacancy();

    return (
        <section className="activity-table-card">
            <div className="activity-header">
                <h2 className="activity-title">
                    Журнал активности
                </h2>

                <div className="activity-toolbar">
                    <div className="activity-search-wrapper">
                        <img
                            src={searchIcon}
                            alt=""
                            className="activity-search-icon"
                        />

                        <input
                            type="text"
                            placeholder="Поиск"
                            className="activity-search"
                        />
                    </div>

                    <button className="activity-button">
                        <img
                            src={filterIcon}
                            alt=""
                            className="activity-button-icon"
                        />
                        <span>Фильтры</span>
                    </button>

                    <button className="activity-button">
                        <img
                            src={calendarIcon}
                            alt=""
                            className="activity-button-icon"
                        />
                        <span>Выбрать дату</span>
                    </button>
                </div>
            </div>

            <div className="activity-table-wrapper">
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>
                                <span>Дата и время</span>
                                <img
                                    src={chevronDownIcon}
                                    alt=""
                                    className="table-arrow"
                                />
                            </th>

                            <th>
                                <span>Пользователь</span>
                                <img
                                    src={chevronDownIcon}
                                    alt=""
                                    className="table-arrow"
                                />
                            </th>

                            <th>
                                <span>Роль</span>
                                <img
                                    src={chevronDownIcon}
                                    alt=""
                                    className="table-arrow"
                                />
                            </th>

                            <th>
                                <span>Действие</span>
                                <img
                                    src={chevronDownIcon}
                                    alt=""
                                    className="table-arrow"
                                />
                            </th>

                            <th>
                                <span>Детали</span>
                                <img
                                    src={chevronDownIcon}
                                    alt=""
                                    className="table-arrow"
                                />
                            </th>
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