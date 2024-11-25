const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/error.middlewares.js');

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

// Set security headers with Helmet middleware
app.use(helmet());

// Log requests with Morgan middleware (use 'combined' format for production)
app.use(morgan('dev'));

const userRouter = require('./routes/auth/user.routes.js');
const pollRouter = require('./routes/poll.routes.js');
const { ApiError } = require('./utils/ApiError.js');
const { ApiResponse } = require('./utils/ApiResponse.js');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/polls', pollRouter);

app.get('/api/v1/healthcheck', (_, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Everything is working properly!'));
});

// if endpoint not found
app.use((_, __, next) => {
  const error = new ApiError(404, 'endpoint not found');
  next(error);
});

app.use(errorHandler);

module.exports = { app };
