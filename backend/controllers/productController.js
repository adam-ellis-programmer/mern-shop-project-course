// GOOD PRACTICES WE HAVE TO DO OUR SELVES MVC
import asyncHandler from '../middleware/asyncHandler.js'
import Product from '../models/productModel.js'

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT

  // Set to the page number from the req.query in the URL query parameters.
  // cast  to a number
  const page = Number(req.query.pageNumber) || 1

  // ret obj
  // Use regex for broader matches (e.g., "phone" finds "iPhone 10"),
  // with 'i' for case insensitivity, and get req.query from request params.
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : // no keyword
      {}

  // gets total number of products
  // and limit the count
  const count = await Product.countDocuments({ ...keyword })

  // skip works if on 3 page it skips all pages before it
  // spread across ...keyword do the same and find only products with this keyword
  // IF THERE IS A KEYWORD
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  // Return an object with pages calculated by rounding up and dividing the count by the page size (e.g., 100 / 10 = 10 pages).
  res.json({ products, page, pages: Math.ceil(count / pageSize) })
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    return res.json(product)
  }
  // Throws a cast error if the ID is invalid (e.g., testing in Postman with ID 1) and
  // responds with a 404 and "Product not found" message.
  res.status(404)
  throw new Error('Resource not found')
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.category = category
    product.countInStock = countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await Product.deleteOne({ _id: product._id })
    res.json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  // Check if the logged-in user has reviewed the product by matching their ID (req.user._id)
  // with the reviewer's ID (r.user) in the reviews array; if reviews were separate records,
  //  we'd check if user._id is in the reviewIds array.
  const product = await Product.findById(req.params.id)

  if (product) {
    // check if already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    const review = {
      name: req.user.name,
      rating: Number(rating), // make sure is number
      comment,
      user: req.user._id,
    }

    product.reviews.push(review)

    // set the reviews to whatever the number of reviews are
    // after we push on new review
    product.numReviews = product.reviews.length

    // get the overall rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save()
    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)

  res.json(products)
})
export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
}
