const express = require('express');
const cors = require('cors');
require('./config/index');

const loginRouter = require('./routes/router-login');
const adminRouter = require('./routes/router-admin')
const employeeRouter = require('./routes/router-employe')
const globalRouter = require('./routes/router-global')

const app = express();

const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use(express.json());

app.use('/api', loginRouter)
app.use('/api', globalRouter)
app.use('/api/admin-dashboard', adminRouter);
app.use('/api/employee-dashboard', employeeRouter);
app.get('/', (req, res) => {
  res.send('Backend server is up and running!');
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});