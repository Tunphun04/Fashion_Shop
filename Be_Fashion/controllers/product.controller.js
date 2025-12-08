const ProductService = require('../services/product.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const productController = {
  // Get all products with filters
  getProducts: asyncHandler(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      category_id: req.query.category_id,
      brand_id: req.query.brand_id,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      color: req.query.color,
      size: req.query.size,
      search: req.query.search,
      sort: req.query.sort,
      status: req.query.status || 'active'
    };

    const result = await ProductService.getProducts(filters);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Products retrieved successfully')
    );
  }),

  // Get product detail by ID
  getProductById: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await ProductService.getProductDetail(productId);
    
    res.status(200).json(
      new ApiResponse(200, product, 'Product retrieved successfully')
    );
  }),

  // Get product detail by slug
  getProductBySlug: asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const product = await ProductService.getProductBySlug(slug);
    
    res.status(200).json(
      new ApiResponse(200, product, 'Product retrieved successfully')
    );
  }),

  // Get product variants
  getProductVariants: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const variants = await ProductService.getProductVariants(productId);
    
    res.status(200).json(
      new ApiResponse(200, variants, 'Variants retrieved successfully')
    );
  }),

  // Get product images
  getProductImages: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const variantId = req.query.variant_id;
    const images = await ProductService.getProductImages(productId, variantId);
    
    res.status(200).json(
      new ApiResponse(200, images, 'Images retrieved successfully')
    );
  }),

  // Create product (Admin only)
  createProduct: asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body);
    
    res.status(201).json(
      new ApiResponse(201, product, 'Product created successfully')
    );
  }),

  // Update product (Admin only)
  updateProduct: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await ProductService.updateProduct(productId, req.body);
    
    res.status(200).json(
      new ApiResponse(200, product, 'Product updated successfully')
    );
  }),

  // Delete product (Admin only)
  deleteProduct: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const result = await ProductService.deleteProduct(productId);
    
    res.status(200).json(
      new ApiResponse(200, result, result.message)
    );
  }),

  // Add variant (Admin only)
  addVariant: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const variant = await ProductService.addVariant(productId, req.body);
    
    res.status(201).json(
      new ApiResponse(201, variant, 'Variant added successfully')
    );
  }),

  // Add image (Admin only)
  addImage: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const image = await ProductService.addImage(productId, req.body);
    
    res.status(201).json(
      new ApiResponse(201, image, 'Image added successfully')
    );
  }),

  // Get all categories
  getCategories: asyncHandler(async (req, res) => {
    const categories = await ProductService.getCategories();
    
    res.status(200).json(
      new ApiResponse(200, categories, 'Categories retrieved successfully')
    );
  }),

  // Get category tree
  getCategoryTree: asyncHandler(async (req, res) => {
    const tree = await ProductService.getCategoryTree();
    
    res.status(200).json(
      new ApiResponse(200, tree, 'Category tree retrieved successfully')
    );
  }),

  // Get all brands
  getBrands: asyncHandler(async (req, res) => {
    const brands = await ProductService.getBrands();
    
    res.status(200).json(
      new ApiResponse(200, brands, 'Brands retrieved successfully')
    );
  })
};

module.exports = productController;