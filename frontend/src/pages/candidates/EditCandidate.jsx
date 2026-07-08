import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateForm from "../../components/forms/CandidateForm";
import "../../pages/candidates/CreateCandidate.css";

// Моковые данные (имитация данных из базы)
const MOCK_CANDIDATE = {
  id: "1",
  lastName: "Иванов",
  firstName: "Иван",
  middleName: "Иванович",
  city: "Казань",
  phone: "+7 (999) 888-77-66",
  telegram: "@ivanov_dev",
  vacancy: "Frontend-разработчик",
  info: "Опыт работы 5 лет, готов к переезду.",
  selectedSkills: ["Язык JS", "Язык Py", "Английский"],
  education: [
    { id: "edu1", level: "Бакалавриат", institution: "КФУ", faculty: "Прикладная математика", start: "01-02-2019", end: "01-02-2019" },
  ],
  experience: [
    { id: "exp1", company: "ООО Ромашка", position: "Middle Frontend", start: "01-02-2019", end: "01-02-2019", info: "Разработка корпоративных порталов" },
  ],
};

function EditCandidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState(null);

  useEffect(() => {
    // Имитация запроса к API по ID
    setTimeout(() => {
      setCandidateData(MOCK_CANDIDATE);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSubmit = (data) => {
    console.log("Сохраняем изменения для кандидата:", id, data);
    navigate("/app/candidates");
  };

  const handleCancel = () => {
    navigate("/app/candidates");
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка данных кандидата...</div>;
  }

  return (
    <div className="create-candidate-page">
      <button className="back-button" onClick={handleCancel}>
        ← Вернуться к списку
      </button>

      <div className="title-row">
        <h1 className="page-title-create">Редактирование кандидата</h1>
      </div>

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