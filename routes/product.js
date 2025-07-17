const express = require('express')
const router = express.Router()

const { createProduct, getProductList, getProductById, queryProduct, getProductsByAuthor, deleteProduct } = require('../controllers/product-controller')
const { uploadPdf } = require('../middleware/multer')
const { authenticateToken } = require('../middleware/authenticateToken')
const { authorizeExpert } = require('../middleware/authorizeExpert')

router.post('/products', authenticateToken, authorizeExpert, uploadPdf.single('file_url'), createProduct)
router.get('/products', getProductList)
router.get('/products/search', queryProduct)
router.get('/products/my-products', authenticateToken, authorizeExpert, getProductsByAuthor)
router.get('/products/:id', getProductById)
router.delete('/products/:id', authenticateToken, authorizeExpert, deleteProduct)

module.exports = router