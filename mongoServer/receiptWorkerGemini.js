const sequelize = require('./config/postgres');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Receipt = require('./models/Receipt');
const Claims = require('./models/Claims');
const User = require('./models/User');
const { getMonthDifference } = require('./utils/dateUtils');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const STATUS_PENDING = 1; 
const STATUS_APPROVED = 2; 
const STATUS_REJECTED = 3; 
const STATUS_PARTIAL_APPROVED = 4; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const receiptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    totalAmount: { type: SchemaType.NUMBER },
    date: {
      type: SchemaType.STRING,
      description: 'YYYY-MM-DD format or empty string if not found'
    },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER }
        },
        required: ['name', 'price']
      }
    }
  },
  required: ['totalAmount', 'date', 'items']
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processReceiptWithGemini = async (base64Image, retries = 2) => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: receiptSchema
      }
    });

    const result = await model.generateContent([
      { text: 'Analyze this receipt image and extract the total amount, date, and individual items.' },
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      }
    ]);

    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (error) {
    const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));

    if (isRateLimit && retries > 0) {
      console.log(`Rate limited by Gemini. Retrying in 5s... (${retries} retries left)`);
      await sleep(5000);
      return processReceiptWithGemini(base64Image, retries - 1);
    }

    console.error("extraction failed:", error.message || error);
    throw error;
  }
};

let isProcessing = false;

