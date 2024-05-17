const openai = require("./openai.js");
const express = require("express");
const router = express.Router();
const Output = require("./model/output.model.js");

//Function for text to speech conversion
async function textToSpeech(outputId, res) {
  try {
    // Retrieve the output based on the provided ID
    const output = await Output.findById(outputId);
    if (!output) {
      throw new Error("Output not found.");
    }

    // Generate speech from the text
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: output.output_file,
      format: "flac",
      max_tokens: 1,
    });
    console.log("Text to speech done.");

    // Send speech file directly as response
    res.set("Content-Type", "audio/flac");
    res.send(Buffer.from(await mp3.arrayBuffer()));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Route for text to speech conversion
router.post("/getOutput", async (req, res) => {
  try {
    const { outputId } = req.body; // Receive the output ID from the client

    await textToSpeech(outputId, res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
