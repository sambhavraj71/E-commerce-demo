const Cart = require('../models/Cart');
const logger = require('../utils/logger');

const clearAbandonedCarts = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Cart.deleteMany({
      updatedAt: { $lt: sevenDaysAgo },
      items: { $size: 0 }
    });
    
    logger.info(`Cleared ${result.deletedCount} abandoned carts`);
    return result;
  } catch (error) {
    logger.error(`Error clearing abandoned carts: ${error.message}`);
    throw error;
  }
};

module.exports = clearAbandonedCarts;