import { Server } from "socket.io";
import http from "http";
import Message from "../models/Message";
import cloudinary from "./cloudinary";

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("sendMessage", async (data) => {
      try {
        let imageUrl = null;

        if (data.imageBase64) {
          const result = await cloudinary.uploader.upload(data.imageBase64, {
            folder: "messages",
            resource_type: "image",
          });
          imageUrl = result.secure_url;
        }

        const message = await Message.create({
          sender: data.senderId,
          group: data.groupId, // 👈 هنا بنبعت الجروب
          content: data.content,
          image: imageUrl,
        });

        const populatedMessage = await message.populate(
          "sender",
          "name avatar"
        );

        // بدل ما نبعت للكل، نبعته بس للجروب دا
        io.to(data.groupId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("❌ Error saving message:", error);
      }
    });

    // Joining a group room
    socket.on("joinGroup", (groupId) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};
