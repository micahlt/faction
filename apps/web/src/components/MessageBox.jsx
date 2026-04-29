import { useRef, useState, useEffect } from "react";
import s from "../styles/modules/MessageBox.module.css";
import { PlusIcon, PaperPlaneIcon } from "@phosphor-icons/react";
import { useSocket } from "./contexts/SocketContext";
import { useParams } from "@tanstack/react-router";
import shrinkImage from "../utils/shrinkImage";
import fileToBase64 from "../utils/fileToBase64";

export default function MessageBox({ loggedInUser = {} }) {
  const { factionId, topicId } = useParams({ strict: false });
  const [messageText, setMessageText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const socket = useSocket();
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = ({ topicId: typingTopicId, user }) => {
      if (typingTopicId !== topicId || !user?.id) return;

      setTypingUsers((users) => {
        if (users.some((existingUser) => existingUser.id === user.id)) {
          return users;
        }

        return [...users, user];
      });
    };

    const handleTypingStop = ({ topicId: typingTopicId, userId }) => {
      if (typingTopicId !== topicId || !userId) return;

      setTypingUsers((users) => users.filter((user) => user.id !== userId));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, topicId]);

  useEffect(() => {
    setTypingUsers([]);
  }, [topicId]);

  const stopTyping = () => {
    if (!socket || !factionId || !topicId || !isTyping.current) return;

    socket.emit("typing:stop", {
      factionId,
      topicId,
    });

    isTyping.current = false;
  };

  const addImages = (files = []) => {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (!images.length) return;

    setImageFiles((current) => [...current, ...images]);
  };

  const removeImage = (index) => {
    setImageFiles((current) => current.filter((_, i) => i !== index));

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  const uploadImage = async (file) => {
    const smallerFile = file.size > 5 * 1024 * 1024 ? await shrinkImage(file) : file;

    const image = await fileToBase64(smallerFile);

    const res = await fetch("/api/assets/upload/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (!socket || !factionId || !topicId || !loggedInUser?.id) return;

    if (!isTyping.current) {
      socket.emit("typing:start", {
        factionId,
        topicId,
      });

      isTyping.current = true;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(stopTyping, 1500);
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && !imageFiles.length) || !socket || isSending) {
      return;
    }

    setIsSending(true);

    try {
      if (messageText.trim()) {
        socket.emit("message:send", {
          content: messageText.trim(),
          factionId,
          topicId,
        });
      }

      for (const file of imageFiles) {
        const imageUrl = await uploadImage(file);

        socket.emit("message:send", {
          content: imageUrl,
          factionId,
          topicId,
        });
      }

      stopTyping();
      setMessageText("");
      setImageFiles([]);

      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const keyUpHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const typingText = getTypingText(typingUsers);

  return (
    <div
      className={`${s.messageBox} ${isDragging ? s.dragging : ""} ${typingText ? s.isTyping : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        addImages(e.dataTransfer.files);
      }}
    >
      {typingText && <div className={s.typingIndicator}>{typingText}</div>}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className={s.fileInput}
        onChange={(e) => addImages(e.target.files)}
      />

      <button
        type="button"
        className={s.imageButton}
        onClick={() => fileInput.current?.click()}
        title="Attach image"
      >
        <PlusIcon weight="bold" size={22} />
      </button>

      <div className={s.inputArea}>
        {!!imageFiles.length && (
          <div className={s.previewList}>
            {imageFiles.map((file, index) => (
              <div className={s.preview} key={`${file.name}-${index}`}>
                <img src={URL.createObjectURL(file)} alt="preview" className={s.previewImage} />

                <div className={s.previewInfo}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeImage(index)}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={messageText}
          onChange={handleChange}
          onKeyDown={keyUpHandler}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData.files).filter((file) =>
              file.type.startsWith("image/")
            );

            if (!files.length) return;

            e.preventDefault();
            addImages(files);
          }}
          disabled={isSending}
          placeholder={isSending ? "Uploading..." : "Type a message..."}
        />
      </div>

      <PaperPlaneIcon weight="duotone" size={28} className={s.sendIcon} onClick={sendMessage} />

      {isDragging && <div className={s.dragOverlay}>Drop images here</div>}
    </div>
  );
}

function getTypingText(users) {
  const names = users.map((user) => user.nickname || user.username);

  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;

  return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
}
