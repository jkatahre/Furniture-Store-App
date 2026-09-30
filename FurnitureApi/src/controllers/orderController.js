const db = require('../../db');

// @desc    Place an order from cart
// @route   POST /api/orders
// @access  Private
exports.placeOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get cart items
    const [cartItems] = await db.query(
      'SELECT c.*, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 2. Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // 3. Create order record
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'pending']
    );
    const orderId = orderResult.insertId;

    // 4. Create order items
    const orderItemsData = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [orderItemsData]
    );

    // 5. Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    // Fetch items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.query(
        'SELECT oi.*, p.name, p.image_url AS image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      return { ...order, items };
    }));

    res.status(200).json({
      success: true,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await db.query(
      'SELECT oi.*, p.name, p.image_url AS image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [orderId]
    );

    res.status(200).json({
      success: true,
      data: { ...orders[0], items }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
