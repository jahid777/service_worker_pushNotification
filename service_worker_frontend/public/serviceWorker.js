/* eslint-disable no-restricted-globals */

self.addEventListener("push", (e) => {
  const options = {
    body: e.data.text(),
    icon: "", // Replace with your icon path
  };

  e.waitUntil(
    self.registration.showNotification("New Order Received", options)
  );
});

/* eslint-enable no-restricted-globals */
