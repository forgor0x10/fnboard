import { request } from "http";
import { renderMessageHTML } from "../public/js/utils.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

let domain;

if (process.env.VERCEL_ENV == "production") {
  domain = "https://fnboard.vercel.app";
} else if (process.env.VERCEL_URL) {
  domain = `https://${process.env.VERCEL_URL}`;
} else {
  domain = "http://localhost:3000";
}

export default async function handler(req, res) {
  const { page, channel } = req.query;

  try {
    let pageContent = await fs.readFile(
      path.join(dirname, "../public/templates", `${page}.html`),
      "utf-8"
    );

    if (page === "index") {
      const response = await fetch(`${domain}/api/database`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: "getMessageCount" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      pageContent = pageContent.replace("${messages}", data.messageCount);
    }

    if (page === "channel") {
      pageContent = pageContent.replace("${channelName}", channel);

      const response = await fetch(`${domain}/api/database`, {
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

      let messagesString = "";
      data.messages.forEach((message) => {
        messagesString += renderMessageHTML(message);
      });

      pageContent = pageContent.replace("${messages}", messagesString);
    }

    if (page === "log") {
      const response = await fetch(`${domain}/api/database`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: "getLog",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      pageContent = pageContent.replace("${logContent}", data.value);
    }

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(pageContent);
  } catch (error) {
    res.setHeader("Content-Type", "text/html");
    res.status(500).send(`500 Internal server error: ${error}`);
  }
}
