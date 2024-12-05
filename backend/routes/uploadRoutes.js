import path from 'path'
import express from 'express'
import multer from 'multer'
const router = express.Router()

// Configures disk storage for saving files to the server,
// specifying the destination (/uploads) and filename format,
// with cb handling errors and paths.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`

    cb(null, uniqueSuffix)
  },
})

// all properties are avalible on the file object
// test just tests to see if it matched the regular expression
function fileFilter(req, file, cb) {
  // checks the file and mime types
  const filetypes = /jpe?g|png|webp/
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = mimetypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Images only!'), false)
  }
}

const upload = multer({ storage, fileFilter })
// sigle method on the upload obj
const uploadSingleImage = upload.single('image') // middleware

router.post('/', (req, res) => {
  // passign in uploadSingleImage as a middleware function
  uploadSingleImage(req, res, function (err) {
    if (err) {
      res.status(400).send({ message: err.message })
    }

    res.status(200).send({
      message: 'Image uploaded successfully',
      image: `/${req.file.path}`,
    })
  })
})

// bring into the server.js
export default router
