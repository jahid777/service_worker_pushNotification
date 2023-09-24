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
  app.post("/sendPushNotification", async (req, res) => {
  const { title, body } = req.body; // Extract notification content
  const devices = await getDevicesToSendNotification(); // Fetch the list of devices from your database or config

  // Send notifications to selected devices
  Promise.all(
    devices.map(async (device) => {
      try {
        await sendNotificationToDevice(device, "Please Check the Dishco Order");
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

//device where i want to send the notification
const EndPointJahid =
  "https://fcm.googleapis.com/fcm/send/chaebcfYUy0:APA91bEZvIIg1b1u5u61Fw7v1l8Qa1p5GzMnXu4F0Gmmjd5X8uYBQZBiPBzZr_wAeGX89YYfoWq_UZQykBNyC_v2VxX7-mv0T0FTwB5UOz5q9S4bKGc0LcZPky-qEB5Nr5x6k79O2kM1";
const authKeyJahid = "v3HmOqoVy8ST8Z-Zxe94MQ";
const p256dhKeyJhaid =
  "BEkdf4JbaIYuVeqj8R8PK2IFVBfbvkl-_G2IbdEOsMpNpTwBJ-97ErwfONSOo2Mr2TyCtFW-dp67j3E60Lq7pGg";

// Function to fetch devices from your database or config
async function getDevicesToSendNotification() {
  // Query your database or read from a configuration file to get the list of devices
  // Example: return an array of devices with { endpoint, authKey, p256dhKey }
  const devices = [
    {
      endpoint: EndPointJahid,
      authKey: authKeyJahid,
      p256dhKey: p256dhKeyJhaid,
    },
    {
      endpoint: EndPointJahid,
      authKey: authKeyJahid,
      p256dhKey: p256dhKeyJhaid,
    },
    // Add more devices as needed
  ];
  return devices;
}

// Function to send a notification to a specific device
async function sendNotificationToDevice(device, title, body) {
  try {
    // Use the Web Push API to send the notification
    await webpush.sendNotification(
      {
        endpoint: device.endpoint,
        keys: {
          auth: device.authKey,
          p256dh: device.p256dhKey,
        },
      },
      JSON.stringify({ title, body })
    );
  } catch (error) {
    throw error;
  }
}

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
