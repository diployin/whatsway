importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

self.addEventListener("install", () => {
  console.log("Service worker installed");
});

async function loadFirebaseConfig() {
  const res = await fetch("/api/firebase"); 
  return await res.json();
}

async function init() {
  const config = await loadFirebaseConfig();

  firebase.initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/logo.png",
    });
  });
}

init();
