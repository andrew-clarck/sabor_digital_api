import { useEffect, useState } from "react";
import { atualizarStatusPedido, buscarPedido, excluirPedido, listarPedidos } from "../services/api";

const statusValidos = { pendente: "Pendente", preparo: "Em preparo", pronto: "Pronto", entregue: "Entregue" };
const moeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GestaoPedidos({ token, onSessaoExpirada }) {
  const [pedidos, setPedidos] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [novoStatus, setNovoStatus] = useState("pendente");
  const [idExcluir, setIdExcluir] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    listarPedidos(token)
      .then((dados) => { if (ativo) setPedidos(dados); })
      .catch((falha) => { if (ativo) setErro(falha.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [token]);

  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();
    else setErro(falha.message);
  }

  async function atualizarLista() {
    setOcupado(true); setErro("");
    try { setPedidos(await listarPedidos(token)); }
    catch (falha) { tratarErro(falha); }
    finally { setOcupado(false); }
  }

  async function verDetalhes(id) {
    setOcupado(true); setErro("");
    try {
      const pedido = await buscarPedido(id);
      setDetalhe(pedido); setNovoStatus(pedido.status);
    } catch (falha) { tratarErro(falha); }
    finally { setOcupado(false); }
  }

  async function salvarStatus(evento) {
    evento.preventDefault();
    if (ocupado || !detalhe) return;
    setOcupado(true); setErro(""); setMensagem("");
    try {
      const pedido = await atualizarStatusPedido(detalhe.id, novoStatus, token);
      setDetalhe(pedido); setPedidos((lista) => lista.map((atual) => atual.id === pedido.id ? pedido : atual));
      setMensagem("Status atualizado com sucesso.");
    } catch (falha) { tratarErro(falha); }
    finally { setOcupado(false); }
  }

  async function excluir() {
    if (ocupado || !idExcluir) return;
    setOcupado(true); setErro(""); setMensagem("");
    try {
      await excluirPedido(idExcluir, token);
      setPedidos((lista) => lista.filter((pedido) => pedido.id !== idExcluir));
      if (detalhe?.id === idExcluir) setDetalhe(null);
      setIdExcluir(null); setMensagem("Pedido excluído com sucesso.");
    } catch (falha) { tratarErro(falha); }
    finally { setOcupado(false); }
  }

  return (
    <section className="painel">
      <h1>Gestão de pedidos</h1>
      {erro && <p className="mensagem erro" role="alert">{erro}</p>}
      {mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}
      <button type="button" className="btn-secundario" onClick={atualizarLista} disabled={ocupado || carregando}>Atualizar pedidos</button>
      {carregando && <p role="status">Carregando pedidos...</p>}
      {!carregando && pedidos.length === 0 && <p>Nenhum pedido encontrado.</p>}
      <ul className="lista-admin">{pedidos.map((pedido) => <li key={pedido.id}>
        <div><strong>Pedido #{pedido.id} · {pedido.cliente || "Cliente não informado"}</strong><p>{statusValidos[pedido.status] || pedido.status} · {moeda(pedido.total)}</p></div>
        <div className="acoes"><button type="button" className="btn-secundario" onClick={() => verDetalhes(pedido.id)} disabled={ocupado}>Detalhes</button><button type="button" className="btn-secundario" onClick={() => setIdExcluir(pedido.id)} disabled={ocupado}>Excluir</button></div>
      </li>)}</ul>
      {detalhe && <div className="detalhe">
        <h2>Pedido #{detalhe.id}</h2>
        <ul>{(detalhe.itens || []).map((item) => <li key={item.id}>{item.quantidade} × {item.produto_nome} · {moeda(item.preco_unitario)}</li>)}</ul>
        <form className="formulario" onSubmit={salvarStatus}>
          <label>Status<select value={novoStatus} onChange={(evento) => setNovoStatus(evento.target.value)} disabled={ocupado}>{Object.entries(statusValidos).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></label>
          <div className="acoes"><button type="submit" className="btn-adicionar" disabled={ocupado || novoStatus === detalhe.status}>Salvar status</button><button type="button" className="btn-secundario" onClick={() => setDetalhe(null)} disabled={ocupado}>Fechar detalhes</button></div>
        </form>
      </div>}
      {idExcluir && <div className="confirmacao" role="alert"><p>Confirmar a exclusão do pedido #{idExcluir}?</p><div className="acoes"><button type="button" className="btn-adicionar" onClick={excluir} disabled={ocupado}>Confirmar exclusão</button><button type="button" className="btn-secundario" onClick={() => setIdExcluir(null)} disabled={ocupado}>Cancelar</button></div></div>}
    </section>
  );
}
