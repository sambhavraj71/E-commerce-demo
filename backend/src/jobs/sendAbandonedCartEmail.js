const Cart = require('../models/Cart');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const logger = require('../utils/logger');

const sendAbandonedCartEmail = async () => {
  try {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    
    const carts = await Cart.find({
      updatedAt: { $lt: threeHoursAgo },
      'items.0': { $exists: true },
      reminderSent: { $ne: true }
    }).populate('user');
    
    for (const cart of carts) {
      if (cart.user && cart.user.email) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You left something behind!</h2>
            <p>Hi ${cart.user.name},</p>
            <p>Your cart has ${cart.items.length} items waiting for you.</p>
            <a href="${process.env.FRONTEND_URL}/cart" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
              Complete Your Purchase
            </a>
          </div>
        `;
        
        await sendEmail({
          email: cart.user.email,
          subject: 'Complete Your Purchase at Textura',
          html
        });
        
        cart.reminderSent = true;
        await cart.save();
      }
    }
    
    logger.info(`Sent abandoned cart emails for ${carts.length} carts`);
  } catch (error) {
    logger.error(`Error sending abandoned cart emails: ${error.message}`);
  }
};

module.exports = sendAbandonedCartEmail;