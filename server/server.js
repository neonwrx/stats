const express = require('express');
const cors = require('cors');
const fs = require('fs');
const historyApiFallback = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const path = require('path');

const config = require('../config/config');

const isDev = process.env.NODE_ENV !== 'production';
const port  = process.env.PORT || 8080;


// Configuration
// ================================================================================================

// Set up Mongoose
mongoose.connect((isDev ? config.db_dev : config.db), { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// API routes
require('./routes')(app);

if (isDev) {

  app.use(historyApiFallback({
    verbose: false
  }));
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    res.end();
  });
}

app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.info('>>> 🌎 Open http://0.0.0.0:%s/ in your browser.', port);
});

module.exports = app;
