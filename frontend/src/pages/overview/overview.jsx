import "./overview.css";

import StatisticsCards from "./components/StatisticsCards/StatisticsCards";
import ProfileCard from "./components/ProfileCard/ProfileCard";
import InterviewsCard from "./components/InterviewsCard/InterviewsCard";
import ActivityTable from "./components/ActivityTable/ActivityTable";

function Overview() {
    return (
        <main className="overview">
            <StatisticsCards />

            <section className="overview-content">
                <div className="overview-left">
                    <ProfileCard />
                    <ActivityTable />
                </div>

                <div className="overview-right">
                    <InterviewsCard />
                </div>
            </section>
        </main>
    );
}

export default Overview;