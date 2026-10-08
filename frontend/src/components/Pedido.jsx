const nomesStatus = { pendente: "Pendente", preparo: "Em preparo", pronto: "Pronto", entregue: "Entregue" };

function formatarValor(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Pedido({
  itens, totalValor, cliente, onClienteChange, onRemover, onEnviar,
  enviando, erro, pedidoCriado, onAtualizar, consultando,
}) {
  return (
    <section className="pedido" id="pedido" aria-labelledby="titulo-pedido">
      <h2 id="titulo-pedido">Seu pedido</h2>
      {erro && <p className="mensagem erro" role="alert">{erro}</p>}
      {pedidoCriado && (
        <div className="pedido-confirmado" role="status">
          <h3>Pedido #{pedidoCriado.id} enviado!</h3>
          <p>Status: <strong>{nomesStatus[pedidoCriado.status] || pedidoCriado.status}</strong></p>
          <p>Total confirmado: {formatarValor(pedidoCriado.total)}</p>
          <button type="button" className="btn-secundario" onClick={onAtualizar} disabled={consultando || enviando}>
            {consultando ? "Consultando..." : "Atualizar status"}
          </button>
        </div>
      )}
      {itens.length === 0 ? (
        <p className="pedido-vazio">Adicione produtos do cardápio para montar um pedido.</p>
      ) : (
        <form onSubmit={onEnviar}>
          <ul className="lista-pedido">
            {itens.map((item) => (
              <li key={item.id} className="item-pedido">
                <div><strong>{item.nome}</strong><p>{item.quantidade} × {formatarValor(item.preco)} = {formatarValor(item.quantidade * item.preco)}</p></div>
                <button type="button" className="btn-secundario" onClick={() => onRemover(item.id)} disabled={enviando} aria-label={`Remover ${item.nome} do pedido`}>Remover</button>
              </li>
            ))}
          </ul>
          <label className="campo-cliente" htmlFor="cliente">Seu nome (opcional)
            <input id="cliente" name="cliente" type="text" maxLength={100} autoComplete="name" value={cliente} onChange={(evento) => onClienteChange(evento.target.value)} disabled={enviando} placeholder="Como podemos chamar você?" />
          </label>
          <p className="total-pedido">Total estimado: {formatarValor(totalValor)}</p>
          <button type="submit" className="btn-adicionar" disabled={enviando}>{enviando ? "Enviando pedido..." : "Enviar pedido"}</button>
        </form>
      )}
    </section>
  );
}