const runBatchProcessing = async () => {
  if (isProcessing) {
    console.log(`\n[${new Date().toLocaleTimeString()}] Skipping cycle.`);
    return;
  }

  isProcessing = true;
  console.log(`\n[${new Date().toLocaleTimeString()}] Cron Triggered...`);

  try {
    const pendingClaims = await Claims.findAll({
      where: { status_id: STATUS_PENDING },
      attributes: ['id', 'claim_amount', 'submission_date', 'user_id']
    });

    if (pendingClaims.length === 0) {
      console.log('No pending claims found in PostgreSQL.');
      isProcessing = false;
      return;
    }

    const pendingClaimIds = pendingClaims.map(claim => claim.id);

    const unprocessedReceipts = await Receipt.find({
      claim_id: { $in: pendingClaimIds }, 
      $or: [
        { items: { $exists: true, $size: 0 } },
        { totalAmount: 0 }
      ],
      imageBuffer: { $exists: true, $ne: "" }
    });

    if (unprocessedReceipts.length === 0) {
      console.log('No unprocessed MongoDB receipts found matching pending claims.');
      isProcessing = false;
      return;
    }

    console.log(`Found ${unprocessedReceipts.length} receipt(s) eligible for processing.`);

    const claimsMap = new Map(pendingClaims.map(c => [c.id, c]));

    for (const receipt of unprocessedReceipts) {
      try {
        const pgClaim = claimsMap.get(receipt.claim_id);
        if (!pgClaim) {
          console.log(`Claim ID ${receipt.claim_id} mismatch error.`);
          continue;
        }

        console.log(`\nQuerying Gemini for Claim ID: ${receipt.claim_id}...`);
        const structuredData = await processReceiptWithGemini(receipt.imageBuffer);

        receipt.totalAmount = structuredData.totalAmount || 0.0;
        let isDateInvalid = false;

        if (structuredData.date && !isNaN(Date.parse(structuredData.date))) {
          receipt.date = new Date(structuredData.date);
        } else {
          receipt.date = null; 
          isDateInvalid = true;
          console.log(` Invalid date string for Claim ${receipt.claim_id}. Rejected.`);
        }
        
        receipt.items = structuredData.items || [];
        await receipt.save();
        console.log(`Receipt data saved to MongoDB.`);

        
        if (isDateInvalid) {
          pgClaim.status_id = STATUS_REJECTED;
          pgClaim.validation_date = new Date();
          await pgClaim.save();
          console.log(`Claim REJECTED due to missing receipt date.`);
          continue; 
        }

        const pgAmount = parseFloat(pgClaim.claim_amount);
        const mongoAmount = parseFloat(receipt.totalAmount);
        
        const submissionDate = new Date(pgClaim.submission_date);
        const receiptDate = new Date(receipt.date);

        const monthDiff = getMonthDifference(submissionDate, receiptDate);
        const isWithinThreeMonths = monthDiff >= 0 && monthDiff <= 3;
        const isAmountValid = pgAmount <= mongoAmount;

        console.log(`Validation Metrics for Claim ${receipt.claim_id}:`);
        console.log(`   - Claim Amount: ${pgAmount} | Receipt Amount: ${mongoAmount} Validity: ${isAmountValid}`);
        console.log(`   - Submission Date: ${submissionDate.toISOString().split('T')[0]} Receipt Date: ${receiptDate.toISOString().split('T')[0]} Window: ${isWithinThreeMonths}`);

        if (isAmountValid && isWithinThreeMonths) {
          const user = await User.findByPk(pgClaim.user_id);

          if (!user) {
            console.log(`User not found. Rejected.`);
            pgClaim.status_id = STATUS_REJECTED;
          } else {
            const currentBalance = user.balance || 0.0;

            console.log(`Balance Check for User ${user.name} (ID: ${user.id}):`);
            console.log(` - Current Balance: ${currentBalance} | Claim Cost: ${pgAmount}`);

            if (pgAmount <= currentBalance) {
              const updatedBalance = parseFloat((currentBalance - pgAmount).toFixed(2));
              
              user.balance = updatedBalance;
              await user.save();
              console.log(`Sufficient balance. ${pgAmount} transacted. New balance: ${updatedBalance}`);

              pgClaim.status_id = STATUS_APPROVED; 
              pgClaim.approved_amount = pgAmount; 
              console.log(`Claim ${receipt.claim_id} fully APPROVED for: ${pgAmount}.`);

            } else if (currentBalance > 0 && currentBalance < pgAmount) {
              const partialApprovedAmount = currentBalance;
              
              user.balance = 0.0; 
              await user.save();
              console.log(` Partial Balance. New balance: 0.0`);

              pgClaim.status_id = STATUS_PARTIAL_APPROVED; 
              pgClaim.approved_amount = partialApprovedAmount;
              console.log(`Claim ${receipt.claim_id} PARTIALLY APPROVED for amount: ${partialApprovedAmount}.`);

            } else {
              console.log(`Insufficient balance (${currentBalance}). Claim REJECTED.`);
              pgClaim.status_id = STATUS_REJECTED; 
              pgClaim.approved_amount = 0.0;
            }
          }

        } else {
          pgClaim.status_id = STATUS_REJECTED;
          console.log(`Claim ${receipt.claim_id} failed validation. REJECTED.`);
        }

        pgClaim.validation_date = new Date(); 
        await pgClaim.save();
        console.log(`data saved: ${receipt.claim_id}`);

      } catch (singleError) {
        console.error(`Failed to process for claimID ${receipt.claim_id}:`, singleError.message);
      }
      await sleep(4000);
    }

    console.log('\nProcessing completed.');

  } catch (batchError) {
    console.error('failed due to Error:', batchError);
  } finally {
    isProcessing = false;
  }
};

console.log('Initializing...');

cron.schedule('*/2 * * * *', () => {
  runBatchProcessing();
});

runBatchProcessing();

setInterval(() => {
  if (isProcessing) return;

  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  const nextTargetMinute = currentMinutes + (2 - (currentMinutes % 2));
  
  const targetTime = new Date(now);
  targetTime.setMinutes(nextTargetMinute);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);

  const msRemaining = targetTime - now;

  const displayMinutes = Math.floor(msRemaining / 60000);
  const displaySeconds = Math.floor((msRemaining % 60000) / 1000);

  console.log(`Next processing in: ${displayMinutes}m ${displaySeconds.toString().padStart(2, '0')}s`);
}, 10000);


