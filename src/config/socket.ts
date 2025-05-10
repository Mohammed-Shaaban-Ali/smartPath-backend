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
          // now the senderId i send the token and the id in the token => req.userId
          sender: data.senderId,
          content: data.content,
          image: imageUrl,
        });

        const populatedMessage = await message.populate("sender", "name");

        io.emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("❌ Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};
