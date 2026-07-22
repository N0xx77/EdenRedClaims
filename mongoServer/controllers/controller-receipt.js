const Receipt = require('../models/Receipt');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const amountReceiptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    totalAmount: {
      type: SchemaType.NUMBER,
      description: 'The total amount listed on the receipt'
    },
    isReceipt: {
      type: SchemaType.BOOLEAN,
      description: 'Indicates if the image is a receipt or not'
    }
  },
  required: ['totalAmount', 'isReceipt']
}

const amountReceiptGemini = async (req, res) => {
  try {
    const { imageBuffer } = req.body;

    if (!imageBuffer) {
      return res.status(400).json({
        success: false,
        message: "Missing imageBuffer."
      });
    }

    const cleanBase64 = imageBuffer.replace(/^data:image\/\w+;base64,/, "");

    const mimeMatch = imageBuffer.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: amountReceiptSchema
      }
    });

    const result = await model.generateContent([
      { text: 'Analyze if this is actually a receipt image and extract the total final amount paid.' },
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      }
    ]);

    const structuredData = JSON.parse(result.response.text());

    return res.status(200).json({
      success: true,
      totalAmount: structuredData.totalAmount || 0.0,
      isReceipt: structuredData.isReceipt || false
    });

  } catch (error) {
    console.error("Error in amountReceipt extraction controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during receipt amount extraction.",
      error: error.message
    });
  }
}

const amountReceipt = async (req, res) => {
  try {
    const { imageBuffer } = req.body;

    if (!imageBuffer) {
      return res.status(400).json({
        success: false,
        message: "Missing imageBuffer."
      });
    }

    const cleanBase64 = imageBuffer.replace(/^data:image\/\w+;base64,/, "");

    const url = 'http://127.0.0.1:11434/api/chat';

    const payload = {
      model: 'qwen2.5vl',
      messages: [
        {
          role: 'user',
          content: 'Analyze if this is actually a receipt image and extract the total final amount paid.',
          images: [cleanBase64]
        }
      ],
      format: {
        type: 'object',
        properties: {
          totalAmount: {
            type: 'number',
            description: 'The total amount listed on the receipt'
          },
          isReceipt: {
            type: 'boolean',
            description: 'Indicates if the image is a valid receipt'
          }
        },
        required: ['totalAmount', 'isReceipt']
      },
      options: {
        temperature: 0.0
      },
      stream: false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP Server Error! Status: ${response.status}`);
    }

    const result = await response.json();

    const structuredData = JSON.parse(result.message.content);
    return res.status(200).json({
      success: true,
      totalAmount: structuredData.totalAmount || 0.0,
      isReceipt: structuredData.isReceipt || false
    });

  } catch (error) {
    console.error("Error in amountReceipt extraction controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during receipt amount extraction.",
      error: error.message
    });
  }
};


const createReceipt = async (req, res) => {
  try {
    const { imageBuffer, claim_id } = req.body;

    if (!imageBuffer || !claim_id) {
      return res.status(400).json({
        success: false,
        message: "Missing imageBuffer or claim_id payload."
      });
    }

    const newReceipt = new Receipt({
      imageBuffer,
      claim_id: Number(claim_id)
    });

    await newReceipt.save();

    return res.status(200).json({
      success: true,
      message: "Receipt attached to claim successfully!",
      receipt: newReceipt
    });

  } catch (error) {
    console.error("Receipt Save Error:", error);
    return res.status(500).json({ success: false, message: "Server error saving receipt..." });
  }
};

const getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Receipt.findOne({ claim_id: Number(id) });

    if (!response) {
      return res.status(404).json({ success: false, msg: 'Receipt not found' });
    }

    return res.status(200).json({ success: true, data: response });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error to fetch..." })
  }
}
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({});

    if (receipts.length === 0) {
      return res.status(404).json({ success: false, msg: 'No receipts found' });
    }

    return res.status(200).json({ success: true, data: receipts });
  }
  catch (err) {
    console.error(err);

    return res.status(500).json({ success: false, msg: "Server Error to fetch..." });
  }
}

const deleteReceipt = async (req, res) => {
  try {
    const { claim_id } = req.body;
    const response = await Receipt.findOneAndDelete(
      { claim_id: Number(claim_id) },
    );

    if (!response) {
      return res.status(404).json({ success: false, msg: 'Receipt not found' });
    }

    return res.status(200).json({ success: true, data: response });

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server Error to delete receipt...' })
  }
}

const updateReceipt = async (req, res) => {
  try {
    const { claim_id, imageBuffer } = req.body;

    const response = await Receipt.findOneAndUpdate(
      { claim_id: Number(claim_id) },
      { $set: { imageBuffer } },
      { new: true }
    );

    if (!response) {
      return res.status(404).json({ success: false, msg: 'Receipt not found' });
    }

    return res.status(200).json({ success: true, data: response });

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server Error to update receipt...' })
  }
}

module.exports = { createReceipt, getReceipt, updateReceipt, deleteReceipt, getAllReceipts, amountReceipt, amountReceiptGemini };