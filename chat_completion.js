const openai = require("./openai.js");
const express = require("express");
const router = express.Router();
const Input = require("./model/input.model.js");
const Output = require("./model/output.model.js");

// Function to handle chat completion
async function chat_completion(inputId) {
  try {
    const input = await Input.findById(inputId);
    if (!input) {
      throw new Error("Input not found.");
    }

    // Call OpenAI API to get response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: input.input_file }],
      max_tokens: 25,
    });

    // Extract response content
    const output = response.choices[0].message.content;
    console.log(output);
    console.log("Chat generation done.");

    // Store the output in MongoDB
    const newOutput = new Output({
      output_file: output,
    });
    await newOutput.save();
    console.log("Transcription saved to MongoDB");

    
    return newOutput._id; // Return the ID of the saved document
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

//Route for AI text generation
router.post("/getResponse", async (req, res) => {
  try {
    const { inputId } = req.body; // Receive the input ID from the client

    // Call chat_completion function to handle chat completion
    const outputId = await chat_completion(inputId);

    res.send({ message: "Chat generation done", outputId: outputId }); // Send the ID back to the client
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
