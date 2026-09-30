const db = require('../../db');

const isValidQuantity = (q) => Number.isInteger(q) && q >= 1 && q <= 100;

// @desc    Get cart items for a user
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [items] = await db.query(
      'SELECT c.*, p.name, p.price, p.image_url AS image FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({ success: false, message: 'Quantity must be a whole number from 1 to 100' });
  }

  try {
    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity || 1, userId, product_id]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity || 1]
      );
    }

    res.status(200).json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cartId = req.params.id;
  const userId = req.user.id;

  if (!isValidQuantity(quantity)) {
    return res.status(400).json({ success: false, message: 'Quantity must be a whole number from 1 to 100' });
  }

  try {
    const [result] = await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
