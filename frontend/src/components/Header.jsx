function Header({ totalItens, totalValor, onLimpar, enviando }) {
  const valorFormatado = totalValor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <header className="header">
      <h1>Cardápio Sabor Digital</h1>
      <p>Escolha seus pratos e faça seu pedido</p>
      <p className="carrinho">
        Itens no pedido: {totalItens} · Total: {valorFormatado}
      </p>
      <p>
        <button type="button" className="btn-secundario" onClick={onLimpar} disabled={totalItens === 0 || enviando}>
          Limpar pedido
        </button>
        {totalItens > 0 && <a className="link-pedido" href="#pedido">Revisar pedido</a>}
      </p>
    </header>
  );
}

export default Header;
