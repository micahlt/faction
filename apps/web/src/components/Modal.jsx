import s from "../styles/modules/Modal.module.css";

export default function Modal({ canCloseOnOverlay = true, onClose = () => { }, children }) {
    return <div className={s.modalParent}>
        <div className={s.overlay} onClick={onClose} />
        <div className={s.content}>
            {children}
        </div>
    </div>
}