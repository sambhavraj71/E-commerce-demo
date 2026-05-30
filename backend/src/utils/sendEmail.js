const transporter = require('../config/nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM || 'Textura'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Textura, ${user.name}!</h2>
      <p>Thank you for joining Textura. We're excited to have you on board!</p>
      <p>Start exploring our collection of premium products.</p>
      <a href="${process.env.FRONTEND_URL}/shop" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
        Shop Now
      </a>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Welcome to Textura',
    html,
  });
};

const sendOrderConfirmation = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Confirmation #${order._id}</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for your order! Your order has been confirmed and will be processed soon.</p>
      <h3>Order Summary:</h3>
      <p>Total Amount: ₹${order.totalPrice}</p>
      <p>Payment Method: ${order.paymentMethod}</p>
      <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
        Track Order
      </a>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: `Order Confirmation #${order._id}`,
    html,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Dear ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendOrderConfirmation, sendPasswordResetEmail };