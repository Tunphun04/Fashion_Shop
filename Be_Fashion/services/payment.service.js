const crypto = require('crypto');

class PaymentService {
  // Process COD payment
  static processCOD(orderId, amount) {
    return {
      method: 'cod',
      status: 'pending',
      message: 'Order placed successfully. Please pay on delivery.'
    };
  }

  // Process Credit Card (Mock - integrate with real gateway)
  static async processCreditCard(orderId, amount, cardData) {
    // Mock credit card processing
    // In production, integrate with Stripe, PayPal, etc.
    
    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      return {
        method: 'credit',
        status: 'success',
        transaction_id: this.generateTransactionId(),
        message: 'Payment processed successfully'
      };
    } else {
      return {
        method: 'credit',
        status: 'failed',
        message: 'Payment failed. Please try again.'
      };
    }
  }

  // Process MoMo payment (Mock)
  static async processMoMo(orderId, amount) {
    // Mock MoMo payment
    // In production, integrate with MoMo API
    // https://developers.momo.vn/
    
    return {
      method: 'momo',
      status: 'pending',
      payment_url: `https://test-payment.momo.vn/gw_payment/transactionProcessor?orderId=${orderId}`,
      transaction_id: this.generateTransactionId(),
      message: 'Redirecting to MoMo payment...'
    };
  }

  // Process ZaloPay payment (Mock)
  static async processZaloPay(orderId, amount) {
    // Mock ZaloPay payment
    // In production, integrate with ZaloPay API
    // https://docs.zalopay.vn/
    
    return {
      method: 'zalopay',
      status: 'pending',
      payment_url: `https://sandbox.zalopay.vn/order/${orderId}`,
      transaction_id: this.generateTransactionId(),
      message: 'Redirecting to ZaloPay...'
    };
  }

  // Generate transaction ID
  static generateTransactionId() {
    return 'TXN' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // Verify payment callback (for MoMo, ZaloPay)
  static verifyPaymentCallback(data, signature, secret) {
    // Mock verification
    // In production, verify signature using secret key
    
    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');
    
    return calculatedSignature === signature;
  }

  // Calculate shipping fee (based on city)
  static calculateShippingFee(city) {
    const shippingRates = {
      'Hanoi': 30000,
      'Ho Chi Minh': 30000,
      'Da Nang': 40000,
      'Can Tho': 50000,
      'Hai Phong': 35000
    };

    return shippingRates[city] || 50000; // Default: 50k VND
  }
}

module.exports = PaymentService;