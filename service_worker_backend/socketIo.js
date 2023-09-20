const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const http = require("http");
const socketIo = require("socket.io");

// connecting link
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg9bhlx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your React app's actual origin
    methods: ["GET", "POST"],
  },
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
});

client.connect((err) => {
  const orderCollection = client
    .db("demoDatabase")
    .collection("demoCollection");

  //data adding
  app.post("/addFood", async (req, res) => {
    const food = req.body;
    const info = await orderCollection.insertOne(food).then((result) => {
      // Emit a socket event when the data is added successfully
      io.emit("foodAdded", food);
      res.send(result);
    });
  });

  app.get("/getOrders", (req, res) => {
    orderCollection?.find({}).toArray((err, documents) => {
      if (err) {
        console.error("Error retrieving orders:", err);
        res.status(500).send("Error retrieving orders");
      } else {
        res.send(documents);
      }
    });
  });

  //end of connection for collection
});

// This is for testing hello world
app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () =>
  console.log(`Connected to the database server on port ${port}`)
);
