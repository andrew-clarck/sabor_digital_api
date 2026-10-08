const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

async function requisitar(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!resposta.ok) {
    const mensagem = dados?.mensagem ||
      (typeof dados?.erro === "string" ? dados.erro : dados?.erro?.mensagem);
    const erro = new Error(mensagem || "Não foi possível concluir a solicitação.");
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

function obterUrlImagem(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//.test(caminho)) return caminho;
  const relativo = caminho.replace(/^\/+/, "");
  return `${API_URL}/${relativo.startsWith("public/") ? relativo : `public/${relativo}`}`;
}

function ajustarProduto(produto) {
  const preco = Number(produto.preco);
  const id = Number(produto.id);
  if (!Number.isFinite(preco) || preco <= 0 || !Number.isInteger(id) || id <= 0) {
    throw new Error("A API retornou um produto com preço ou ID inválido.");
  }
  return {
    ...produto, id, preco,
    categoria: produto.categoria?.trim() || "Outros",
    disponivel: [true, 1, "1", "true"].includes(produto.disponivel),
    imagem: obterUrlImagem(produto.imagem),
  };
}

export async function listarProdutos() {
  const resposta = await requisitar("/produtos");
  if (!Array.isArray(resposta?.dados)) {
    throw new Error("A API não retornou uma lista válida de produtos.");
  }
  return resposta.dados.map(ajustarProduto);
}

function validarPedido(pedido) {
  if (!pedido || !Number.isInteger(Number(pedido.id)) || Number(pedido.id) <= 0 ||
      !Number.isFinite(Number(pedido.total)) || typeof pedido.status !== "string") {
    throw new Error("A API não retornou um pedido válido.");
  }
  return { ...pedido, id: Number(pedido.id), total: Number(pedido.total) };
}

export async function criarPedido(cliente, itens) {
  const resposta = await requisitar("/pedidos", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente: cliente.trim() || null,
      itens: itens.map((item) => ({ produto_id: item.id, quantidade: item.quantidade })),
    }),
  });
  return validarPedido(resposta?.pedido);
}

export async function buscarPedido(id) {
  return validarPedido(await requisitar(`/pedidos/${id}`));
}

export function registrarUsuario(dados) {
  return requisitar("/autenticacao/registrar", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha }),
  });
}

export async function entrar(email, senha) {
  const resposta = await requisitar("/autenticacao/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), senha }),
  });
  if (!resposta?.token || !resposta?.usuario) throw new Error("A API não retornou uma sessão válida.");
  return { token: resposta.token, usuario: resposta.usuario };
}

export function salvarProduto(id, formulario, token) {
  return requisitar(id ? `/produtos/${id}` : "/produtos", {
    method: id ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: formulario,
  });
}

export function excluirProduto(id, token) {
  return requisitar(`/produtos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

export async function listarCardapios() {
  const resposta = await requisitar("/cardapios");
  if (!Array.isArray(resposta?.dados)) throw new Error("A API não retornou uma lista válida de cardápios.");
  return resposta.dados;
}

export async function buscarCardapio(id) {
  const resposta = await requisitar(`/cardapios/${id}`);
  if (!Array.isArray(resposta?.dados?.produtos)) throw new Error("A API não retornou um cardápio válido.");
  return { ...resposta.dados, produtos: resposta.dados.produtos.map(ajustarProduto) };
}

export function cadastrarCardapio(dados, token) {
  return requisitar("/cardapios", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(dados),
  });
}

export function excluirCardapio(id, token) {
  return requisitar(`/cardapios/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

export async function listarPedidos(token) {
  const resposta = await requisitar("/pedidos", { headers: { Authorization: `Bearer ${token}` } });
  if (!Array.isArray(resposta)) throw new Error("A API não retornou uma lista válida de pedidos.");
  return resposta.map(validarPedido);
}

export async function atualizarStatusPedido(id, status, token) {
  const resposta = await requisitar(`/pedidos/${id}/status`, {
    method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  return validarPedido(resposta?.pedido);
}

export function excluirPedido(id, token) {
  return requisitar(`/pedidos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}
