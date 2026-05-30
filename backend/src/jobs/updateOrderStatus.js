const Order = require('../models/Order');
const logger = require('../utils/logger');

const updateOrderStatus = async () => {
  try {
    // Auto-deliver orders that were shipped 7+ days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const deliveredOrders = await Order.updateMany(
      {
        orderStatus: 'shipped',
        shippingDate: { $lt: sevenDaysAgo }
      },
      {
        orderStatus: 'delivered',
        isDelivered: true,
        deliveredAt: new Date()
      }
    );
    
    // Auto-cancel pending orders older than 30 minutes (COD)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    const cancelledOrders = await Order.updateMany(
      {
        orderStatus: 'pending',
        paymentMethod: 'cod',
        createdAt: { $lt: thirtyMinutesAgo }
      },
      {
        orderStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Auto-cancelled - payment not completed'
      }
    );
    
    logger.info(`Auto-delivered: ${deliveredOrders.modifiedCount}, Auto-cancelled: ${cancelledOrders.modifiedCount}`);
  } catch (error) {
    logger.error(`Error updating order status: ${error.message}`);
  }
};

module.exports = updateOrderStatus;