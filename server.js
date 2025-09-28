const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');

// --- Import Backend Modules ---
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');
const tracer = require('./src/utils/tracer');

const PORT = process.env.PORT || 5500; 
const app = express();

// --- Standard Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- NEW DEBUGGING MIDDLEWARE ---
// This middleware runs BEFORE the static file server to ensure every single request is logged.
app.use((req, res, next) => {
    // Log the incoming request method and path immediately
    tracer.log('INCOMING_REQUEST', `${req.method} ${req.path}`);
    next();
});

// 1. --- API ROUTES (CORRECTED ENDPOINT: /api) ---
// All backend logic routes are mounted under the /api path.
app.use('/api', apiRoutes);

// --- FRONTEND INTEGRATION & STATIC SERVING ---

// 2. Define the path to the frontend directory where the index.html lives
// We assume the build/host directory is named 'frontend'
const FRONTEND_PATH = path.join(__dirname, 'frontend');

// 3. Serve all static files (CSS, JS, images, etc.) from the 'frontend' directory
tracer.log('SERVER_INIT', `Serving static assets from: ${FRONTEND_PATH}`);
app.use(express.static(FRONTEND_PATH));

// 4. CATCH-ALL ROUTE FIX: Handle client-side routing.
// This block ensures that any request not handled by /api or express.static
// (i.e., a client-side route like /results) receives the index.html file.
app.use((req, res, next) => {
    // CRITICAL FIX: Check if the path is NOT '/api' AND the client is asking for an HTML document.
    // If the request is still here, it means express.static did not find a direct file match.
    if (!req.path.startsWith('/api') && req.accepts('html')) {
        tracer.log('SERVER_INIT', `Serving index.html for client route: ${req.path}`);
        res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
    } else {
        // If it's an API call or a static file, let it proceed normally (or hit the error handler)
        next(); 
    }
});


// --- Error Handling Middleware (MUST BE LAST) ---
app.use(errorHandler);

app.listen(PORT, () => {
  tracer.log('SERVER', `Server is running and listening on port ${PORT}.`);
});
