const openai = require("./openai.js");
const express = require("express");
const router = express.Router();
const Input = require("./model/input.model.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Function for speech to text conversion
async function speechToText(audioBuffer, res) {
  try {
    // Store the audioBuffer temporarily and generate url
    const tempFilePath = `temp_${Date.now()}.mp3`;
    fs.writeFileSync(tempFilePath, audioBuffer);
    const fileUrl = `${tempFilePath}`;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(fileUrl),
      model: "whisper-1",
      max_tokens: 1,
      response_format: "text",
    });
    console.log("Speech to text done.");

    // Create a new document in MongoDB and save it
    const input = new Input({
      input_file: JSON.stringify(transcription, null, 2),
    });
    await input.save();
    console.log("Transcription saved to MongoDB");

    // Remove the temporary file
    await unlinkAsync(tempFilePath);

    const inputId = input._id; // Get the ID of the saved document
    res.send({ message: "Speech to text done", inputId: inputId }); // Send the ID back to the client
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Route for speech to text conversion
router.post("/getInput", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const audioBuffer = req.file.buffer;
    await speechToText(audioBuffer, res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
