import s from "../styles/modules/Modal.module.css";
import { XIcon } from "@phosphor-icons/react";

export default function Modal({ canCloseOnOverlay = true, onClose = () => {}, children }) {
  return (
    <div className={s.modalParent}>
      <div className={s.overlay} onClick={onClose} />
      <div className={s.content}>
        {children}
        {canCloseOnOverlay && (
          <button className={s.closeButton} onClick={onClose}>
            <XIcon size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
