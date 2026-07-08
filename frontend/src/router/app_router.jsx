import { Routes, Route } from "react-router-dom";

import Login from "../pages/login/login.jsx";
import Landing from "../pages/landing/landing.jsx";

import Overview from "../pages/overview/overview.jsx";
import Vacancies from "../pages/vacancies/vacancies.jsx";
import VacancyCreate from "../pages/vacancies/VacancyCreate.jsx";
import VacancyDetail from "../pages/vacancies/VacancyDetail.jsx";
import VacancyAssessment from "../pages/vacancies/VacancyAssessment.jsx";
import Candidates from "../pages/candidates/candidates.jsx";
import CreateCandidate from "../pages/candidates/CreateCandidate";
import EditCandidate from "../pages/candidates/EditCandidate";
import CandidateProfile from "../pages/candidates/CandidateProfile.jsx";
import Meetings from "../pages/meetings/meetings.jsx";
import Admin from "../pages/admin/Admin.jsx";
import MeetingInterview from "../pages/meetings/MeetingInterview.jsx";

import Layout from "../components/layout/layout";

function App_Router() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Layout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="vacancies" element={<Vacancies />} />
        <Route path="vacancies/new" element={<VacancyCreate />} />
        <Route path="vacancies/:id/edit" element={<VacancyCreate />} />
        <Route path="vacancies/:id/assessment" element={<VacancyAssessment />} />
        <Route path="vacancies/:id" element={<VacancyDetail />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidates/create" element={<CreateCandidate />} />
        <Route path="candidates/edit/:id" element={<EditCandidate />} />
        <Route path="candidates/:id" element={<CandidateProfile />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/:id" element={<MeetingInterview />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App_Router;