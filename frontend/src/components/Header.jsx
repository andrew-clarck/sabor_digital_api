import Icone from "./Icone";
export default function Header() {
  return <header className="hero">
    <div className="hero-conteudo"><span className="hero-etiqueta"><Icone nome="folha" tamanho={16} /> Sabor Digital · Cardápio digital</span><h1>Comida boa.<br /><em>Escolha fácil.</em></h1><p>Encontre seu próximo favorito, monte seu pedido e acompanhe cada etapa. Tudo em um só lugar.</p><button type="button" className="btn-adicionar" onClick={() => document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth"
      })}>Explorar cardápio <Icone nome="seta" /></button><div className="hero-passos"><span>01 Escolha</span><span>02 Peça</span><span>03 Acompanhe</span></div></div>
    <div className="hero-arte" aria-hidden="true"><div className="hero-circulo" /><div className="prato-ilustrado"><div className="massa-ilustrada"><i /><i /><i /><i /><i /></div><span className="tomate um" /><span className="tomate dois" /><span className="tomate tres" /><span className="folha-ilustrada um" /><span className="folha-ilustrada dois" /></div><div className="hero-nota"><span className="icone-nota"><Icone nome="pratos" tamanho={24} /></span><div><strong>Seu momento de sabor</strong><span>Um pedido. Muitas possibilidades.</span></div></div></div>
  </header>;
}
