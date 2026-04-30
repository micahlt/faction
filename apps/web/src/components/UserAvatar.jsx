import { useMemo } from "react";
import s from "../styles/modules/UserAvatar.module.css";
import classNames from "classnames";

const defaultAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="64" fill="#b9bbbe"/>
    <circle cx="64" cy="48" r="24" fill="#2f3136"/>
    <path d="M24 110c6-22 23-34 40-34s34 12 40 34" fill="#2f3136"/>
  </svg>
`)}`;

export default function UserAvatar({
  size = "md",
  imageUrl = "",
  isOnline = undefined,
  showActivityStatus = false,
}) {
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
    <img
      className={classNames(
        s.userAvatar,
        showActivityStatus && isOnline
          ? s.statusOnline
          : showActivityStatus && !isOnline
            ? s.statusOffline
            : ""
      )}
      src={imageUrl?.trim() ? imageUrl : defaultAvatar}
      style={{
        "--avatarSize": `${imageSize}px`,
      }}
      alt=" "
    />
  );
}