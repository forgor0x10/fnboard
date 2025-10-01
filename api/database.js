import { MongoClient } from "mongodb";

let client;

export default async function handler(req, res) {
  const { request, content, sender, channel, tripcode } = req.body;

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
      await client.connect();
    }

    const database = client.db("data");
    const messages = database.collection("messages");
    const dynamicContent = database.collection("dynamic_content");

    if (request == "getMessageCount") {
      const count = await messages.countDocuments();
      return res.status(200).json({ messageCount: count });
    }

    if (request == "getMessages") {
      const results = await messages
        .find({ channel })
        .sort({ timestamp: -1 })
        .toArray();
      return res.status(200).json({ messages: results });
    }

    if (request == "sendMessage") {
      let hashHex = "";

      if (tripcode) {
        const tripcodeBuffer = new TextEncoder().encode(tripcode);
        const hashBuffer = await crypto.subtle.digest(
          "SHA-256",
          tripcodeBuffer
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .substring(0, 8);
      }

      await messages.insertOne({
        content,
        sender,
        tripcode: hashHex,
        channel,
        timestamp: new Date(),
      });

      return res.status(200).json({ success: true });
    }

    if (request == "getLog") {
      const result = await dynamicContent.findOne({ name: "log" });
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "400 Bad request" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `500 Internal server error: ${error.message}` });
  }
}
