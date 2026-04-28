export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_room", ({ roomId }) => {
      if (!roomId) return;

      socket.join(roomId);
    });

    socket.on("typing", ({ roomId, username, topicId }) => {
      if (!roomId || !username || !topicId) return;

      socket.to(roomId).emit("user_typing", { username, topicId });
    });

    socket.on("stop_typing", ({ roomId, username, topicId }) => {
      if (!roomId || !username || !topicId) return;

      socket.to(roomId).emit("user_stop_typing", { username, topicId });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
