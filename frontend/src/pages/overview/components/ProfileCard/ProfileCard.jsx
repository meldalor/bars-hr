import "./ProfileCard.css";

import coverImage from "../../../../assets/overview/profile-cover.png";
import profileImage from "../../../../assets/overview/profile.svg";
import phoneIcon from "../../../../assets/overview/phone.svg";
import mailIcon from "../../../../assets/overview/plane.svg";
import placeIcon from "../../../../assets/overview/place.png";
import penIcon from "../../../../assets/overview/pen.svg";

function ProfileCard() {
    return (
        <section className="profile-card">
            <div
                className="profile-cover"
                style={{ backgroundImage: `url(${coverImage})` }}
            />

            <div className="profile-avatar">
                <img src={profileImage} alt="Профиль" />
            </div>

            <div className="profile-content">
                <div className="profile-top">
                    <div className="profile-main">
                        <h2>Алина Закиева</h2>
                        <p className="profile-position">
                            HR-менеджер
                        </p>
                    </div>

                    <button className="profile-edit-button">
                        <img src={penIcon} alt="" />
                        <span>Редактировать</span>
                    </button>
                </div>

                <div className="profile-contacts">
                    <div className="profile-contact">
                        <img src={phoneIcon} alt="" />
                        <span>8 (939) 343-32-23</span>
                    </div>

                    <div className="profile-contact">
                        <img src={mailIcon} alt="" />
                        <span>arina@yandex.ru</span>
                    </div>

                    <div className="profile-contact">
                        <img src={placeIcon} alt="" />
                        <span>Казань</span>
                    </div>
                </div>

                <p className="profile-date">
                    В системе с марта 2024
                </p>
            </div>
        </section>
    );
}

export default ProfileCard;