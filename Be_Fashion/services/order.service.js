const { calculateVariantFinalPrice } = require('../utils/price.util');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const db = require('../config/database');
const PaymentService = require('./payment.service');
const ApiError = require('../utils/ApiError');

class OrderService {
  // Checkout - Preview order before creating
  static async checkout(userId, checkoutData) {
    const { address_id } = checkoutData;

    // Get cart
    const cart = await Cart.getCartWithItems(userId);
    
    if (cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Verify stock for all items
    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, `${item.product_name} (${item.color}/${item.size}) only has ${item.stock} items in stock`);
      }
    }

    // Get address
    const [addresses] = await db.query(
      'SELECT * FROM addresses WHERE address_id = ? AND user_id = ?',
      [address_id, userId]
    );

    if (addresses.length === 0) {
      throw new ApiError(404, 'Address not found');
    }

    const address = addresses[0];

    // Calculate shipping fee
    const shipping_fee = PaymentService.calculateShippingFee(address.city);

    // Calculate totals
    let subtotal = 0;

    const items = cart.items.map(item => {
      const final_price = calculateVariantFinalPrice(item);
      subtotal += final_price * item.quantity;

      return {
        ...item,
        price: final_price
      };
    });
    const total = subtotal + shipping_fee;

    return {
      items,
      subtotal: subtotal.toFixed(2),
      shipping_fee: shipping_fee.toFixed(2),
      total: total.toFixed(2),
      address: {
        fullname: address.fullname,
        phone: address.phone,
        street: address.street,
        district: address.district,
        city: address.city
      }
    };
  }

  // Create order
  static async createOrder(userId, orderData) {
    const { address_id, payment_method, card_data } = orderData;

    // Validate payment method
    const validMethods = ['cod', 'credit', 'momo', 'zalopay'];
    if (!validMethods.includes(payment_method)) {
      throw new ApiError(400, 'Invalid payment method');
    }

    // Get checkout preview
    const checkout = await this.checkout(userId, { address_id });

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const orderId = await Order.create({
        user_id: userId,
        address_id,
        total_amount: checkout.total,
        shipping_fee: checkout.shipping_fee,
        payment_method
      });

      // Add order items
      const items = checkout.items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      }));

      await Order.addItems(orderId, items);

      // Decrease stock and log inventory
      for (const item of checkout.items) {
        await Order.decreaseStock(item.variant_id, item.quantity);
        await Order.logInventory(
          item.variant_id,
          item.quantity,
          `Order #${orderId} - ${item.product_name}`
        );
      }

      // Process payment
      let paymentResult;
      switch (payment_method) {
        case 'cod':
          paymentResult = PaymentService.processCOD(orderId, checkout.total);
          break;
        case 'credit':
          paymentResult = await PaymentService.processCreditCard(orderId, checkout.total, card_data);
          break;
        case 'momo':
          paymentResult = await PaymentService.processMoMo(orderId, checkout.total);
          break;
        case 'zalopay':
          paymentResult = await PaymentService.processZaloPay(orderId, checkout.total);
          break;
      }

      // Create payment record
      await Order.createPayment(orderId, {
        amount: checkout.total,
        method: payment_method,
        transaction_id: paymentResult.transaction_id || null,
        status: paymentResult.status
      });

      // Update order status if payment successful
      if (paymentResult.status === 'success') {
        await Order.updateStatus(orderId, 'paid');
      }

      // Clear cart
      await Cart.clearCart(userId);

      await connection.commit();

      // Get created order
      const order = await Order.findById(orderId);

      return {
        order,
        payment: paymentResult
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get user order history
  static async getMyOrders(userId, filters) {
    return await Order.findByUser(userId, filters);
  }

  // Get order detail
  static async getOrderDetail(userId, orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      throw new ApiError(403, 'Access denied');
    }

    return order;
  }

  // Cancel order
  static async cancelOrder(userId, orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      throw new ApiError(403, 'Access denied');
    }

    // Only pending and paid orders can be cancelled
    if (!['pending', 'paid'].includes(order.status)) {
      throw new ApiError(400, 'Order cannot be cancelled');
    }

    // Start transaction
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update order status using connection
      await Order.updateStatus(orderId, 'cancelled', connection);

      // Restore stock for all items
      for (const item of order.items) {
        // Increase stock
        await Order.increaseStock(item.variant_id, item.quantity, connection);
        
        // Log inventory import
        await Order.logInventoryImport(
          item.variant_id,
          item.quantity,
          `Order #${orderId} cancelled - Stock restored`,
          connection
        );
      }

      await connection.commit();

      // Get updated order
      return await Order.findById(orderId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all orders (Admin)
  static async getAllOrders(filters) {
    return await Order.findAll(filters);
  }

  // Update order status (Admin)
  static async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Validate status transition
    const validStatuses = ['pending', 'paid', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    // Status transition rules
    const transitions = {
      'pending': ['paid', 'cancelled'],
      'paid': ['shipping', 'cancelled'],
      'shipping': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!transitions[order.status].includes(status)) {
      throw new ApiError(400, `Cannot change status from ${order.status} to ${status}`);
    }

    await Order.updateStatus(orderId, status);

    return await Order.findById(orderId);
  }

  // Get order statistics (Admin)
  static async getStatistics() {
    return await Order.getStatistics();
  }
}

module.exports = OrderService;