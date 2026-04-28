import { useRef, useState } from "react";
import s from "../styles/modules/MessageBox.module.css";
import { Plus, PaperPlaneIcon } from "@phosphor-icons/react";
import { useSocket } from "./contexts/SocketContext";
import { useParams } from "@tanstack/react-router";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result || "";
      resolve(result.toString().split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const shrinkImage = (file, maxWidth = 1600, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Image compression failed"));

          resolve(
            new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = reject;
    img.src = url;
  });

export default function MessageBox({ loggedInUser = {} }) {
  const { factionId, topicId } = useParams({ strict: false });
  const [messageText, setMessageText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const socket = useSocket();
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);
  const fileInput = useRef(null);

  const stopTyping = () => {
    if (!socket || !factionId || !topicId || !isTyping.current) return;

    socket.emit("typing:stop", {
      factionId,
      topicId,
    });

    isTyping.current = false;
  };

  const addImages = (files = []) => {
    const images = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

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
    const smallerFile =
      file.size > 5 * 1024 * 1024 ? await shrinkImage(file) : file;

    const image = await fileToBase64(smallerFile);

    const res = await fetch("/api/upload/image", {
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

  return (
    <div
      className={`${s.messageBox} ${isDragging ? s.dragging : ""}`}
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
        <Plus weight="bold" size={22} />
      </button>

      <div className={s.inputArea}>
        {!!imageFiles.length && (
          <div className={s.previewList}>
            {imageFiles.map((file, index) => (
              <div className={s.preview} key={`${file.name}-${index}`}>
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className={s.previewImage}
                />

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
          placeholder={isSending ? "Uploading..." : ""}
        />
      </div>

      <PaperPlaneIcon
        weight="duotone"
        size={28}
        className={s.sendIcon}
        onClick={sendMessage}
      />

      {isDragging && <div className={s.dragOverlay}>Drop images here</div>}
    </div>
  );
}