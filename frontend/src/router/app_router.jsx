import { Routes, Route } from "react-router-dom";

import Login from "../pages/login/login.jsx";
import Landing from "../pages/landing/Landing.jsx";

import Overview from "../pages/overview/overview.jsx";
import Vacancies from "../pages/vacancies/vacancies.jsx";
import VacancyCreate from "../pages/vacancies/VacancyCreate.jsx";
import VacancyDetail from "../pages/vacancies/VacancyDetail.jsx";
import Candidates from "../pages/candidates/candidates.jsx";
import Meetings from "../pages/meetings/meetings.jsx";

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
        <Route path="vacancies/:id" element={<VacancyDetail />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="meetings" element={<Meetings />} />
      </Route>
    </Routes>
  );
}

export default App_Router;