// server.js
const http = require('http');
const socketIo = require('socket.io');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db.js');
const userRouter = require('./Routes/UserRouter.js');
const messageRouter = require('./Routes/MessageRouter.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server,
  { cors: { origin: '*' } },
);



let users = [];
io.on("connection", (socket) => {
  socket.on('setUserName', function (username) {
    let exists = false;

    users.forEach(user => {
      if (user.username == username) {
        user.userID = socket.id;
        exists = true;
      }
    });

    if (!exists) {
      users.push({
        userID: socket.id,
        username: username,
      });
    }

    console.log("users ", users);
  });

  socket.on("private-message", ({ content, to, timestamp }) => {
    let receiverId = "";

    users.forEach(user => {
      if (user.username == to) receiverId = user.userID;
    });

    socket.to(receiverId).emit("private-message", { content, timestamp });
  });

  // send the offer to the other user
  socket.on("offer", (offer, to) => {
    // console.log("offer", offer);
    // console.log("to", to);
    // Emit the offer to the specified recipient (to)
    const receiver = users.find((user) => user.username === to);
    // console.log({ receiver });
    if (receiver) {
      // console.log('revciever found in offer');
      socket.to(receiver.userID).emit("offer", offer, socket.id);
    }
  });

  // send the answer to the other user
  socket.on("answer", (answer, to) => {
    console.log("answer", answer);
    console.log("to", to);
    // Emit the answer to the specified recipient (to)
    const receiver = users.find((user) => user.username === to);
    console.log("reciever", receiver);
    if (receiver) {
      console.log("reciever found");

      socket.to(receiver.userID).emit("answer", answer, socket.id);
    }
  });

  socket.on("ice-candidate", (candidate, to) => {
    // Emit the ICE candidate to the specified recipient (to)
    const receiver = users.find((user) => user.username === to);
    if (receiver) {
      socket.to(receiver.userID).emit("ice-candidate", candidate, socket.id);
    }
  });

  socket.on('end-call', (to) => {
    const receiver = users.find((user) => user.username === to);
    console.log("end call", to);

    if (receiver) {
      console.log("end call", receiver);

      socket.to(receiver.userID).emit("end-call", socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED !!!");
    users = users.filter((user) => user.userID !== socket.id);
    console.log(users);
    socket.disconnect(true);
  });

});


dotenv.config();
app.use(cors());
app.use(express.json());
connectDB();

// main router
app.get('/', (req, res) => {
  res.send('API is running...');
});

// other router
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});