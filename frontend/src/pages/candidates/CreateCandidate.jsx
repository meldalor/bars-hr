import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CandidateForm from "../../components/forms/CandidateForm";
import { createCandidate, buildCandidateRequest } from "../../api/candidates.js";
import { createApplication } from "../../api/applications.js";
import "./CreateCandidate.css";

function CreateCandidate() {
  const navigate = useNavigate();
  const location = useLocation();
  // создание со страницы вакансии: сразу привязываем кандидата откликом и возвращаемся к вакансии
  const vacancyId = location.state?.vacancyId ?? null;
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    try {
      const created = await createCandidate(buildCandidateRequest(data));
      if (vacancyId) {
        await createApplication({ candidateId: created.id, vacancyId });
        navigate(`/app/vacancies/${vacancyId}`);
      } else {
        navigate(`/app/candidates/${created.id}`);
      }
    } catch (submitError) {
      setError(submitError.message || "Не удалось создать кандидата");
    }
  };

  return (
    <div className="create-candidate-page">
      <button className="back-button" onClick={() => window.history.back()}>
        ← Вернуться назад
      </button>

      <div className="title-row">
        <h1 className="page-title-create">Создание нового кандидата</h1>
      </div>

      {error && (
        <div className="field-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <CandidateForm mode="create" onSubmitCallback={handleSubmit} />
    </div>
  );
}

export default CreateCandidate;
