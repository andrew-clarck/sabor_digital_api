export default function Navegacao({ pagina, sessao, onSair, bloqueado }) {
  const admin = sessao?.usuario.papel === "admin";
  return (
    <nav className="navegacao" aria-label="Navegação principal">
      <strong>Sabor Digital</strong>
      <div className="links-navegacao">
        <a href="#cardapio" aria-current={pagina === "cardapio" ? "page" : undefined}>Cardápio</a>
        {admin && <>
          <a href="#produtos" aria-current={pagina === "produtos" ? "page" : undefined}>Produtos</a>
          <a href="#cardapios" aria-current={pagina === "cardapios" ? "page" : undefined}>Cardápios</a>
          <a href="#pedidos" aria-current={pagina === "pedidos" ? "page" : undefined}>Pedidos</a>
        </>}
        {sessao ? <>
          <span>Olá, {sessao.usuario.nome}</span>
          <button type="button" className="btn-secundario" onClick={onSair} disabled={bloqueado}>Sair</button>
        </> : <>
          <a href="#entrar" aria-current={pagina === "entrar" ? "page" : undefined}>Entrar</a>
          <a href="#cadastro" aria-current={pagina === "cadastro" ? "page" : undefined}>Criar conta</a>
        </>}
      </div>
    </nav>
  );
}
