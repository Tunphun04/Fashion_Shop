const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Tạo user mới
  static async create(userData) {
    const { full_name, email, password, phone, role_id = 1 } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, phone || null, role_id]
    );

    return result.insertId;
  }

  // Tìm user theo email
  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN user_roles r ON u.role_id = r.role_id 
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  }

  // Tìm user theo ID
  static async findById(userId) {
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.avatar_url, 
              u.is_active, u.created_at, r.name as role_name
       FROM users u
       LEFT JOIN user_roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  // Kiểm tra password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Cập nhật password
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );
  }

  // Kiểm tra user có tồn tại không
  static async exists(email) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    return rows[0].count > 0;
  }

  // Cập nhật thông tin user
  static async update(userId, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return;

    values.push(userId);
    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
  }
}

module.exports = User;