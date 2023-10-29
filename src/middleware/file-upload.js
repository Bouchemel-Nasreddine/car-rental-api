const multer = require('multer');
const uuid = require('uuid');
const fs = require('fs');
const { normalize } = require('path')

if (!fs.existsSync(process.env.UPLOADED_FILES_PATH)) {
    fs.mkdirSync(process.env.UPLOADED_FILES_PATH, { recursive: true });
}

if (!fs.existsSync(process.env.UPLOADED_IMAGES_PATH)) {
    fs.mkdirSync(process.env.UPLOADED_IMAGES_PATH, { recursive: true });
}

const MYME_TYPES = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png'
}

const fileUpload = multer({
    limits: 1000000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === 'license')
                cb(null, process.env.UPLOADED_FILES_PATH);
            else if (file.fieldname === 'avatar')
                cb(null, process.env.UPLOADED_IMAGES_PATH);
        },
        filename: (req, file, cb) => {
            const ext = MYME_TYPES[file.mimetype];
            cb(null, uuid.v1() + '.' + ext);
        },
        filFilter: (req, file, cb) => {
            const isValid = !!MYME_TYPES[file.mimetype];
            let error = isValid ? null : new Error('Invalid file type');
            cb(error, isValid);

        }

    })

});

module.exports = fileUpload;