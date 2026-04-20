import { useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/UserPanel.module.css";
import UserAvatar from "./UserAvatar";
import { GearSixIcon, SignOutIcon } from "@phosphor-icons/react";

export default function UserPanel({ loggedInUser = {} }) {
    const nav = useNavigate();
    return <div className={s.userPanel}>
        <UserAvatar size="md" imageUrl={loggedInUser.imageUrl} />
        <div className={s.userInfo}>
            <h3>{loggedInUser.nickname}</h3>
            <p>@{loggedInUser.username}&ensp;&bull;&ensp;<span>online</span></p>
        </div>
        <SignOutIcon weight="duotone" size={24} className={s.logOutIcon} onClick={() => {
            fetch(`/api/auth/logout`, {
                method: "DELETE",
            }).finally(() => {
                nav({
                    to: "/"
                });
            })
        }} />
        <GearSixIcon weight="duotone" size={24} className={s.settingsIcon} />
    </div>
}