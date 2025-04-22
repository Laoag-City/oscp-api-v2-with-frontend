// file: src/controllers/v2/userController.js
const { User } = require('../../models');

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'fullname', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'v2 User retrieved', user, version: 'v2' });
  } catch (error) {
    console.error('v2 Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullname, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // v2: Validate role if provided
    if (role && !['user', 'superadmin', 'admin', 'staff', 'readonly', 'monitor', 'receiving', 'signatory'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await user.update({ email, fullname, role });
    res.json({ message: 'v2 User updated', userId: user.id, version: 'v2' });
  } catch (error) {
    console.error('v2 Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Validate UUID
  if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy(); // Soft delete (due to paranoid: true in User model)

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
    });
    res.status(200).json({ users: rows, total: count, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}