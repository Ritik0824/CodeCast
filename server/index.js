const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const { executeCpp } = require("./executeCpp");

const { generateFile } = require("./generateFile");

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome');
});

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

app.post("/compile", async (req, res) => {
  const { language = "cpp", code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  try {
    const filePath = await generateFile(language, code);
    let output;

    if (language === "cpp") {
      output = await executeCpp(filePath);
    } else if (language === "py") {
      output = await executePy(filePath);
    } else {
      return res.status(400).json({ success: false, error: "Unsupported language!" });
    }

    res.json({ output });
  } catch (err) {
    console.error("Compilation or execution error:", err); // Log error for debugging
    res.status(500).json({ error: err.message || err });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));