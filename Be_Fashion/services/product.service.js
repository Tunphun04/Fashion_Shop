const { calculateVariantFinalPrice } = require('../utils/price.util');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const ApiError = require('../utils/ApiError');

class ProductService {
  // Get all products with filters
  static async getProducts(filters) {
    return await Product.findAll(filters);
  }

  // Get product detail
  static async getProductDetail(productId) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Get variants
    const variants = (await Product.findVariants(productId)).map(v => ({
      ...v,
      final_price: calculateVariantFinalPrice(v)
    }));
    
    // Get images
    const images = await Product.findImages(productId);
    
    // Get available colors and sizes
    const colors = await Product.getAvailableColors(productId);
    const sizes = await Product.getAvailableSizes(productId);

    return {
      ...product,
      variants,
      images,
      available_colors: colors,
      available_sizes: sizes
    };
  }

  // Get product by slug
  static async getProductBySlug(slug) {
    const product = await Product.findBySlug(slug);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Get variants
    const variants = (await Product.findVariants(product.product_id)).map(v => ({
      ...v,
      final_price: calculateVariantFinalPrice(v)
    }));
    
    // Get images
    const images = await Product.findImages(product.product_id);
    
    // Get available colors and sizes
    const colors = await Product.getAvailableColors(product.product_id);
    const sizes = await Product.getAvailableSizes(product.product_id);

    return {
      ...product,
      variants,
      images,
      available_colors: colors,
      available_sizes: sizes
    };
  }

  // Get product variants
  static async getProductVariants(productId) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    return await Product.findVariants(productId);
  }

  // Get product images
  static async getProductImages(productId, variantId = null) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    return await Product.findImages(productId, variantId);
  }

  // Create product (Admin only)
  static async createProduct(productData) {
    // Validate category exists
    if (productData.category_id) {
      const categoryExists = await Category.exists(productData.category_id);
      if (!categoryExists) {
        throw new ApiError(400, 'Category not found');
      }
    }

    // Validate brand exists if provided
    if (productData.brand_id) {
      const brandExists = await Brand.exists(productData.brand_id);
      if (!brandExists) {
        throw new ApiError(400, 'Brand not found');
      }
    }

    const productId = await Product.create(productData);
    return await Product.findById(productId);
  }

  // Update product (Admin only)
  static async updateProduct(productId, productData) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    // Validate category if being updated
    if (productData.category_id) {
      const categoryExists = await Category.exists(productData.category_id);
      if (!categoryExists) {
        throw new ApiError(400, 'Category not found');
      }
    }

    // Validate brand if being updated
    if (productData.brand_id) {
      const brandExists = await Brand.exists(productData.brand_id);
      if (!brandExists) {
        throw new ApiError(400, 'Brand not found');
      }
    }

    await Product.update(productId, productData);
    return await Product.findById(productId);
  }

  // Delete product (Admin only)
  static async deleteProduct(productId) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    await Product.delete(productId);
    return { message: 'Product deleted successfully' };
  }

  // Add variant (Admin only)
  static async addVariant(productId, variantData) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    variantData.product_id = productId;
    const variantId = await Product.addVariant(variantData);
    
    const variants = await Product.findVariants(productId);
    return variants.find(v => v.variant_id === variantId);
  }

  // Add image (Admin only)
  static async addImage(productId, imageData) {
    const exists = await Product.exists(productId);
    if (!exists) {
      throw new ApiError(404, 'Product not found');
    }

    imageData.product_id = productId;
    const imageId = await Product.addImage(imageData);
    
    const images = await Product.findImages(productId);
    return images.find(img => img.image_id === imageId);
  }

  // Get all categories
  static async getCategories() {
    return await Category.findAll();
  }

  // Get category tree (organized hierarchically)
  static async getCategoryTree() {
    const allCategories = await Category.findAll();
    
    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // First pass: create map
    allCategories.forEach(cat => {
      categoryMap[cat.category_id] = { ...cat, children: [] };
    });

    // Second pass: build tree
    allCategories.forEach(cat => {
      if (cat.parent_id === null) {
        tree.push(categoryMap[cat.category_id]);
      } else {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].children.push(categoryMap[cat.category_id]);
        }
      }
    });

    return tree;
  }

  // Get all brands
  static async getBrands() {
    return await Brand.findAll();
  }
}

module.exports = ProductService;