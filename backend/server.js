const express = require('express');
const cors = require('cors');
require('dotenv').config();
const healthRoutes = require('./routes/healthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', healthRoutes);
app.use('/api/analytics', analyticsRoutes);


module.exports = app;


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
