import "./vacancies.css";
import "./candidates_table.css";
import "./vacancy_description.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatSalaryFull } from "../../mocks/vacancies.js";
import { closeVacancy, duplicateVacancy } from "../../api/vacancies.js";

import Modal from "../../components/ui/Modal/Modal.jsx";
import ActivityTable from "../overview/components/ActivityTable/ActivityTable.jsx";

import {
    IconBriefcase,
    IconRuble,
    IconUsers,
    IconBuilding,
    IconBulb,
    IconDocument,
    IconCheckCircle,
} from "./icons.jsx";

export default function VacancyDescription({ vacancy }) {
    const navigate = useNavigate();

    const [confirmClose, setConfirmClose] = useState(false);
    const [confirmCopy, setConfirmCopy] = useState(false);

    const handleClose = async () => {
        await closeVacancy(vacancy.id);
        setConfirmClose(false);
        navigate("/app/vacancies");
    };

    const handleCopy = async () => {
        await duplicateVacancy(vacancy.id);
        setConfirmCopy(false);
        navigate("/app/vacancies");
    };

    const handleEdit = () => {
        navigate(`/app/vacancies/${vacancy.id}/edit`);
    };

    const handleQuestions = () => {
        navigate(`/app/vacancies/${vacancy.id}/assessment`);
    };

    return (
        <div className="vdesc">
            <div className="vdesc-card">
                <div className="vdesc-grid">
                    <div className="vdesc-col">
                        <div className="vdesc-info-row">
                            <IconBriefcase size={20} />
                            <span>Формат работы: {vacancy.format}</span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconRuble size={20} />
                            <span>
                                Зарплата: {formatSalaryFull(vacancy.salaryFrom, vacancy.salaryTo)}
                            </span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconUsers size={20} />
                            <span>Количество требуемых людей: {vacancy.peopleCount}</span>
                        </div>
                        <div className="vdesc-info-row">
                            <IconBuilding size={20} />
                            <span>Отдел: {vacancy.department}</span>
                        </div>

                        <div className="vdesc-req">
                            <span className="vdesc-req-label">
                                <IconBulb size={20} />
                                Требования:
                            </span>
                            {vacancy.requirements.map((requirement) => (
                                <span key={requirement} className="vdesc-chip">
                                    {requirement}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="vdesc-col">
                        <div className="vdesc-head">
                            <IconDocument size={20} />
                            Описание вакансии
                        </div>
                        <p className="vdesc-text">{vacancy.description}</p>
                    </div>

                    <div className="vdesc-col">
                        <div className="vdesc-head">
                            <IconCheckCircle size={20} />
                            Обязанности
                        </div>
                        <ul className="vdesc-list">
                            {vacancy.responsibilities.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="vdesc-actions">
                    {vacancy.status === "active" && (
                        <button
                            type="button"
                            className="vdesc-btn danger"
                            onClick={() => setConfirmClose(true)}
                        >
                            Закрыть вакансию
                        </button>
                    )}
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={() => setConfirmCopy(true)}
                    >
                        Создать копию
                    </button>
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={handleQuestions}
                    >
                        Матрица компетенций
                    </button>
                    <button
                        type="button"
                        className="vdesc-btn primary"
                        onClick={handleEdit}
                    >
                        Изменить вакансию
                    </button>
                </div>
            </div>

            {/* журнал только по событиям этой вакансии (общий компонент) */}
            <ActivityTable vacancyId={vacancy.id} />

            <Modal open={confirmClose} onClose={() => setConfirmClose(false)}>
                <p className="vdesc-modal-title">Закрыть вакансию «{vacancy.title}»?</p>
                <div className="vdesc-modal-actions">
                    <button
                        type="button"
                        className="vdesc-btn ghost"
                        onClick={() => setConfirmClose(false)}
                    >
                        Отмена
                    </button>
                    <button type="button" className="vdesc-btn danger" onClick={handleClose}>
                        Закрыть
                    </button>
                </div>
            </Modal>

            <Modal open={confirmCopy} onClose={() => setConfirmCopy(false)}>
                <p className="vdesc-modal-title">Создать копию вакансии «{vacancy.title}»?</p>
                <div className="vdesc-modal-actions">
                    <button
                        type="button"
                        className="vdesc-btn ghost"
                        onClick={() => setConfirmCopy(false)}
                    >
                        Отмена
                    </button>
                    <button type="button" className="vdesc-btn primary" onClick={handleCopy}>
                        Создать копию
                    </button>
                </div>
            </Modal>
        </div>
    );
}
