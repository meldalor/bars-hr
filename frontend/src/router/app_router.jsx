import { Routes, Route } from "react-router-dom";

import Login from "../pages/login/login.jsx";
import Overview from "../pages/overview/overview.jsx";
import Vacancies from "../pages/vacancies/vacancies.jsx";
import Candidates from "../pages/candidates/candidates.jsx";
import Meetings from "../pages/meetings/meetings.jsx";

import Layout from "../components/layout/layout";

function App_Router() {
  return (
    <Routes>
      
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="vacancies" element={<Vacancies />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="meetings" element={<Meetings />} />
      </Route>

    </Routes>
  );
}

export default App_Router;