const express = require('express')
// const cors = require('cors')
const app = express()
const mongodbStore = require('./mongodbStore')
const multer = require('multer')
const upload = multer({
    dest: 'uploads/' // this saves your file into a directory called "uploads"
})
const del = require('del')

const port = 8000

// app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/api/getmax', (req, res) => {
    mongodbStore.findMax()
    .then(
        (maxID) => {
            console.log(maxID)
            res.status(200).send(maxID.toString())
        }
    )
    .catch(
        (err) => {
            console.log(err)
            res.status(500).send(err)
        }
    )
})

// Reading a file from MongoDB based on file id
app.get('/api/:id', (req, res) => {
    console.log("user requesting:", req.params.id)
    mongodbStore.readData(req.params.id)
    .then(
        (readstream) => {
            readstream.pipe(res)
        }
    )
    .catch(
        (err) => {
            res.status(err)
        }
    )
})

// Writing a file from request to MongoDB
app.post('/api/upload', upload.any(), (req, res) => {

    console.log("files: ",req.files)
    console.log("file: ",req.file)
    console.log(req.body, 'Body')

    if (!req.file && !req.files) {
        res.status(400).send("empty file.")
    } else {
        const filePath = req.file ? req.file.path : req.files[0].path
        console.log('filepath: ', filePath)
        mongodbStore.writeData(filePath)
        .then(
            (imageID) => {
                console.log("newly created imageID: ", imageID)
                res.status(200).send(imageID.toString())
            }
        )
        .catch(
            (err) => {
                res.status(err)
            }
        ).finally(
            del('./uploads/*')
        )
    }
})

app.listen(port, () => console.log('Server started on port 8000...'))