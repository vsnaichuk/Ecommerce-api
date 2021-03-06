const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const HttpError = require('./models/http-error');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOpt = {
  origin: process.env.CORS_ALLOW_ORIGIN || '*',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(bodyParser.json());
app.use(cors(corsOpt));
app.options('*', cors(corsOpt));

app.use(
  '/uploads/images',
  express.static(path.join('uploads', 'images')),
);

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  throw new HttpError('Could not find this route!', 404);
});

app.use((error, req, res, next) => {
  // TODO: AWS delete file if err

  if (res.headersSent) {
    return next(error);
  }

  console.log(error);
  res.status(error.code || 500);
  res.json(error.message || 'An unknown error occurred!');
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xfxuz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
  )
  .then(() => {
    app.listen(PORT, () =>
      console.log(`App listening on port ${PORT}!`),
    );
  })
  .catch((e) => {
    console.log(e);
  });
