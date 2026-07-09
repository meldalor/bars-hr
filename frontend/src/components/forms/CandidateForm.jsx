import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import Modal from "../ui/Modal/Modal.jsx";
import "../../pages/candidates/CreateCandidate.css"; // Путь к CSS

const MOCK_SKILLS = ["Язык C#", "Язык JS", "Язык Py", "Язык Kotlin", "Знания Git", "Английский"];
const REQUIRED_FIELDS = ["lastName", "firstName", "middleName", "city", "phone", "vacancy"];

let uidCounter = 0;
const nextId = () => `row-${Date.now()}-${uidCounter++}`;

const emptyEducation = () => ({ id: nextId(), level: "", institution: "", faculty: "", start: "", end: "" });
const emptyExperience = () => ({ id: nextId(), company: "", position: "", start: "", end: "", info: "" });

// --- ФУНКЦИЯ РАСЧЕТА ОБЩЕГО СТАЖА ---
const calculateTotalExperience = (experienceList) => {
  let totalMonths = 0;

  experienceList.forEach((exp) => {
    if (!exp.start) return;

    let startDate;
    if (exp.start.includes('.')) {
      const [d, m, y] = exp.start.split('.');
      startDate = new Date(`${y}-${m}-${d}`);
    } else {
      startDate = new Date(exp.start);
    }

    if (isNaN(startDate.getTime())) return;

    let endDate;
    if (exp.end) {
      if (exp.end.includes('.')) {
        const [d, m, y] = exp.end.split('.');
        endDate = new Date(`${y}-${m}-${d}`);
      } else {
        endDate = new Date(exp.end);
      }
    } else {
      endDate = new Date();
    }

    if (startDate <= endDate) {
      const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                         (endDate.getMonth() - startDate.getMonth());
      totalMonths += diffMonths;
    }
  });

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let result = "";
  if (years > 0) result += `${years} ${years === 1 ? 'год' : 'года'}`;
  if (months > 0) result += ` ${months} ${months === 1 ? 'месяц' : 'месяца'}`;
  if (!result) return "Опыт не указан";

  return result.trim();
};

// ---------- Мелкие переиспользуемые поля ----------
const FieldError = ({ id, message }) =>
  message ? (
    <div className="field-error" id={id} role="alert">
      {message}
    </div>
  ) : null;

