import { useState } from "react";
import s from "../styles/modules/UserSettingsModal.module.css";
import FormInput from "./FormInput";

export default function UserSettingsModal({ user, onClose, onSuccess }) {
    const [nickname, setNickname] = useState(user.nickname || "");
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
                    nickname: nickname !== user.nickname ? nickname : undefined,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined, 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update settings");
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className={s.UserSettingsModal}>
            <h2>Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className={s.formGroup}>
                    <label>Nickname</label>
                    <FormInput
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter a nickname"
                    />
                </div>

                <div className={s.divider}>Change Password (optional)</div>

                <div className={s.formGroup}>
                    <label>Current Password</label>
                    <FormInput
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                    />
                </div>

                <div className={s.formGroup}>
                    <label>New Password</label>
                    <FormInput
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                </div>

                <div className={s.formGroup}>
                    <label>Confirm New Password</label>
                    <FormInput
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </div>

                {error && <div className={s.error}>{error}</div>}

                <div className={s.actions}>
                    <button type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}