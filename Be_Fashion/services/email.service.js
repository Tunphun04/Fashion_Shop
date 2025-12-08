const transporter = require('../config/email');

class EmailService {
  // Send Password Reset Email
  static async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Check if email service is available
    if (!transporter) {
      console.warn('⚠️  Email service not configured.');
      console.log('🔗 Password Reset URL:', resetUrl);
      console.log('📋 Reset Token:', resetToken);
      // Don't throw error, just return success
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - Fashion Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #fff; padding: 10px; border-left: 4px solid #667eea; word-break: break-all;">
                ${resetUrl}
              </p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      // Log the reset URL for development
      console.log('🔗 Password Reset URL (email failed):', resetUrl);
      console.log('📋 Reset Token:', resetToken);
      // Don't throw error in development
      return true;
    }
  }

  // Send Welcome Email
  static async sendWelcomeEmail(email, fullName) {
    // Check if email service is available
    if (!transporter) {
      console.log('ℹ️  Welcome email skipped (email service not configured)');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Fashion Store! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Welcome to Fashion Store!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              <p>Thank you for joining Fashion Store! We're excited to have you as part of our community.</p>
              <p>Start exploring our latest fashion collections and enjoy exclusive deals!</p>
              <p>Happy Shopping! 🛍️</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', email);
    } catch (error) {
      console.error('❌ Welcome email failed:', error.message);
      // Don't throw error for welcome email
    }
  }
}

module.exports = EmailService;