const ProdutoRepository = require("../repositories/ProdutoRepository");
const fs = require("fs").promises;
const path = require("path");

function normalizarPreco(valor) {
  if (typeof valor !== "number" && typeof valor !== "string") {
    throw { status: 400, mensagem: "Preço deve ser um número positivo com até duas casas decimais" };
  }

  const texto = String(valor).trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) {
    throw { status: 400, mensagem: "Preço deve ser um número positivo com até duas casas decimais" };
  }

  const preco = Number(texto.replace(",", "."));
  if (!Number.isFinite(preco) || preco <= 0 || preco > 99999999.99) {
    throw { status: 400, mensagem: "Preço deve estar entre 0,01 e 99.999.999,99" };
  }
  return preco;
}

function normalizarDisponibilidade(valor) {
  if (valor === undefined) return true;
  const normalizado = typeof valor === "string" ? valor.trim().toLowerCase() : valor;
  if (normalizado === true || normalizado === 1 || normalizado === "true" || normalizado === "1") return true;
  if (normalizado === false || normalizado === 0 || normalizado === "false" || normalizado === "0") return false;
  throw { status: 400, mensagem: "Disponibilidade deve ser true, false, 1 ou 0" };
}

class ProdutoService {
  async listarProdutos() {
    const produtos = await ProdutoRepository.findAll();
    const produtosFormatados = produtos.map((p) => ({
      ...p,
      imagem: p.imagem ? `/public/${p.imagem}` : null,
    }));
    return {
      sucesso: true,
      dados: produtosFormatados,
      total: produtosFormatados.length,
    };
  }

  async buscarProdutoPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const produto = await ProdutoRepository.findById(id);
    if (!produto) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    return {
      sucesso: true,
      dados: {
        ...produto,
        imagem: produto.imagem ? `/public/${produto.imagem}` : null,
      },
    };
  }

  async cadastrarProduto(dados) {
    let { nome, descricao, preco, categoria, disponivel, file } = dados;

    if (!nome || !descricao || preco === undefined) {
      throw {
        status: 400,
        mensagem:
          "Nome, descrição e preço são obrigatórios e devem ser válidos",
      };
    }

    preco = normalizarPreco(preco);

    const novoProduto = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco,
      categoria: categoria || null,
      imagem: file ? `uploads/produtos/${file.filename}` : null,
      disponivel: normalizarDisponibilidade(disponivel),
    };

    const id = await ProdutoRepository.create(novoProduto);

    return {
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso",
      id,
    };
  }

  async atualizarProduto(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await ProdutoRepository.findById(id);
    if (!existe) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    const atualizado = {};
    let { nome, descricao, preco, categoria, disponivel, file } = dados;

    if (nome !== undefined) atualizado.nome = nome.trim();
    if (descricao !== undefined) atualizado.descricao = descricao.trim();
    if (preco !== undefined) {
      atualizado.preco = normalizarPreco(preco);
    }
    if (categoria !== undefined) atualizado.categoria = categoria;
    if (disponivel !== undefined)
      atualizado.disponivel = normalizarDisponibilidade(disponivel);

    if (file) {
      atualizado.imagem = `uploads/produtos/${file.filename}`;
    }

    if (Object.keys(atualizado).length === 0) {
      throw {
        status: 400,
        mensagem: "Nenhum dado válido enviado para atualização",
      };
    }

    const affectedRows = await ProdutoRepository.update(id, atualizado);
    if (affectedRows === 0) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    if (file && existe.imagem && existe.imagem !== atualizado.imagem) {
      const caminhoAntigo = path.join(__dirname, "..", "..", "public", existe.imagem);
      try {
        await fs.unlink(caminhoAntigo);
      } catch (err) {
        console.error("Erro ao apagar imagem antiga:", err);
      }
    }

    return {
      sucesso: true,
      mensagem: "Produto atualizado com sucesso",
    };
  }

  async deletarProduto(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await ProdutoRepository.findById(id);
    if (!existe) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    const affectedRows = await ProdutoRepository.delete(id);
    if (affectedRows === 0) {
      throw { status: 404, mensagem: "Produto não encontrado" };
    }

    if (existe.imagem) {
      const caminho = path.join(__dirname, "..", "..", "public", existe.imagem);
      try {
        await fs.unlink(caminho);
      } catch (err) {
        console.error("Erro ao apagar imagem no deletar:", err);
      }
    }

    return {
      sucesso: true,
      mensagem: "Produto apagado com sucesso",
    };
  }
}

module.exports = new ProdutoService();
