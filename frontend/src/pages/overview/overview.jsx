import "./overview.css";

import StatisticsCards from "./components/StatisticsCards/StatisticsCards";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import InterviewsCard from "./components/InterviewsCard/InterviewsCard";
import ActivityTable from "./components/ActivityTable/ActivityTable";

function Overview() {
    return (
        <main className="overview-page">
            <h1 className="overview-title">Обзор:<span className="overview-title-count"> HR-панель</span></h1>

            <section className="overview-top">
                <ProfileCard />
                <InterviewsCard />
            </section>

            <StatisticsCards />

            {/* на обзоре — только действия текущего пользователя */}
            <ActivityTable mine />
        </main>
    );
}

export default Overview;