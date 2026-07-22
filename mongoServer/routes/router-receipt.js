const express = require('express')
const multer = require('multer')

const {createReceipt, getReceipt, deleteReceipt, updateReceipt, getAllReceipts, amountReceipt, amountReceiptGemini} = require('../controllers/controller-receipt');

const router = express.Router()

router.post('/api/receipts', createReceipt);
router.get('/api/receipts/:id', getReceipt);
router.delete('/api/receipts', deleteReceipt);
router.patch('/api/receipts', updateReceipt);
router.get('/api/receipts', getAllReceipts);
router.post('/api/receipts/amount', amountReceipt);
router.post('/api/receipts/amountGemini', amountReceiptGemini);
module.exports = router;