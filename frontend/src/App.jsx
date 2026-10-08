import Header from "./components/Header";
import SecaoCardapio from "./components/SecaoCardapio";
import "./App.css";
import { useEffect, useState } from "react";
import Rodape from "./components/Rodape";
import Navegacao from "./components/Navegacao";
import Pedido from "./components/Pedido";
import Autenticacao from "./pages/Autenticacao";
import GestaoProdutos from "./pages/GestaoProdutos";
import GestaoCardapios from "./pages/GestaoCardapios";
import GestaoPedidos from "./pages/GestaoPedidos";
import { buscarPedido, criarPedido, listarProdutos } from "./services/api";

function lerSessao() {
  try {
    const dados = JSON.parse(localStorage.getItem("sabor-digital-sessao"));
    return typeof dados?.token === "string" && dados?.usuario &&
      ["admin", "cliente"].includes(dados.usuario.papel) ? dados : null;
  } catch { return null; }
}

export default function App() {
  const [pagina, setPagina] = useState(() => window.location.hash.slice(1) || "cardapio");
  const [sessao, setSessao] = useState(lerSessao);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroProdutos, setErroProdutos] = useState("");
  const [itensPedido, setItensPedido] = useState([]);
  const [cliente, setCliente] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroPedido, setErroPedido] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const admin = sessao?.usuario.papel === "admin";
  const mostrarCardapio = pagina === "cardapio" || pagina === "pedido";
  const paginaAdmin = ["produtos", "cardapios", "pedidos"].includes(pagina);
  const paginaConhecida = mostrarCardapio || paginaAdmin || ["entrar", "cadastro"].includes(pagina);
  const categorias = [...new Set(produtos.map((produto) => produto.categoria))];
  const totalItens = itensPedido.reduce((total, item) => total + item.quantidade, 0);
  const totalValor = itensPedido.reduce((total, item) => total + Math.round(item.preco * 100) * item.quantidade, 0) / 100;

  useEffect(() => {
    function atualizarPagina() { setPagina(window.location.hash.slice(1) || "cardapio"); }
    window.addEventListener("hashchange", atualizarPagina);
    return () => window.removeEventListener("hashchange", atualizarPagina);
  }, []);

  useEffect(() => {
    let ativo = true;
    listarProdutos()
      .then((dados) => { if (ativo) setProdutos(dados); })
      .catch((erro) => { if (ativo) setErroProdutos(erro.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function iniciarSessao(dados) {
    setSessao(dados); setCliente(dados.usuario.nome);
    try { localStorage.setItem("sabor-digital-sessao", JSON.stringify(dados)); }
    catch { /* O login funciona também quando o armazenamento está bloqueado. */ }
    window.location.hash = dados.usuario.papel === "admin" ? "produtos" : "cardapio";
  }

  function sair() {
    setSessao(null);
    try { localStorage.removeItem("sabor-digital-sessao"); }
    catch { /* A sessão em memória já foi encerrada. */ }
    window.location.hash = "cardapio";
  }

  function sessaoExpirada() { sair(); window.location.hash = "entrar"; }

  async function atualizarProdutos() {
    setCarregando(true); setErroProdutos("");
    try { setProdutos(await listarProdutos()); }
    catch (erro) { setErroProdutos(erro.message); }
    finally { setCarregando(false); }
  }

  function adicionarAoPedido(prato, quantidade) {
    if (enviando || !prato.disponivel) return;
    setErroPedido("");
    setItensPedido((itens) => {
      const existe = itens.some((item) => item.id === prato.id);
      if (existe) return itens.map((item) => item.id === prato.id ? { ...item, quantidade: item.quantidade + quantidade } : item);
      return [...itens, { id: prato.id, nome: prato.nome, preco: prato.preco, quantidade }];
    });
  }

  function limparPedido() {
    if (enviando) return;
    setItensPedido([]); setErroPedido("");
  }

  function removerItem(id) {
    if (enviando) return;
    setItensPedido((itens) => itens.filter((item) => item.id !== id)); setErroPedido("");
  }

  async function enviarPedido(evento) {
    evento.preventDefault();
    if (enviando || itensPedido.length === 0) return;
    setEnviando(true); setErroPedido("");
    try {
      const pedido = await criarPedido(cliente, itensPedido);
      setPedidoCriado(pedido); setItensPedido([]); setCliente("");
    } catch (erro) { setErroPedido(erro.message); }
    finally { setEnviando(false); }
  }

  async function atualizarPedido() {
    if (!pedidoCriado || consultando) return;
    setConsultando(true); setErroPedido("");
    try { setPedidoCriado(await buscarPedido(pedidoCriado.id)); }
    catch (erro) { setErroPedido(erro.message); }
    finally { setConsultando(false); }
  }

  return (
    <main className="app">
      <Navegacao pagina={pagina} sessao={sessao} onSair={sair} bloqueado={enviando} />
      {mostrarCardapio && <>
        <Header totalItens={totalItens} totalValor={totalValor} onLimpar={limparPedido} enviando={enviando} />
        <div className="acoes-cardapio">
          <p className="contador">Cardápio com {produtos.length} itens</p>
          <button type="button" className="btn-secundario" onClick={atualizarProdutos} disabled={carregando || enviando}>Atualizar cardápio</button>
        </div>
        {carregando && <p className="mensagem" role="status">Carregando cardápio...</p>}
        {erroProdutos && <p className="mensagem erro" role="alert">{erroProdutos}</p>}
        {!carregando && !erroProdutos && produtos.length === 0 && <p className="mensagem">Nenhum produto cadastrado no momento.</p>}
        {!carregando && !erroProdutos && categorias.map((categoria) => (
          <SecaoCardapio key={categoria} titulo={categoria} pratos={produtos.filter((prato) => prato.categoria === categoria)} onAdicionar={adicionarAoPedido} enviando={enviando} />
        ))}
        <Pedido itens={itensPedido} totalValor={totalValor} cliente={cliente} onClienteChange={setCliente} onRemover={removerItem} onEnviar={enviarPedido} enviando={enviando} erro={erroPedido} pedidoCriado={pedidoCriado} onAtualizar={atualizarPedido} consultando={consultando} />
      </>}
      {(pagina === "entrar" || pagina === "cadastro") && <Autenticacao key={pagina} cadastro={pagina === "cadastro"} onEntrar={iniciarSessao} />}
      {paginaAdmin && !admin && <section className="painel"><h1>Acesso administrativo</h1><p>Entre com uma conta de administrador para acessar esta página.</p><a href="#entrar">Entrar</a></section>}
      {admin && pagina === "produtos" && <GestaoProdutos token={sessao.token} onAlterado={atualizarProdutos} onSessaoExpirada={sessaoExpirada} />}
      {admin && pagina === "cardapios" && <GestaoCardapios token={sessao.token} onSessaoExpirada={sessaoExpirada} />}
      {admin && pagina === "pedidos" && <GestaoPedidos token={sessao.token} onSessaoExpirada={sessaoExpirada} />}
      {!paginaConhecida && <section className="painel"><h1>Página não encontrada</h1><a href="#cardapio">Voltar ao cardápio</a></section>}
      <Rodape cidade="Salto/SP" />
    </main>
  );
}
