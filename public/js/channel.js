import { renderMessageHTML } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const channelMatch = window.location.href.match(/^.*\/channel\/(.*)$/);
  const channel = channelMatch[1];

  const messagesDivElement = document.getElementById("messages-div");

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "getMessages",
          channel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      messagesDivElement.innerHTML = "";

      data.messages.forEach((message) => {
        messagesDivElement.innerHTML += renderMessageHTML(message);
      });
    } catch (error) {
      console.log(`Error loading messages: ${error}`);
      alert(`Error loading messages: ${error}`);
    }
  };

  const showMetaButtonElement = document.getElementById("show-meta-button");

  showMetaButtonElement.addEventListener("click", () => {
    const metaWindowDivElement = document.getElementById("meta-window-div");

    if (!metaWindowDivElement.classList.contains("visible")) {
      metaWindowDivElement.classList.add("visible");
      showMetaButtonElement.classList.add("active");
    } else {
      metaWindowDivElement.classList.remove("visible");
      showMetaButtonElement.classList.remove("active");
    }
  });

  const sendButtonElement = document.getElementById("send-button");

  sendButtonElement.addEventListener("click", async () => {
    const senderElement = document.getElementById("sender-input");
    const contentElement = document.getElementById("content-input");
    const tripcodeElement = document.getElementById("tripcode-input");

    const sender = senderElement.value || "Anonymous";
    const content = contentElement.value;
    const tripcode = tripcodeElement.value;

    if (!content) {
      console.log("Error sending message: Content cannot be empty");
      alert("Error sending message: Content cannot be empty");
      return;
    }

    contentElement.value = "";

    const previewMessageDivElement = document.createElement("div");

    previewMessageDivElement.textContent = content;
    previewMessageDivElement.classList.add("preview", "dim");

    messagesDivElement.insertBefore(
      previewMessageDivElement,
      messagesDivElement.firstChild
    );

    try {
      const response = await fetch("/api/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "sendMessage",
          sender,
          tripcode,
          content,
          channel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      await loadMessages();
    } catch (error) {
      console.log(`Error sending message: ${error}`);
      alert(`Error sending message: ${error}`);
    }

    previewMessageDivElement.remove();
  });
});
