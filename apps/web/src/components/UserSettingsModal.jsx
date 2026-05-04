import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import s from "../styles/modules/UserSettingsModal.module.css";

export default function UserSettingsModal({ user, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Current password is required to change password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.length > 0 ? nickname : user.nickname,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }
      // Invalidate all queries to refresh user data everywhere
      queryClient.invalidateQueries({ queryKey: ["factionUsers"] });
      queryClient.invalidateQueries({ queryKey: ["factions"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.settingsModal}>
      <h2>Settings</h2>
      <div className={s.divider}></div>
      <form onSubmit={handleSubmit}>
        <div className={s.formColumn}>
          <h3>Change Nickname</h3>
          <div className={s.formGroup}>
            <label>Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={user.nickname}
            />
          </div>
        </div>
        <div className={s.formColumn}>
          <h3>Change Password (optional)</h3>

          <div className={s.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className={s.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div className={s.formGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {error && <div className={s.error}>{error}</div>}
        </div>

        <div className={s.actions}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
