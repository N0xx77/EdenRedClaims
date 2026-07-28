require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {connection} = require('./db');
const receiptRouter = require('./routes/router-receipt')
const PORT = process.env.PORT || 5001;

const app = express();

const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];

connection();

app.use(cors({
    origin: function (origin, callback) {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) == -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//require('./receiptWorker');
require('./receiptWorkerGemini')

app.use('/', receiptRouter);
app.listen(PORT, () => {
  console.log('server on...')
});
