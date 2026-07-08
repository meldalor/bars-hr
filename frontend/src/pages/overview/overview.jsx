import "./overview.css";

import StatisticsCards from "./components/StatisticsCards/StatisticsCards";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import InterviewsCard from "./components/InterviewsCard/InterviewsCard";
import ActivityTable from "./components/ActivityTable/ActivityTable";

function Overview() {
    return (
        <main className="overview-page">
            <h1 className="overview-title">Обзор</h1>

            <StatisticsCards />

            <section className="overview-top">
                <ProfileCard />
                <InterviewsCard />
            </section>

            <ActivityTable />
        </main>
    );
}

export default Overview;