const InputField = ({ id, label, required, placeholder, value, onChange, type = "text", className = "", name, error }) => (
  <div className={`form-group ${className}`}>
    <label className="form-label" htmlFor={id}>
      {label} {required && <span className="required-star">*</span>}
    </label>
    <input
      id={id}
      type={type}
      className={`form-input ${error ? "has-error" : ""}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

const PhoneField = ({ id, label, required, value, onChange, name, error }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>
      {label} {required && <span className="required-star">*</span>}
    </label>
    <IMaskInput
      id={id}
      mask="+7 (000) 000-00-00"
      className={`form-input ${error ? "has-error" : ""}`}
      placeholder="+7 (___) ___-__-__"
      value={value}
      onAccept={(val) => onChange({ target: { name, value: val } })}
      name={name}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

const TextAreaField = ({ id, label, value, onChange, placeholder, maxLength, name }) => (
  <div className="form-group full-width">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="textarea-wrapper">
      <textarea
        id={id}
        className="form-textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        name={name}
      />
      <div className="char-counter">{value.length}/{maxLength}</div>
    </div>
  </div>
);

const SelectField = ({ id, label, value, onChange, options, placeholder, name }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>{label}</label>
    <select id={id} className="form-select" value={value} onChange={onChange} name={name}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const MaskDateField = ({ id, value, onChange, name, className = "" }) => (
  <IMaskInput
    id={id}
    mask="00.00.0000"
    className={`form-input ${className}`}
    value={value}
    onAccept={(val) => onChange({ target: { name, value: val } })}
    name={name}
    placeholder="ДД.ММ.ГГГГ"
  />
);

const RemovableBlock = ({ children, onRemove, removable, last }) => (
  <div className={`subsection-block fade-in ${last ? "subsection-block--last" : ""}`}>
    {removable && (
      <button type="button" className="remove-sub-btn" onClick={onRemove} aria-label="Удалить блок">
        ×
      </button>
    )}
    {children}
  </div>
);

const SectionCheck = ({ done }) =>
  done ? (
    <span className="section-done-badge" title="Все обязательные поля заполнены">
      ✓
    </span>
  ) : null;

// --- УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ ФОРМЫ ---
export default function CandidateForm({
  mode = "create", // 'create' или 'edit'
  initialData = {},
  onSubmitCallback, // Функция, которая будет вызвана при сабмите
  onCancel,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: initialData.lastName || "",
    firstName: initialData.firstName || "",
    middleName: initialData.middleName || "",
    city: initialData.city || "",
    phone: initialData.phone || "",
    telegram: initialData.telegram || "",
    vacancy: initialData.vacancy || "",
    info: initialData.info || "",
    selectedSkills: initialData.selectedSkills || ["Язык C#"],
  });

  const [education, setEducation] = useState(
    initialData.education && initialData.education.length > 0
      ? initialData.education
      : [emptyEducation()]
  );

  const [experience, setExperience] = useState(
    initialData.experience && initialData.experience.length > 0
      ? initialData.experience
      : [emptyExperience()]
  );

  const [errors, setErrors] = useState({});
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
    if (errors.selectedSkills) setErrors((prev) => ({ ...prev, selectedSkills: undefined }));
  };

  const addNewSkill = () => {
    if (isAddingSkill && newSkillInput.trim()) {
      const trimmed = newSkillInput.trim();
      if (!formData.selectedSkills.includes(trimmed)) {
        setFormData((prev) => ({ ...prev, selectedSkills: [...prev.selectedSkills, trimmed] }));
      }
      setNewSkillInput("");
      setIsAddingSkill(false);
    } else {
      setIsAddingSkill(true);
    }
  };

  const addEducation = () => setEducation((prev) => [...prev, emptyEducation()]);
  const removeEducation = (id) => setEducation((prev) => prev.filter((e) => e.id !== id));
  const updateEducation = (id, field, value) =>
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addExperience = () => setExperience((prev) => [...prev, emptyExperience()]);
  const removeExperience = (id) => setExperience((prev) => prev.filter((e) => e.id !== id));
  const updateExperience = (id, field, value) =>
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const mainSectionDone =
    REQUIRED_FIELDS.every((f) => formData[f].trim() !== "") && formData.selectedSkills.length > 0;

  // --- ВЫЧИСЛЯЕМ ОБЩИЙ СТАЖ ---
  const totalExperience = calculateTotalExperience(experience);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = "Обязательное поле";
    });
    if (formData.selectedSkills.length === 0) newErrors.selectedSkills = "Укажите хотя бы один навык";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstInvalidName = Object.keys(newErrors).find((k) => k !== "selectedSkills");
      const el = firstInvalidName
        ? document.querySelector(`[name="${firstInvalidName}"]`)
        : document.querySelector(".skills-block");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el?.focus) el.focus();
      return;
    }

    setConfirmSave(true);
  };

  const doSubmit = () => {
    setConfirmSave(false);

    if (onSubmitCallback) {
      onSubmitCallback({ formData, education, experience });
    } else {
      navigate("/app/candidates");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
    <form
      className="candidate-form"
      onSubmit={handleSubmit}
      noValidate
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") {
          e.preventDefault();
        }
      }}
    >
      {/* --- БЛОК 1: ОСНОВНАЯ ИНФОРМАЦИЯ --- */}
      <div className="form-section">
        <div className="section-header-left">
          <h2 className="section-title">
            Основная информация
            <SectionCheck done={mainSectionDone} />
          </h2>
        </div>
        <div className="section-grid">
          <InputField id="lastName" label="Фамилия" required placeholder="Введите фамилию" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
          <InputField id="firstName" label="Имя" required placeholder="Введите имя" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
          <InputField id="middleName" label="Отчество" required placeholder="Введите отчество" name="middleName" value={formData.middleName} onChange={handleChange} error={errors.middleName} />
          <InputField id="city" label="Город" required placeholder="Например: Казань" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
          <PhoneField id="phone" label="Телефон" required value={formData.phone} onChange={handleChange} name="phone" error={errors.phone} />
          <InputField id="telegram" label="Телеграм" placeholder="Введите @никнейм" name="telegram" value={formData.telegram} onChange={handleChange} />
        </div>
        <div className="section-grid">
          {/* ИЗМЕНЕНО: Вакансия -> Специальность */}
          <InputField id="vacancy" label="Специальность" required placeholder="Введите специальность" name="vacancy" value={formData.vacancy} onChange={handleChange} error={errors.vacancy} />
          <TextAreaField id="info" label="Дополнительная информация" value={formData.info} onChange={handleChange} name="info" placeholder="Например: готов к переезду, доступен с понедельника" maxLength={2000} />
        </div>
      </div>

      {/* --- БЛОК 2: ОБРАЗОВАНИЕ --- */}
      <div className="form-section">
        <div className="section-header">
          <h2 className="section-title">
            Образование <span className="section-optional">необязательно</span>
          </h2>
          <button type="button" className="add-btn" onClick={addEducation}>
            + Добавить образование
          </button>
        </div>
        {education.map((edu, index) => (
          <RemovableBlock
            key={edu.id}
            removable={index > 0}
            last={index === education.length - 1}
            onRemove={() => removeEducation(edu.id)}
          >
            <div className="section-grid">
              <SelectField
                id={`edu-level-${edu.id}`}
                label="Уровень образования"
                value={edu.level}
                onChange={(e) => updateEducation(edu.id, "level", e.target.value)}
                name={`edu-level-${edu.id}`}
                options={["Среднее", "Бакалавриат", "Магистратура", "Специалитет", "Аспирантура"]}
                placeholder="Выберите"
              />
              <InputField
                id={`edu-inst-${edu.id}`}
                label="Учебное заведение"
                placeholder="Введите название"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                name={`edu-inst-${edu.id}`}
              />

              <div className="form-group period-group">
                <label className="form-label">Период обучения</label>
                <div className="period-inputs">
                  <MaskDateField
                    className="date-start"
                    value={edu.start}
                    onChange={(e) => updateEducation(edu.id, "start", e.target.value)}
                    name={`edu-start-${edu.id}`}
                  />
                  <div className="period-sep">по</div>
                  <MaskDateField
                    className="date-end"
                    value={edu.end}
                    onChange={(e) => updateEducation(edu.id, "end", e.target.value)}
                    name={`edu-end-${edu.id}`}
                  />
                </div>
              </div>
            </div>
            <div className="section-grid">
              <InputField
                id={`edu-fac-${edu.id}`}
                label="Факультет"
                placeholder="Например: Информатика"
                value={edu.faculty}
                onChange={(e) => updateEducation(edu.id, "faculty", e.target.value)}
                name={`edu-fac-${edu.id}`}
              />
            </div>
          </RemovableBlock>
        ))}
      </div>

      {/* --- БЛОК 3: ОПЫТ РАБОТЫ И НАВЫКИ --- */}
      <div className="form-section experience-section">
        <div className="section-header">
          <h2 className="section-title">
            Опыт работы и навыки <span className="section-optional">необязательно</span>
          </h2>
          <button type="button" className="add-btn" onClick={addExperience}>
            + Добавить место работы
          </button>
        </div>
        {experience.map((exp, index) => (
          <RemovableBlock
            key={exp.id}
            removable={index > 0}
            last={index === experience.length - 1}
            onRemove={() => removeExperience(exp.id)}
          >
            <div className="section-grid">
              <InputField
                id={`exp-company-${exp.id}`}
                label="Компания"
                placeholder="Введите название компании"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                name={`exp-company-${exp.id}`}
              />
              <InputField
                id={`exp-pos-${exp.id}`}
                label="Должность"
                placeholder="Введите должность"
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                name={`exp-pos-${exp.id}`}
              />

              <div className="form-group period-group">
                <label className="form-label">Период работы</label>
                <div className="period-inputs">
                  <MaskDateField
                    className="date-start"
                    value={exp.start}
                    onChange={(e) => updateExperience(exp.id, "start", e.target.value)}
                    name={`exp-start-${exp.id}`}
                  />
                  <div className="period-sep">по</div>
                  <MaskDateField
                    className="date-end"
                    value={exp.end}
                    onChange={(e) => updateExperience(exp.id, "end", e.target.value)}
                    name={`exp-end-${exp.id}`}
                  />
                </div>
              </div>
            </div>
            <TextAreaField
              id={`exp-info-${exp.id}`}
              label="Дополнительная информация"
              value={exp.info}
              onChange={(e) => updateExperience(exp.id, "info", e.target.value)}
              name={`exp-info-${exp.id}`}
              placeholder="Например: обязанности, достижения, причина ухода"
              maxLength={2000}
            />
          </RemovableBlock>
        ))}

        {/* --- БЛОК НАВЫКОВ (ПЕРЕМЕЩЕН В КОНЕЦ) --- */}
        <div className="skills-block" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--cc-card-border)' }}>
          <label className="form-label section-label-left">
            Навыки <span className="required-star">*</span>
          </label>
          <div className="skills-list">
            {MOCK_SKILLS.map((skill) => {
              const isSelected = formData.selectedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`skill-tag ${isSelected ? "active" : ""}`}
                  onClick={() => toggleSkill(skill)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSkill(skill))}
                >
                  {skill}
                  {isSelected && <span className="skill-remove">×</span>}
                </span>
              );
            })}
            {formData.selectedSkills
              .filter((s) => !MOCK_SKILLS.includes(s))
              .map((skill) => (
                <span
                  key={skill}
                  className="skill-tag active"
                  onClick={() => toggleSkill(skill)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSkill(skill))}
                >
                  {skill}
                  <span className="skill-remove">×</span>
                </span>
              ))}

            <div className="add-skill-wrapper">
              {isAddingSkill && (
                <input
                  type="text"
                  className="skill-input-hidden"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNewSkill())}
                  autoFocus
                  placeholder="Навык..."
                  aria-label="Название нового навыка"
                />
              )}
              <button type="button" className="skill-add-btn-large" onClick={addNewSkill}>
                + Добавить
              </button>
            </div>

            {/* СТАЖ КАК ПОЛНОЦЕННЫЙ НАВЫК */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '32px',
                padding: '0 16px',
                boxSizing: 'border-box',
                background: '#FF8800',
                color: '#ffffff',
                border: '1px solid transparent',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              Опыт: {totalExperience}
            </span>

          </div>
          <FieldError message={errors.selectedSkills} />
        </div>

        <div className="form-actions-right">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            <span className="btn-icon">↩</span> Отменить
          </button>
          <button type="submit" className="btn-submit">
            <span className="btn-icon">+</span> {mode === 'create' ? 'Создать кандидата' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </form>

    <Modal open={confirmSave} onClose={() => setConfirmSave(false)}>
      <p className="cf-modal-title">
        {mode === "create" ? "Создать кандидата?" : "Сохранить изменения?"}
      </p>
      <div className="cf-modal-actions">
        <button type="button" className="btn-cancel" onClick={() => setConfirmSave(false)}>
          Отмена
        </button>
        <button type="button" className="btn-submit" onClick={doSubmit}>
          {mode === "create" ? "Создать" : "Сохранить"}
        </button>
      </div>
    </Modal>
    </>
  );
}