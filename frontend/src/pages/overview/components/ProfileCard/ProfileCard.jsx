import "./ProfileCard.css";

function ProfileCard() {
    return (
        <section className="profile-card">
            <div className="profile-cover"></div>

            <div className="profile-avatar">А</div>

            <div className="profile-content">
                <div className="profile-top">
                    <div className="profile-main">
                        <h2>Алина Закиева</h2>
                        <p className="profile-position">HR-специалист</p>
                    </div>

                    <button className="profile-edit-button">
                        ✏️ Редактировать
                    </button>
                </div>

                <div className="profile-contacts">
                    <span>📞 +7 (999) 123-45-67</span>
                    <span>✉️ alina@barshr.ru</span>
                    <span>📍 Казань</span>
                </div>

                <p className="profile-date">
                    В системе с марта 2024
                </p>
            </div>
        </section>
    );
}

export default ProfileCard;