const mongoose = require('mongoose')
const gridfs = require('gridfs-stream')
const fs = require('fs')

const dbUrl = 'mongodb://localhost:27017/ImageShare'
const imageMetaSchema = new mongoose.Schema({
    imageID: Number,
    fileID: String
})
const ImageMeta = mongoose.model('Image_metas', imageMetaSchema)
let gfs

async function mongodbInit() {
    await mongoose.connect(dbUrl, { useNewUrlParser: true }).then(
        () => {
            console.log("connection established.")
            mongoose.Promise = global.Promise
            gridfs.mongo = mongoose.mongo
            const connection = mongoose.connection
            gfs = gridfs(connection.db)
        }
    )
    .catch(
        err => {
            console.log("connection error: ", err)
        }
    )
}

mongodbInit()

module.exports = {

    findMax: () => {
        console.log("finding max")
        return new Promise((resolve, reject) => {
            ImageMeta.findOne().sort('-imageID').exec(function(err, doc) {
                console.log("findmax")
                if(!doc) {
                    resolve(0)
                } else if (err) {
                    console.log("rejected: ", err)
                    reject(err)
                } else {
                    resolve(doc.imageID)
                }
            })
        })
    },

    readData: (requestedId) => {
        return new Promise((resolve, reject) => {
            // lookup image meta info table
            ImageMeta.findOne({imageID: requestedId}).exec(function(err, imageMetaRow) {
                // Check file exist on MongoDB
                if (err || !imageMetaRow) {
                    reject('meta not found')
                } else {
                    console.log("meta object: ", imageMetaRow)
                    console.log("file id: ", mongoose.Types.ObjectId(imageMetaRow.fileID))
                    gfs.exist({ _id: mongoose.Types.ObjectId(imageMetaRow.fileID) }, function (err, file) {
                        if (err || !file) {
                            reject('image not found')
                        } else {
                            const readstream = gfs.createReadStream({ _id: mongoose.Types.ObjectId(imageMetaRow.fileID) })
                            resolve(readstream)
                        }
                    })
                }
            })
        })
    },

    writeData: (filePath) => {
        return new Promise((resolve, reject) => {
            console.log("writting data....")
            module.exports.findMax().then((maxID)=> {
                console.log("maxID", maxID)
                const writestream = gfs.createWriteStream({ filename: maxID + 1 })
                fs.createReadStream(filePath).pipe(writestream)
                writestream.on('close', (file) => {
                    console.log("binary data saved....")
                    var image = new ImageMeta({ imageID: maxID + 1, fileID: file._id })
                    image.save((err, image) => {
                        if (err) {
                            reject(500)
                        } else {
                            console.log("meta data saved", image.fileID)
                            resolve(image.imageID)
                        }
                    })
                })
                writestream.on('error', (err) => {
                    console.log(err)
                    reject(500)
                })
            }).catch((err) => {
                console.log("error in findmax")
                reject(500)
            })
        })
    }
}
