import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import SecaoCardapio from "./components/SecaoCardapio";
import Rodape from "./components/Rodape";
import Navegacao from "./components/Navegacao";
import Pedido from "./components/Pedido";
import Icone from "./components/Icone";
import Sincronizacao from "./components/Sincronizacao";
import Autenticacao from "./pages/Autenticacao";
import GestaoProdutos from "./pages/GestaoProdutos";
import GestaoCardapios from "./pages/GestaoCardapios";
import GestaoPedidos from "./pages/GestaoPedidos";
import { buscarPedido, criarPedido, listarProdutos } from "./services/api";
import { acompanharAtualizacoes, solicitarAtualizacao } from "./services/atualizacao";
function lerSessao() {
  try {
    const dados = JSON.parse(localStorage.getItem("sabor-digital-sessao"));
    return typeof dados?.token === "string" && ["admin", "cliente"].includes(dados?.usuario?.papel) ? dados : null;
  } catch {
    return null;
  }
}
function lerCarrinho() {
  try {
    const itens = JSON.parse(localStorage.getItem("sabor-digital-carrinho"));
    return Array.isArray(itens) ? itens.filter(item => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantidade) && item.quantidade > 0 && Number.isFinite(item.preco)) : [];
  } catch {
    return [];
  }
}
function lerPedidoId() {
  try {
    const id = Number(localStorage.getItem("sabor-digital-pedido"));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
export default function App() {
  const [pagina, setPagina] = useState(() => window.location.hash.slice(1) || "cardapio");
  const [sessao, setSessao] = useState(lerSessao);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroProdutos, setErroProdutos] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [itensPedido, setItensPedido] = useState(lerCarrinho);
  const [cliente, setCliente] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroPedido, setErroPedido] = useState("");
  const [pedidoId, setPedidoId] = useState(lerPedidoId);
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [erroAcompanhamento, setErroAcompanhamento] = useState("");
  const admin = sessao?.usuario.papel === "admin";
  const mostrarCardapio = pagina === "cardapio" || pagina === "pedido";
  const paginaAdmin = ["produtos", "cardapios", "pedidos"].includes(pagina);
  const paginaConhecida = mostrarCardapio || paginaAdmin || ["entrar", "cadastro"].includes(pagina);
  const categorias = [...new Set(produtos.map(produto => produto.categoria))];
  const categoriaAtual = categorias.includes(categoria) ? categoria : "Todos";
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const filtrados = produtos.filter(produto => (categoriaAtual === "Todos" || produto.categoria === categoriaAtual) && `${produto.nome} ${produto.descricao} ${produto.categoria}`.toLocaleLowerCase("pt-BR").includes(termo));
  const itensAtualizados = itensPedido.map(item => {
    const atual = produtos.find(produto => produto.id === item.id);
    return atual ? {
      ...item,
      nome: atual.nome,
      preco: atual.preco,
      disponivel: atual.disponivel
    } : {
      ...item,
      disponivel: false
    };
  });
  const totalItens = itensAtualizados.reduce((total, item) => total + item.quantidade, 0);
  const totalValor = itensAtualizados.reduce((total, item) => total + Math.round(item.preco * 100) * item.quantidade, 0) / 100;
  useEffect(() => {
    function atualizarPagina() {
      setPagina(window.location.hash.slice(1) || "cardapio");
    }
    function atualizarSessao(evento) {
      if (evento.key === "sabor-digital-sessao") setSessao(lerSessao());
    }
    window.addEventListener("hashchange", atualizarPagina);
    window.addEventListener("storage", atualizarSessao);
    return () => {
      window.removeEventListener("hashchange", atualizarPagina);
      window.removeEventListener("storage", atualizarSessao);
    };
  }, []);
  useEffect(() => {
    if (pagina === "pedido") document.getElementById("pedido")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });else window.scrollTo({
      top: 0
    });
  }, [pagina]);
  useEffect(() => acompanharAtualizacoes(listarProdutos, dados => {
    setProdutos(dados);
    setErroProdutos("");
    setCarregando(false);
    setUltimaAtualizacao(Date.now());
  }, erro => {
    setErroProdutos(erro.message);
    setCarregando(false);
  }), []);
  useEffect(() => {
    try {
      localStorage.setItem("sabor-digital-carrinho", JSON.stringify(itensPedido));
    } catch {/* O carrinho continua em memoria. */}
  }, [itensPedido]);
  useEffect(() => {
    if (!pedidoId) return;
    try {
      localStorage.setItem("sabor-digital-pedido", String(pedidoId));
    } catch {/* O acompanhamento continua em memoria. */}
    return acompanharAtualizacoes(signal => buscarPedido(pedidoId, signal), pedido => {
      setPedidoCriado(pedido);
      setErroAcompanhamento("");
    }, erro => {
      setErroAcompanhamento(erro.message);
      return erro.status === 404 ? false : undefined;
    });
  }, [pedidoId]);
  const sair = useCallback(() => {
    setSessao(null);
    setCliente("");
    try {
      localStorage.removeItem("sabor-digital-sessao");
    } catch {/* A sessao em memoria ja foi encerrada. */}
    window.location.hash = "cardapio";
  }, []);
  const sessaoExpirada = useCallback(() => {
    sair();
    window.location.hash = "entrar";
  }, [sair]);
  function iniciarSessao(dados) {
    setSessao(dados);
    setCliente(dados.usuario.nome);
    try {
      localStorage.setItem("sabor-digital-sessao", JSON.stringify(dados));
    } catch {/* O login continua em memoria. */}
    window.location.hash = dados.usuario.papel === "admin" ? "produtos" : "cardapio";
  }
  function adicionarAoPedido(prato, quantidade) {
    if (enviando || !prato.disponivel) return;
    setErroPedido("");
    setItensPedido(itens => itens.some(item => item.id === prato.id) ? itens.map(item => item.id === prato.id ? {
      ...item,
      quantidade: item.quantidade + quantidade
    } : item) : [...itens, {
      id: prato.id,
      nome: prato.nome,
      preco: prato.preco,
      quantidade
    }]);
  }
  function alterarQuantidade(id, diferenca) {
    if (enviando) return;
    setItensPedido(itens => itens.map(item => item.id === id ? {
      ...item,
      quantidade: item.quantidade + diferenca
    } : item).filter(item => item.quantidade > 0));
    setErroPedido("");
  }
  function limparPedido() {
    if (!enviando) {
      setItensPedido([]);
      setErroPedido("");
    }
  }
  function removerItem(id) {
    if (!enviando) {
      setItensPedido(itens => itens.filter(item => item.id !== id));
      setErroPedido("");
    }
  }
  async function enviarPedido(evento) {
    evento.preventDefault();
    if (enviando || itensAtualizados.length === 0 || carregando) return;
    if (itensAtualizados.some(item => !item.disponivel)) {
      setErroPedido("Remova os itens indisponíveis para continuar.");
      return;
    }
    setEnviando(true);
    setErroPedido("");
    try {
      const pedido = await criarPedido(cliente, itensAtualizados);
      setPedidoCriado(pedido);
      setPedidoId(pedido.id);
      setErroAcompanhamento("");
      setItensPedido([]);
      setCliente("");
      window.location.hash = "pedido";
    } catch (erro) {
      setErroPedido(erro.message);
    } finally {
      setEnviando(false);
    }
  }
  return <div className={paginaAdmin && admin ? "app app-admin" : "app"}>
    <a className="pular-conteudo" href="#conteudo" onClick={evento => {
      evento.preventDefault();
      document.getElementById("conteudo")?.focus();
    }}>Pular para o conteúdo</a>
    <Navegacao pagina={pagina} sessao={sessao} onSair={sair} bloqueado={enviando} totalItens={totalItens} />
    <main id="conteudo" tabIndex={-1}>
      {mostrarCardapio && <>
        <Header />
        <div className="loja-layout">
          <div className="catalogo" id="catalogo">
            <div className="cabecalho-catalogo"><div><span className="sobretitulo">Escolha o seu favorito</span><h2>Nosso cardápio</h2></div><Sincronizacao erro={erroProdutos} ultimaAtualizacao={ultimaAtualizacao} /></div>
            <label className="campo-busca"><Icone nome="busca" /><input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="O que você está com vontade de comer?" aria-label="Buscar no cardápio" /></label>
            <div className="filtros-categorias" aria-label="Filtrar por categoria">{["Todos", ...categorias].map(nome => <button key={nome} type="button" className={categoriaAtual === nome ? "chip ativo" : "chip"} aria-pressed={categoriaAtual === nome} onClick={() => setCategoria(nome)}>{nome}</button>)}</div>
            {erroProdutos && <div className="mensagem erro" role="alert">{erroProdutos} <button type="button" className="btn-texto" onClick={solicitarAtualizacao}>Tentar novamente</button></div>}
            {carregando && <div className="skeleton-grid" role="status" aria-label="Carregando cardápio"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>}
            {!carregando && !erroProdutos && filtrados.length === 0 && <div className="estado-vazio"><Icone nome="busca" tamanho={32} /><h3>{produtos.length ? "Nenhum resultado por aqui" : "O cardápio está sendo preparado"}</h3><p>{produtos.length ? "Experimente outro nome ou escolha uma categoria." : "Os produtos aparecerão assim que estiverem disponíveis."}</p></div>}
            {!carregando && categorias.filter(nome => filtrados.some(produto => produto.categoria === nome)).map(nome => <SecaoCardapio key={nome} titulo={nome} pratos={filtrados.filter(prato => prato.categoria === nome)} onAdicionar={adicionarAoPedido} enviando={enviando} />)}
          </div>
          <aside className="coluna-pedido"><Pedido itens={itensAtualizados} totalValor={totalValor} cliente={cliente} onClienteChange={setCliente} onRemover={removerItem} onQuantidadeChange={alterarQuantidade} onLimpar={limparPedido} onEnviar={enviarPedido} enviando={enviando} carregando={carregando} erro={erroPedido} pedidoCriado={pedidoCriado} erroAcompanhamento={erroAcompanhamento} onAtualizar={solicitarAtualizacao} /></aside>
        </div>
        {totalItens > 0 && pagina !== "pedido" && <a className="carrinho-mobile" href="#pedido"><span><Icone nome="sacola" /><strong>{totalItens}</strong> Ver meu pedido</span><strong>{totalValor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}<Icone nome="seta" /></strong></a>}
      </>}
      {(pagina === "entrar" || pagina === "cadastro") && <Autenticacao key={pagina} cadastro={pagina === "cadastro"} onEntrar={iniciarSessao} />}
      {paginaAdmin && !admin && <section className="painel acesso-restrito"><Icone nome="usuario" tamanho={40} /><h1>Área administrativa</h1><p>Entre com sua conta de administrador para gerenciar o Sabor Digital.</p><a className="btn-adicionar" href="#entrar">Entrar na minha conta <Icone nome="seta" /></a></section>}
      {admin && pagina === "produtos" && <GestaoProdutos token={sessao.token} produtos={produtos} carregando={carregando} erroSincronizacao={erroProdutos} ultimaAtualizacao={ultimaAtualizacao} onSessaoExpirada={sessaoExpirada} />}
      {admin && pagina === "cardapios" && <GestaoCardapios token={sessao.token} produtos={produtos} onSessaoExpirada={sessaoExpirada} />}
      {admin && pagina === "pedidos" && <GestaoPedidos token={sessao.token} onSessaoExpirada={sessaoExpirada} />}
      {!paginaConhecida && <section className="painel acesso-restrito"><h1>Página não encontrada</h1><a href="#cardapio" className="btn-adicionar">Voltar ao cardápio</a></section>}
    </main>
    <Rodape />
  </div>;
}
