const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const webpush = require("web-push");

//for install web-push & generating the keys
// npm install -g web-push
// web-push generate-vapid-keys

// Configure web-push with your VAPID keys
const vapidKeys = {
  publicKey:
    "BHI-d6o1XN0qzUKkqIYbUO1-VOw7DvrNPevHjr2UV9be7GZRZeeBPDikXJq8GH14a0rn2gFsv3XNQmpjQPRjMmc",
  privateKey: "nNM-zHjCrFktQ7Kyq_bbEzjhdwoQdodv_jGC7aKCLuY",
};

webpush.setVapidDetails(
  "mailto:brand.shokhbari@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// connecting link
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg9bhlx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const orderCollection = client
    .db("demoDatabase")
    .collection("demoCollection");

  // //data adding
  // app.post("/addOrder", async (req, res) => {
  //   const order = req.body;
  //   const info = await orderCollection.insertOne(order).then((result) => {
  //     res.send(result);
  //   });
  // });

  //this is for the single targeting device
  // Route to send push notifications
  app.post("/singleSendPushNotification", (req, res) => {
    const { title, body, endpoint, authKey, p256dhKey } = req.body;

    console.log(req.body);

    const pushSubscription = {
      endpoint,
      keys: {
        auth: authKey,
        p256dh: p256dhKey,
      },
    };

    webpush
      .sendNotification(pushSubscription, JSON.stringify({ title, body }))
      .then(() => res.sendStatus(200))
      .catch((error) => {
        console.error("Error sending push notification:", error);
        res.sendStatus(500);
      });
  });

  //this is for the multiple targeting device and i can use my hard key, endpint
  app.post("/sendPushNotification", (req, res) => {
    const { title, body, endpoint, authKey, p256dhKey } = req.body;

    // Create an array of push subscriptions (endpoints and keys)
    const pushSubscriptions = [
      {
        endpoint: endpoint,
        keys: {
          auth: authKey,
          p256dh: p256dhKey,
        },
      },
      {
        endpoint: endpoint,
        keys: {
          auth: authKey,
          p256dh: p256dhKey,
        },
      },
      // Add more subscriptions as needed
    ];

    // Send the same push notification to all subscriptions
    Promise.all(
      pushSubscriptions.map(async (subscription) => {
        try {
          return await webpush.sendNotification(
            subscription,
            JSON.stringify("jahid")
          );
        } catch (error) {
          console.error("Error sending push notification:", error);
          return error;
        }
      })
    )
      .then(() => res.sendStatus(200))
      .catch((error) => {
        console.error("Error sending push notifications:", error);
        res.sendStatus(500);
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

// app.listen(port);
app.listen(port, () => console.log(`connected database server${port}`));
