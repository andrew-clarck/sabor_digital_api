const pool = require("../config/database");

class UsuarioRepository {
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  async create(usuarioData) {
    const { nome, email, senha, papel } = usuarioData;
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, papel) VALUES (?, ?, ?, ?)",
      [nome, email, senha, papel || "cliente"],
    );
    return result.insertId;
  }
}

module.exports = new UsuarioRepository();
