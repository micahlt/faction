import { useMemo } from "react"
import s from "../styles/modules/UserAvatar.module.css";

export default function UserAvatar({ size = "md", imageUrl = "" }) {
    const imageSize = useMemo(() => {
        switch (size) {
            case "xs":
                return 16
            case "sm":
                return 24
            case "md":
                return 32
            case "lg":
                return 64
            case "xl":
                return 128
            default:
                return size
        }
    }, [size])

    return <img className={s.userAvatar} src={imageUrl} height={imageSize} width={imageSize} alt=""></img>
}