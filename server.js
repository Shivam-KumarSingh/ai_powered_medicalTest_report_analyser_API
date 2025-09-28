const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Recommended for production API
const config = require('./src/config');
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');
const tracer = require('./src/utils/tracer');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  tracer.log('SERVER', `Server is running on port ${PORT}.`);
});


