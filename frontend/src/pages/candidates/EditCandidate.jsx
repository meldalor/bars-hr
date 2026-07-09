import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateForm from "../../components/forms/CandidateForm";
import { fetchCandidate, updateCandidate, buildCandidateRequest } from "../../api/candidates.js";
import "../../pages/candidates/CreateCandidate.css";

// mapCandidate → initialData формы: ФИО по словам, образование/опыт уже приходят списками записей
function toInitialData(candidate) {
  const parts = candidate.fullName.split(/\s+/);
  return {
    lastName: parts[0] || "",
    firstName: parts[1] || "",
    middleName: parts.slice(2).join(" "),
    city: candidate.city,
    phone: candidate.phone,
    telegram: candidate.telegram,
    vacancy: candidate.specialty,
    info: candidate.additionalInfo,
    selectedSkills: candidate.skills,
    education: candidate.education,
    experience: candidate.experience,
  };
}

function EditCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCandidate(id)
      .then((candidate) => {
        if (!cancelled) {
          setCandidateData(toInitialData(candidate));
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || "Не удалось загрузить кандидата");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await updateCandidate(id, buildCandidateRequest(data));
      navigate(`/app/candidates/${id}`);
    } catch (submitError) {
      setError(submitError.message || "Не удалось сохранить изменения");
    }
  };

  const handleCancel = () => {
    navigate(`/app/candidates/${id}`);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Загрузка данных кандидата...</div>;
  }

  if (!candidateData) {
    return <div style={{ padding: 40, textAlign: "center" }}>{error || "Кандидат не найден"}</div>;
  }

  return (
    <div className="create-candidate-page">
      <button className="back-button" onClick={handleCancel}>
        ← Вернуться к кандидату
      </button>

      <div className="title-row">
        <h1 className="page-title-create">Редактирование кандидата</h1>
      </div>

      {error && (
        <div className="field-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <CandidateForm
        mode="edit"
        initialData={candidateData}
        onSubmitCallback={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default EditCandidate;
