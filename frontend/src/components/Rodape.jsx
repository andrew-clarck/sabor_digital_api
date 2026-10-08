import Icone from "./Icone";
export default function Rodape() {
  return <footer className="rodape"><a className="marca" href="#cardapio"><Icone nome="folha" tamanho={21} /> Sabor Digital</a><span>Escolha, peça, aproveite.</span><small>© {new Date().getFullYear()} Sabor Digital</small></footer>;
}
