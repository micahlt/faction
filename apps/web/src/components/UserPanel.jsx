import { useState } from "react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query"
import s from "../styles/modules/UserPanel.module.css";
import UserAvatar from "./UserAvatar";
import Modal from "./Modal";
import UserSettingsModal from "./UserSettingsModal";
import { GearSixIcon, SignOutIcon } from "@phosphor-icons/react";

export default function UserPanel({ loggedInUser = {} }) {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    setShowSettings(false);
  };
  
  return (
    <div className={s.userPanel}>
      <UserAvatar size="md" imageUrl={loggedInUser.imageUrl} />
      <div className={s.userInfo}>
        <h3>{loggedInUser.nickname}</h3>
        <p>
          @{loggedInUser.username}&ensp;&bull;&ensp;<span>online</span>
        </p>
      </div>
      <SignOutIcon
        weight="duotone"
        size={24}
        className={s.logOutIcon}
        onClick={() => {
          fetch(`/api/auth/logout`, {
            method: "DELETE",
          }).finally(() => {
            nav({
              to: "/",
            });
          });
        }}
      />
      <GearSixIcon weight="duotone" size={24} className={s.settingsIcon} onClick={() => setShowSettings(true)} />
      
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)}>
          <UserSettingsModal
            user={loggedInUser}
            onClose={() => setShowSettings(false)}
            onSuccess={handleSettingsSuccess}
            />
        </Modal>
      )}        
    </div>
  );
}
