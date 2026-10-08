import { useEffect, useState } from "react";
import { atualizarStatusPedido, buscarPedido, excluirPedido, listarPedidos } from "../services/api";
import { acompanharAtualizacoes, solicitarAtualizacao } from "../services/atualizacao";
import Icone from "../components/Icone";
import Modal from "../components/Modal";
import Sincronizacao from "../components/Sincronizacao";
const statusValidos = {
  pendente: "Pendente",
  preparo: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue"
};
const moeda = valor => Number(valor).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
export default function GestaoPedidos({
  token,
  onSessaoExpirada
}) {
  const [pedidos, setPedidos] = useState([]);
  const [idDetalhe, setIdDetalhe] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [novoStatus, setNovoStatus] = useState("pendente");
  const [statusAlterado, setStatusAlterado] = useState(false);
  const [erroDetalhe, setErroDetalhe] = useState("");
  const [idExcluir, setIdExcluir] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSync, setErroSync] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const visiveis = pedidos.filter(pedido => (filtro === "todos" || pedido.status === filtro) && `${pedido.id} ${pedido.cliente || ""}`.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR")));
  useEffect(() => {
    if (ocupado) return;
    return acompanharAtualizacoes(signal => listarPedidos(token, signal), dados => {
      setPedidos(dados);
      setErroSync("");
      setCarregando(false);
      setUltimaAtualizacao(Date.now());
    }, falha => {
      setErroSync(falha.message);
      setCarregando(false);
      if (falha.status === 401) {
        onSessaoExpirada();
        return false;
      }
    });
  }, [token, ocupado, onSessaoExpirada]);
  useEffect(() => {
    if (!idDetalhe || ocupado) return;
    return acompanharAtualizacoes(signal => buscarPedido(idDetalhe, signal), pedido => {
      setDetalhe(pedido);
      setErroDetalhe("");
      if (!statusAlterado) setNovoStatus(pedido.status);
    }, falha => {
      if (falha.status === 404) {
        setIdDetalhe(null);
        setMensagem("Este pedido foi removido.");
        return false;
      }
      setErroDetalhe(falha.message);
    });
  }, [idDetalhe, ocupado, statusAlterado]);
  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();else setErro(falha.message);
  }
  function verDetalhes(pedido) {
    setDetalhe(null);
    setNovoStatus(pedido.status);
    setStatusAlterado(false);
    setErroDetalhe("");
    setErro("");
    setMensagem("");
    setIdDetalhe(pedido.id);
  }
  async function salvarStatus(evento) {
    evento.preventDefault();
    if (ocupado || !detalhe) return;
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      const pedido = await atualizarStatusPedido(detalhe.id, novoStatus, token);
      setDetalhe(pedido);
      setNovoStatus(pedido.status);
      setStatusAlterado(false);
      setPedidos(lista => lista.map(atual => atual.id === pedido.id ? pedido : atual));
      setMensagem("Status atualizado com sucesso.");
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }
  async function excluir() {
    if (ocupado || !idExcluir) return;
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      await excluirPedido(idExcluir, token);
      setPedidos(lista => lista.filter(pedido => pedido.id !== idExcluir));
      setIdExcluir(null);
      setMensagem("Pedido excluído com sucesso.");
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }
  return <section className="painel">
    <div className="pagina-cabecalho"><div><span className="sobretitulo">Cada pedido importa</span><h1>Pedidos</h1><p>Acompanhe sua operação e mantenha os clientes informados.</p></div><button className="btn-contorno" type="button" onClick={solicitarAtualizacao} disabled={ocupado}><Icone nome="atualizar" tamanho={17} />Atualizar agora</button></div>
    <div className="resumo-admin"><div><span>Aguardando preparo</span><strong>{pedidos.filter(pedido => pedido.status === "pendente").length}</strong></div><div><span>Na cozinha</span><strong>{pedidos.filter(pedido => pedido.status === "preparo").length}</strong></div><div><span>Valor em pedidos</span><strong>{moeda(pedidos.reduce((total, pedido) => total + pedido.total, 0))}</strong></div></div>
    {!idDetalhe && !idExcluir && erro && <p className="mensagem erro" role="alert">{erro}</p>}
    {mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}
    <div className="barra-ferramentas"><label className="campo-busca"><Icone nome="busca" /><input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Buscar por número ou cliente" aria-label="Buscar pedido" /></label><Sincronizacao erro={erroSync} ultimaAtualizacao={ultimaAtualizacao} /></div>
    <div className="filtros-categorias">{[["todos", "Todos"], ...Object.entries(statusValidos)].map(([valor, texto]) => <button key={valor} className={`chip ${filtro === valor ? "ativo" : ""}`} type="button" aria-pressed={filtro === valor} onClick={() => setFiltro(valor)}>{texto}<span>{pedidos.filter(pedido => valor === "todos" || pedido.status === valor).length}</span></button>)}</div>
    {carregando && <p className="estado-vazio" role="status">Carregando pedidos...</p>}
    {!carregando && visiveis.length === 0 && <div className="estado-vazio"><Icone nome="sacola" tamanho={36} /><h2>{pedidos.length ? "Nenhum pedido com esse filtro" : "Pronto para o primeiro pedido"}</h2><p>{pedidos.length ? "Ajuste a busca ou escolha outro status." : "Os novos pedidos aparecerão aqui automaticamente."}</p></div>}
    <ul className="lista-admin lista-pedidos">{visiveis.map(pedido => <li key={pedido.id}><span className="numero-pedido">#{pedido.id}</span><div className="item-admin-info"><strong>{pedido.cliente || "Cliente não informado"}</strong><p>Pedido do cardápio digital</p></div><span className={`badge status-${pedido.status}`}>{statusValidos[pedido.status] || pedido.status}</span><strong className="valor-admin">{moeda(pedido.total)}</strong><div className="acoes"><button className="btn-contorno" type="button" onClick={() => verDetalhes(pedido)} disabled={ocupado}>Ver pedido <Icone nome="seta" tamanho={16} /></button><button className="btn-icone perigo" type="button" aria-label={`Excluir pedido ${pedido.id}`} onClick={() => {
            setIdExcluir(pedido.id);
            setErro("");
          }} disabled={ocupado}><Icone nome="excluir" tamanho={18} /></button></div></li>)}</ul>
    {idDetalhe && <Modal titulo={`Pedido #${idDetalhe}`} onFechar={() => setIdDetalhe(null)} ocupado={ocupado}>{(erro || erroDetalhe) && <p className="mensagem erro" role="alert">{erro || erroDetalhe}</p>}{mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}{!detalhe ? <p role="status">Carregando detalhes...</p> : <><div className="detalhe-pedido-topo"><div><span className="texto-apoio">Cliente</span><strong>{detalhe.cliente || "Cliente não informado"}</strong></div><span className={`badge status-${detalhe.status}`}>{statusValidos[detalhe.status] || detalhe.status}</span></div><ul className="itens-detalhe">{(detalhe.itens || []).map(item => <li key={item.id}><span className="item-quantidade">{item.quantidade}×</span><div><strong>{item.produto_nome}</strong><small>{moeda(item.preco_unitario)} por unidade</small></div><strong>{moeda(item.quantidade * Number(item.preco_unitario))}</strong></li>)}</ul><div className="total-pedido"><span>Total do pedido</span><strong>{moeda(detalhe.total)}</strong></div><form className="formulario" onSubmit={salvarStatus}><label>Status do pedido<select value={novoStatus} onChange={evento => { setNovoStatus(evento.target.value); setStatusAlterado(true); }} disabled={ocupado}>{Object.entries(statusValidos).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></label><p className="texto-apoio">O cliente acompanha essa alteração automaticamente.</p><div className="modal-acoes"><button className="btn-contorno" type="button" onClick={() => setIdDetalhe(null)} disabled={ocupado}>Fechar</button><button className="btn-adicionar" type="submit" disabled={ocupado || novoStatus === detalhe.status}>{ocupado ? "Salvando..." : "Salvar status"}</button></div></form></>}</Modal>}
    {idExcluir && <Modal titulo={`Excluir pedido #${idExcluir}?`} onFechar={() => setIdExcluir(null)} ocupado={ocupado}><p>O pedido e seus itens serão removidos. Essa ação não pode ser desfeita.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}<div className="modal-acoes"><button className="btn-contorno" type="button" onClick={() => setIdExcluir(null)} disabled={ocupado}>Cancelar</button><button className="btn-perigo" type="button" onClick={excluir} disabled={ocupado}>{ocupado ? "Excluindo..." : "Excluir pedido"}</button></div></Modal>}
  </section>;
}
