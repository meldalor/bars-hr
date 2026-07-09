import "./ProfileCard.css";

import profileImage from "../../../../assets/overview/profile.jpg";
import phoneIcon from "../../../../assets/overview/phone.svg";
import mailIcon from "../../../../assets/overview/plane.svg";
import placeIcon from "../../../../assets/overview/place.png";

function ProfileCard() {
    return (
        <section className="profile-card">
            <div className="profile-photo">
                <img src={profileImage} alt="Профиль" />
            </div>

            <div className="profile-content">
                <h2>Петрова Арина</h2>
                <p className="profile-position">
                    HR-менеджер
                </p>

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