const express = require('express');
const router = express.Router();
const {
    upload,
    uploadService,
    getFileName,
    getAllFiles,
    fileDelete
} = require('../controllers/s3Controller');

router.post('/upload', upload.single('file'), uploadService);
router.get('/:fileName', getFileName);
router.get('/', getAllFiles);
router.delete('/:fileName', fileDelete);

module.exports = router;