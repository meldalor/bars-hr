import "./ProfileCard.css";

import { getSession } from "../../../../auth/session.js";
import profileImage from "../../../../assets/overview/profile.jpg";

const ROLE_LABELS = {
    Admin: "Администратор",
    HR: "HR-менеджер",
    DecisionMaker: "Руководитель направления",
};

function ProfileCard() {
    const session = getSession();
    const fullName = session?.fullName ?? "Пользователь";
    const roleLabel = ROLE_LABELS[session?.role] ?? session?.role ?? "";

    return (
        <section className="profile-card">
            <div className="profile-photo">
                <img src={profileImage} alt="Профиль" />
            </div>

            <div className="profile-content">
                <h2>{fullName}</h2>
                <p className="profile-position">{roleLabel}</p>

                <p className="profile-date">Вы вошли в систему БАРС Груп</p>
            </div>
        </section>
    );
}

export default ProfileCard;
