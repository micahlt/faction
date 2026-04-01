import s from "../styles/modules/UserPanel.module.css";
import UserAvatar from "./UserAvatar";
import { GearSixIcon } from "@phosphor-icons/react";

export default function UserPanel({ loggedInUser = {} }) {
    return <div className={s.userPanel}>
        <UserAvatar size="md" imageUrl={loggedInUser.imageUrl} />
        <div className={s.userInfo}>
            <h3>{loggedInUser.nickname}</h3>
            <p>@{loggedInUser.username}&ensp;&bull;&ensp;<span>online</span></p>
        </div>
        <GearSixIcon weight="duotone" size={24} className={s.settingsIcon} />
    </div>
}