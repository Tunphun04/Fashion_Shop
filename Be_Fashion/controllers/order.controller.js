const OrderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const orderController = {
  // Checkout - Preview order
  checkout: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const result = await OrderService.checkout(userId, req.body);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Checkout preview successful')
    );
  }),

  // Create order
  createOrder: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const result = await OrderService.createOrder(userId, req.body);
    
    res.status(201).json(
      new ApiResponse(201, result, 'Order created successfully')
    );
  }),

  // Get my orders
  getMyOrders: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status
    };
    
    const result = await OrderService.getMyOrders(userId, filters);
    
    res.status(200).json(
      new ApiResponse(200, result, 'Orders retrieved successfully')
    );
  }),

  // Get order detail
  getOrderDetail: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const order = await OrderService.getOrderDetail(userId, orderId);
    
    res.status(200).json(
      new ApiResponse(200, order, 'Order detail retrieved successfully')
    );
  }),

  // Cancel order
  cancelOrder: asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const orderId = req.params.id;
    
    const order = await OrderService.cancelOrder(userId, orderId);
    
    res.status(200).json(
      new ApiResponse(200, order, 'Order cancelled successfully')
    );
  }),

  // Get all orders (Admin)
  getAllOrders: asyncHandler(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status
    };
    
    const result = await OrderService.getAllOrders(filters);
    
    res.status(200).json(
      new ApiResponse(200, result, 'All orders retrieved successfully')
    );
  }),

  // Update order status (Admin)
  updateOrderStatus: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const order = await OrderService.updateOrderStatus(orderId, status);
    
    res.status(200).json(
      new ApiResponse(200, order, 'Order status updated successfully')
    );
  }),

  // Get order statistics (Admin)
  getStatistics: asyncHandler(async (req, res) => {
    const stats = await OrderService.getStatistics();
    
    res.status(200).json(
      new ApiResponse(200, stats, 'Statistics retrieved successfully')
    );
  })
};

module.exports = orderController;