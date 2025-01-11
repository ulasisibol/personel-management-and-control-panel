require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const personnelRoutes = require('./routes/personnelRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const taskRoutes = require('./routes/taskRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const shiftsRoutes = require('./routes/shiftsRoutes');
const extraWork = require('./routes/extraRoutes');
const holiday = require('./routes/holidayRoutes');
const absenteeismRoutes = require("./routes/absenteeismRoutes");
const openaiRoutes = require("./routes/openaiRoutes");


const app = express();

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/announcements', announcementRoutes);
app.use("/api/shifts", shiftsRoutes);
app.use("/api/extraWork", extraWork);
app.use("/api/holiday", holiday);
app.use("/api/absenteeism", absenteeismRoutes);
app.use('/api/openai', openaiRoutes);


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Server'ı başlat
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
};

startServer();

