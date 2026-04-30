import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import s from "../styles/modules/UserPanel.module.css";
import UserAvatar from "./UserAvatar";
import { GearSixIcon, SignOutIcon } from "@phosphor-icons/react";
import fileToBase64 from "../utils/fileToBase64";
import shrinkImage from "../utils/shrinkImage";

export default function UserPanel({ loggedInUser = {} }) {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfileImage = async (file) => {
    const smallerFile = file.size > 5 * 1024 * 1024 ? await shrinkImage(file) : file;
    const image = await fileToBase64(smallerFile);

    const uploadRes = await fetch("/api/assets/upload/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    if (!uploadRes.ok) {
      throw new Error("Profile image upload failed");
    }

    const data = await uploadRes.json();

    const saveRes = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: data.url }),
    });

    if (!saveRes.ok) {
      throw new Error("Profile image update failed");
    }

    const updatedUser = await saveRes.json();

    queryClient.setQueryData(["currentUser"], updatedUser);
    queryClient.invalidateQueries({ queryKey: ["factionUsers"] });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    try {
      await uploadProfileImage(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    }
  };

  return (
    <div className={s.userPanel}>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className={s.fileInput}
        onChange={handleImageChange}
      />

      <button
        type="button"
        className={s.avatarButton}
        onClick={() => fileInput.current?.click()}
        disabled={isUploading}
        title="Change profile picture"
      >
        <UserAvatar size="md" imageUrl={loggedInUser.imageUrl} />
      </button>

      <div className={s.userInfo}>
        <h3>{loggedInUser.nickname}</h3>
        <p>
          @{loggedInUser.username}&ensp;&bull;&ensp;
          <span>{isUploading ? "uploading..." : "online"}</span>
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

      <GearSixIcon weight="duotone" size={24} className={s.settingsIcon} />
    </div>
  );
}