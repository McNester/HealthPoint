const http = require('http');
const url = require('url');

let users = [];
let schedules = [];
let notifications = [];
let doctors = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST' && pathname === '/auth/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, email, password, role } = JSON.parse(body);
            const id = users.length + 1;
            users.push({ id, name, email, password, role });
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'User registered successfully', user: { id, name, email, role } }));
        });
        return;
    }

    if (req.method === 'POST' && pathname === '/auth/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { email, password } = JSON.parse(body);
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                res.end(JSON.stringify({ message: 'Login successful', user }));
            } else {
                res.writeHead(401);
                res.end(JSON.stringify({ message: 'Invalid email or password' }));
            }
        });
        return;
    }

    if (req.method === 'GET' && pathname.startsWith('/schedule')) {
        const doctorId = query.doctorId;
        const schedule = schedules.filter(s => s.doctor_id == doctorId);
        res.end(JSON.stringify(schedule));
        return;
    }

    if (req.method === 'POST' && pathname === '/schedule') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { doctor_id, patient_id, date, time } = JSON.parse(body);
            const id = schedules.length + 1;
            schedules.push({ id, doctor_id, patient_id, date, time });
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Schedule created successfully', schedule: { id, doctor_id, patient_id, date, time } }));
        });
        return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/schedule')) {
        const scheduleId = parseInt(pathname.split('/').pop());
        schedules = schedules.filter(s => s.id !== scheduleId);
        res.end(JSON.stringify({ message: 'Schedule deleted successfully' }));
        return;
    }

    if (req.method === 'GET' && pathname === '/notifications') {
        res.end(JSON.stringify(notifications));
        return;
    }

    if (req.method === 'POST' && pathname === '/notifications') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message, recipients } = JSON.parse(body);
            const id = notifications.length + 1;
            notifications.push({ id, message, recipients });
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Notification created successfully', notification: { id, message, recipients } }));
        });
        return;
    }

    if (req.method === 'GET' && pathname === '/doctors') {
        res.end(JSON.stringify(doctors));
        return;
    }

    if (req.method === 'POST' && pathname === '/doctors') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, specialization } = JSON.parse(body);
            const id = doctors.length + 1;
            doctors.push({ id, name, specialization });
            res.writeHead(201);
            res.end(JSON.stringify({ message: 'Doctor added successfully', doctor: { id, name, specialization } }));
        });
        return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/doctors')) {
        const doctorId = parseInt(pathname.split('/').pop());
        doctors = doctors.filter(d => d.id !== doctorId);
        res.end(JSON.stringify({ message: 'Doctor deleted successfully' }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

