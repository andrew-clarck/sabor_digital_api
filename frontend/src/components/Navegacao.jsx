import Icone from "./Icone";
export default function Navegacao({
  pagina,
  sessao,
  onSair,
  bloqueado,
  totalItens
}) {
  const admin = sessao?.usuario.papel === "admin";
  const links = admin ? [["cardapio", "Cardápio", "pratos"], ["produtos", "Produtos", "produtos"], ["cardapios", "Cardápios", "grade"], ["pedidos", "Pedidos", "sacola"]] : [["cardapio", "Cardápio", "pratos"]];
  return <nav className="navegacao" aria-label="Navegação principal">
    <div className="navegacao-conteudo"><a className="marca" href="#cardapio"><span className="marca-icone"><Icone nome="folha" tamanho={25} /></span><span>Sabor<span className="marca-digital">Digital</span></span></a>
      <div className="links-navegacao">{links.map(([id, texto, icone]) => <a key={id} href={`#${id}`} aria-current={pagina === id ? "page" : undefined}><Icone nome={icone} tamanho={18} />{texto}</a>)}</div>
      <div className="conta-navegacao">{sessao ? <><span className="nome-usuario" title={sessao.usuario.nome}><span className="avatar">{sessao.usuario.nome?.slice(0, 1)}</span>{sessao.usuario.nome?.split(" ")[0]}{admin && <small>ADM</small>}</span><button type="button" className="btn-icone" aria-label="Sair da conta" onClick={onSair} disabled={bloqueado}><Icone nome="sair" /></button></> : <><a className="link-entrar" href="#entrar">Entrar</a><a className="btn-contorno" href="#cadastro">Criar conta</a></>}<a className="sacola-nav" href="#pedido" aria-label={`Meu pedido, ${totalItens} itens`}><Icone nome="sacola" />{totalItens > 0 && <span>{totalItens}</span>}</a></div>
    </div>
  </nav>;
}
