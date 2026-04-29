import { useMemo } from "react";
import s from "../styles/modules/UserAvatar.module.css";
import classNames from "classnames";

export default function UserAvatar({ size = "md", imageUrl = "", isOnline = undefined, showActivityStatus = false }) {
  const imageSize = useMemo(() => {
    switch (size) {
      case "xs":
        return 16;
      case "sm":
        return 24;
      case "md":
        return 32;
      case "lg":
        return 64;
      case "xl":
        return 128;
      default:
        return size;
    }
  }, [size]);

  return (
    <img className={classNames(s.userAvatar, showActivityStatus && isOnline ? s.statusOnline : showActivityStatus && !isOnline ? s.statusOffline : "")} src={imageUrl} style={{
      "--avatarSize": `${imageSize}px`
    }} alt=" " />
  );
}
