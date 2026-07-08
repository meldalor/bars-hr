import CandidateForm from "../../components/forms/CandidateForm";
import "./CreateCandidate.css";

function CreateCandidate() {
  return (
    <div className="create-candidate-page">
      <button className="back-button" onClick={() => window.history.back()}>
        ← Вернуться назад
      </button>

      <div className="title-row">
        <h1 className="page-title-create">Создание нового кандидата</h1>
      </div>

      <CandidateForm mode="create" />
    </div>
  );
}

export default CreateCandidate;