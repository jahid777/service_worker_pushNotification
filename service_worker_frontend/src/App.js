import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";

function App() {
  //initial the service worker file into app.js and in the public folder make a service worker file
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  // Handle push notificaion
  const handlePushNotificaion = async () => {
    // Send order to the server

    // Request permission for push notifications
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BHI-d6o1XN0qzUKkqIYbUO1-VOw7DvrNPevHjr2UV9be7GZRZeeBPDikXJq8GH14a0rn2gFsv3XNQmpjQPRjMmc",
      });
      // Get the push subscription
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const keys = subscription.toJSON().keys;
        const authKey = keys.auth;
        const p256dhKey = keys.p256dh;
        const endpoint = subscription.endpoint;

        console.log(authKey);
        console.log(p256dhKey);
        console.log(endpoint);

        // Send a push notification request to the server
        await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/sendPushNotification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              authKey: authKey,
              p256dhKey: p256dhKey,
              endpoint: endpoint,
            }),
          }
        );
      } else {
        console.error("Push subscription not found.");
      }
    }
  };

  return (
    <div className="App">
      <button onClick={() => handleOrderSubmit()}>click</button>
       <h1>authKey: {authKey} </h1>
  <h1>p256dhKey: {p256dhKey} </h1>
  <h1>endpoint: {endpoint} </h1>
    
        
    </div>
  );
}

export default App;
