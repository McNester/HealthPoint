//TODO: define the handlers in other files for decomposition, 
//so that the main file structures is basically the routes with handlers and 
//mix of some app.use() for more cleaner look in the main file
    




const express = require('express') ;
const app = express();

const fs = require('fs');
const validate = require('jsonschema').validate


//NEGATIVE
const NOT_AUTHORIZED = {"errorCode": 401, "message":"You are not authorized!"}
const USER_EXISTS = {"errorCode": 413, "message":"Username already exists!"}
const USER_NOT_VALID = {"errorCode": 413, "message":"User data is not valid for safe!"}
const SCHEDULE_NOT_VALID = {"errorCode": 413, "message":"Schedule data is not valid for safe!"}
const WRONG_DOCTORID = {"errorCode": 413, "message":"Wrong doctorID!"}
const WRONG_SCHEDULEID = {"errorCode": 413, "message":"Wrong scheduleID!"}


//POS
const USER_SAVED = {"message": "User saved!"}
const SCHEDULE_SAVED = {"message": "Schedule saved!"}
const SCHEDULE_UPDATED = {"message": "Schedule updated!"}
const SCHEDULE_REMOVED = {"message": "Schedule part removed!"}

//PATHS
const USERS_PATH = "./data/users.json"
const SCHEDULE_PATH = "./data/schedule.json"



//SCHEMA
const USER_SCHEMA =
    {
        type: "object",
        properties: {
            username: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: {
                type: "string",
                enum: ["PATIENT", "DOCTOR"]
            }
        },
        required: ["username", "email", "password", "role"]
    };



const SCHEDULE_UPDATE_SCHEMA =
    {
        type: "object",
        properties: {
            id : {type: "number"},
            doctorID: { type: "number" },
            patientID: { type: "number" },
            details: { type: "string" },
            priority: {
                type: "string",
                enum: ["HIGH", "MODERATE","LOW"]
            }
        },
        required: ["doctorID","patientID","details","priority","id"]
    };


const SCHEDULE_SCHEMA =
    {
        type: "object",
        properties: {
            doctorID: { type: "number" },
            patientID: { type: "number" },
            details: { type: "string" },
            priority: {
                type: "string",
                enum: ["HIGH", "MODERATE","LOW"]
            }
        },
        required: ["doctorID","patientID","details","priority"]
    };







//place it into helper functions
function readFile(file_path) {
    if (!fs.existsSync(file_path)) fs.writeFileSync(file_path, JSON.stringify([]));
    const data = fs.readFileSync(file_path, "utf-8");
    return JSON.parse(data);
}

function writeFile(data,file_path) {
    fs.writeFileSync(file_path, JSON.stringify(data, null, 2), "utf-8");
}






function authentication(req, res, next) {
    const authheader = req.headers.authorization;
    
    if (!authheader || !checkAuth(authheader)) {
        res.send(NOT_AUTHORIZED)
        return;
    }
    return next();

}

//place it into auth service, with the auth handler
function checkAuth(authheader){
    const auth = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');

    const username = auth[0];
    const passwd = auth[1];

    const users = readFile(USERS_PATH)
    const user = users.find(user => user.username === username)

    if (!user || user.password !== passwd) {
        return false;
    }

    return true;
}


app.use(express.json());


app.post("/register", (req, res) =>{
    let user = req.body;

    if(!validate(user,USER_SCHEMA).valid){
        res.status(413).send(USER_NOT_VALID)
        return;
    }
    

    const users = readFile(USERS_PATH);
    const existingUser = users.find(u => u.username === user.username);

    if (existingUser) {
        res.status(413).send(USER_EXISTS)
        return
    };

    users.push({ id: Date.now(), username:user.username, email: user.email, password: user.password, role:user.role });
    writeFile(users, USERS_PATH);
    res.send(USER_SAVED)
})



app.use(authentication)
    

app.get("/schedule", (req, res) =>{
    let doctorID = req.query.doctorID;
    if(!doctorID){
        res.status(413).send(WRONG_DOCTORID)
        return;
    }

    const schedule = readFile(SCHEDULE_PATH)
    const doctorsSchedule = schedule.filter(s => s.doctorID === Number.parseInt( doctorID));

    res.send(doctorsSchedule)
})



app.post("/schedule", (req, res) =>{
    let schedule = req.body;

    if(!validate(schedule,SCHEDULE_SCHEMA).valid){
        res.status(413).send(SCHEDULE_NOT_VALID)
        return;
    }
    

    const scheduleList = readFile(SCHEDULE_PATH);

    scheduleList.push(
        {   id: Date.now(),
            doctorID:schedule.doctorID,
            patientID:schedule.patientID,
            details:schedule.details,
            priority:schedule.priority 
        });
    writeFile(scheduleList, SCHEDULE_PATH);
    res.send(SCHEDULE_SAVED)
})



app.delete("/schedule", (req, res) =>{
    let scheduleID = req.query.scheduleID;
    if(!scheduleID){
        res.status(413).send(WRONG_SCHEDULEID)
        return;
    }

    const schedule = readFile(SCHEDULE_PATH)
    const updatedSchedule = schedule.filter(s => s.id !== Number.parseInt(scheduleID));


    writeFile(updatedSchedule, SCHEDULE_PATH);
    res.send(SCHEDULE_REMOVED)
})



app.put("/schedule", (req, res) =>{
    let schedule = req.body;

    if(!validate(schedule,SCHEDULE_UPDATE_SCHEMA).valid){
        res.status(413).send(SCHEDULE_NOT_VALID)
        return;
    }
    

    const scheduleList = readFile(SCHEDULE_PATH);

    const updatedSchedule = scheduleList.map(s => {
        if (s.id === Number.parseInt( schedule.id )) {
            return schedule;
        }
        return record; // Return the unchanged record
    });

    writeFile(updatedSchedule, SCHEDULE_PATH);
    res.send(SCHEDULE_UPDATED)
})



app.listen(3000,()=>{
    console.log("Server is running on 3000. Buddy!!!")
})






