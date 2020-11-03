const express = require('express');
const multer = require('multer');
const Datastore = require('nedb');
const path = require('path');

const app = express();

//set file storage location and file naming
const storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null, './uploads/images')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage});

const database = new Datastore('database.db');
database.loadDatabase();

app.listen(3000,()=> {
    console.log('listening at 3000');
});

const dir = path.join(__dirname, 'public');

app.use(express.static(dir));

app.use(express.json({ limit: '1mb' }));

//pull all recipies
app.get('/api',(request,response) => {
    console.log("I got a GET request!")
    database.find({}, (err, data) => {
        if(err){
            //just incase something goes wrong
            console.log(err);
            response.end();
            return;
        }
        response.json(data);
    })
});

//serve images
app.get('/uploads/images/*', (request,response) => {
    response.sendFile(path.join(__dirname, request.url));
})

//submit new recipe
app.post('/api', upload.single('photo'), (request, response) =>{
    console.log("I got a POST request!");
    const data = request.body;
    console.log(data);
    const timestamp = Date.now();
    data.timestamp = timestamp;
    if(request.file){
        data.image = true;
        data.path = request.file.path.replace(/\\/g, "/");
    }else{
        data.image = false;
        data.path = "";
    }
    console.log(data);
    database.insert(data);
    response.json(data);
});