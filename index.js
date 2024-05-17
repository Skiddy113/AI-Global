const mongoose = require("mongoose");
const express = require("express");
const app = express();
const speech_to_text = require("./speech_to_text.js");
const chat_completion = require("./chat_completion.js");
const text_to_speech = require("./text_to_speech.js");
const deletedb = require("./deletedb.js");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/speech_to_text", speech_to_text);
app.use("/chat_completion", chat_completion);
app.use("/text_to_speech", text_to_speech);
app.use("/deletedb", deletedb);

// Connecting with MongoDB
mongoose
  .connect(
    "mongodb+srv://admin:nodeAPI1@backend.ybcklkj.mongodb.net/AI?retryWrites=true&w=majority&appName=Backend"
  )
  .then(() => {
    console.log("Connected to DB");
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Running on port ${port}...`));
  })
  .catch((error) => {
    console.error("Connection Failed", error);
  });
