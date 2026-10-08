const UsuarioRepository = require("../repositories/UsuarioRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ProdutoRepository = require("../repositories/ProdutoRepository");

const JWT_SECRET = process.env.JWT_SECRET;

class UsuarioService {
  async registrarUsuario(dados) {
    let { nome, email, senha, papel } = dados;

    if (!nome || !email || !senha) {
      throw {
        status: 400,
        mensagem: "Os campos Nome, Email e Senha são obrigatórios.",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const role = papel === "admin" ? "admin" : "cliente";

    const novoId = await UsuarioRepository.create({
      nome,
      email,
      senha: senhaHash,
      papel: role,
    });

    return {
      sucesso: true,
      mensagem: "Usuário registrado com sucesso",
      id: novoId,
    };
  }

  async login(dados) {
    const { email, senha } = dados;
    if (!email || !senha) {
      throw {
        status: 400,
        mensagem: "Os campos Email e Senha são obrigatórios",
      };
    }

    const usuario = await UsuarioRepository.findByEmail(email);

    if (!usuario) {
      throw {
        status: 401,
        mensagem: "Credenciais inválidas",
      };
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw {
        status: 401,
        mensagem: "Credenciais inválidas",
      };
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    };
  }
}

module.exports = new UsuarioService();
