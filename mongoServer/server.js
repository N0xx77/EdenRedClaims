require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connection} = require('./db');
const receiptRouter = require('./routes/router-receipt')
const PORT = process.env.PORT || 5001;

const app = express();

connection();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//require('./receiptWorker');
require('./receiptWorkerGemini')

app.use('/', receiptRouter);
app.listen(PORT, () => {
  console.log('server on...')
});
