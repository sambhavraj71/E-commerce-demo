const logger = require('./logger');

// You can integrate with Twilio, MSG91, or any SMS provider
// This is a template - replace with actual SMS service

const sendSMS = async (phoneNumber, message) => {
  try {
    // Example with Twilio
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    */
    
    // For now, just log
    logger.info(`SMS sent to ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    logger.error(`SMS error: ${error.message}`);
    return false;
  }
};

const sendOrderUpdateSMS = async (phone, orderId, status) => {
  const messages = {
    shipped: `Your order #${orderId} has been shipped! Track your package at ${process.env.FRONTEND_URL}/orders/${orderId}`,
    delivered: `Your order #${orderId} has been delivered. Thank you for shopping with Textura!`,
    cancelled: `Your order #${orderId} has been cancelled.`,
    processing: `Your order #${orderId} is being processed.`
  };
  
  const message = messages[status] || `Your order #${orderId} status updated to ${status}`;
  return sendSMS(phone, message);
};

const sendOTPSMS = async (phone, otp) => {
  const message = `Your Textura OTP is ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

module.exports = { sendSMS, sendOrderUpdateSMS, sendOTPSMS };