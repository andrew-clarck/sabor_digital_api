import { useState } from "react";
import Icone from "./Icone";
export default function CardPrato({
  id,
  nome,
  preco,
  categoria,
  descricao,
  disponivel = true,
  imagem,
  onAdicionar,
  enviando = false
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [imagemComErro, setImagemComErro] = useState(null);
  const [adicionado, setAdicionado] = useState(false);
  const precoQuantidade = Math.round(preco * 100) * quantidade / 100;
  function adicionar() {
    if (enviando || !disponivel) return;
    onAdicionar({
      id,
      nome,
      preco,
      disponivel
    }, quantidade);
    setQuantidade(1);
    setAdicionado(true);
  }
  return <article className={`card-prato ${!disponivel ? "esgotado" : ""}`}>
    <div className="visual-prato">{imagem && imagemComErro !== imagem ? <img src={imagem} alt={nome} loading="lazy" onError={() => setImagemComErro(imagem)} /> : <div className="imagem-placeholder"><span className="placeholder-prato"><Icone nome="pratos" tamanho={42} /></span><span>{categoria}</span></div>}{!disponivel && <span className="selo-esgotado">Indisponível</span>}</div>
    <div className="conteudo-prato"><span className="categoria">{categoria}</span><h3>{nome}</h3><p className="descricao">{descricao || "Um sabor para o seu momento."}</p>
      <div className="rodape-prato"><strong className="preco" aria-live="polite" aria-atomic="true">{precoQuantidade.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}</strong>{disponivel && <div className="quantidade"><button type="button" onClick={() => setQuantidade(quantidade - 1)} disabled={quantidade === 1 || enviando} aria-label={`Diminuir quantidade de ${nome}`}><Icone nome="menos" tamanho={14} /></button><span>{quantidade}</span><button type="button" onClick={() => setQuantidade(quantidade + 1)} disabled={quantidade >= 10 || enviando} aria-label={`Aumentar quantidade de ${nome}`}><Icone nome="mais" tamanho={14} /></button></div>}</div>
      <button type="button" className="btn-adicionar btn-adicionar-prato" onClick={adicionar} disabled={!disponivel || enviando}><Icone nome={adicionado ? "certo" : "mais"} tamanho={17} />{!disponivel ? "Indisponível" : adicionado ? "Adicionar mais" : "Adicionar ao pedido"}</button>
    </div>
  </article>;
}
