import Icone from "./Icone";
const etapas = [["pendente", "Recebido"], ["preparo", "Em preparo"], ["pronto", "Pronto"], ["entregue", "Entregue"]];
const moeda = valor => Number(valor).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
export default function Pedido({
  itens,
  totalValor,
  cliente,
  onClienteChange,
  onRemover,
  onQuantidadeChange,
  onLimpar,
  onEnviar,
  enviando,
  carregando,
  erro,
  pedidoCriado,
  erroAcompanhamento,
  onAtualizar
}) {
  const indisponivel = itens.some(item => !item.disponivel);
  const etapaAtual = etapas.findIndex(([status]) => status === pedidoCriado?.status);
  return <section className="pedido" id="pedido" aria-labelledby="titulo-pedido">
    <div className="cabecalho-pedido"><span className="icone-pedido"><Icone nome="sacola" tamanho={22} /></span><div><h2 id="titulo-pedido">Seu pedido</h2><p>{itens.length ? `${itens.reduce((soma, item) => soma + item.quantidade, 0)} itens escolhidos` : "Seu próximo favorito está aqui"}</p></div></div>
    {erro && <p className="mensagem erro" role="alert">{erro}</p>}
    {!pedidoCriado && erroAcompanhamento && <p className="mensagem erro" role="alert">Não foi possível acompanhar o último pedido. {erroAcompanhamento}</p>}
    {pedidoCriado && <div className="pedido-confirmado" role="status"><div className="titulo-confirmacao"><Icone nome="certo" /><strong>Pedido #{pedidoCriado.id} recebido!</strong></div><p>Total confirmado: <strong>{moeda(pedidoCriado.total)}</strong></p><ol className="etapas-pedido" aria-label="Acompanhamento do pedido">{etapas.map(([status, nome], indice) => <li key={status} className={indice <= etapaAtual ? "concluida" : ""} aria-current={indice === etapaAtual ? "step" : undefined}><span>{indice < etapaAtual ? <Icone nome="certo" tamanho={12} /> : indice + 1}</span>{nome}</li>)}</ol><small><span className="ponto-status" /> Status atualizado automaticamente</small>{erroAcompanhamento && <p className="mensagem erro">{erroAcompanhamento}</p>}<button className="btn-texto" type="button" onClick={onAtualizar}>Consultar agora</button></div>}
    {itens.length === 0 ? <div className="pedido-vazio"><div className="ilustracao-vazio"><Icone nome="sacola" tamanho={42} /></div><h3>Vamos escolher algo?</h3><p>Adicione seus favoritos do cardápio e eles aparecerão aqui.</p></div> : <form onSubmit={onEnviar}>
      <ul className="lista-pedido">{itens.map(item => <li key={item.id} className="item-pedido"><div className="linha-item"><strong>{item.nome}</strong><button className="btn-icone" type="button" onClick={() => onRemover(item.id)} disabled={enviando} aria-label={`Remover ${item.nome} do pedido`}><Icone nome="fechar" tamanho={15} /></button></div>{!item.disponivel && <span className="aviso-item">Este item não está mais disponível. Remova para continuar.</span>}<div className="linha-item"><div className="quantidade"><button type="button" onClick={() => onQuantidadeChange(item.id, -1)} disabled={enviando} aria-label={`Reduzir ${item.nome} no pedido`}><Icone nome="menos" tamanho={13} /></button><span>{item.quantidade}</span><button type="button" onClick={() => onQuantidadeChange(item.id, 1)} disabled={enviando || !item.disponivel} aria-label={`Aumentar ${item.nome} no pedido`}><Icone nome="mais" tamanho={13} /></button></div><strong>{moeda(item.quantidade * item.preco)}</strong></div></li>)}</ul>
      <label className="campo-cliente" htmlFor="cliente">Como podemos chamar você? <small>Opcional</small><input id="cliente" type="text" maxLength={100} autoComplete="name" value={cliente} onChange={evento => onClienteChange(evento.target.value)} disabled={enviando} placeholder="Seu nome" /></label>
      <div className="total-pedido"><span>Total estimado</span><strong>{moeda(totalValor)}</strong></div><p className="nota-pedido">O total final é confirmado ao enviar o pedido.</p>
      <button type="submit" className="btn-adicionar btn-largo" disabled={enviando || carregando || indisponivel}>{enviando ? "Enviando pedido..." : "Enviar pedido"}<Icone nome="seta" /></button><button type="button" className="btn-texto limpar-pedido" onClick={onLimpar} disabled={enviando}>Limpar pedido</button>
    </form>}
  </section>;
}
