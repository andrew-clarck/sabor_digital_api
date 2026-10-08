import { useState } from "react";
import Selo from "./Selo";

const QUANTIDADE_MAXIMA = 10;

export default function CardPrato({
  id,
  nome,
  preco,
  categoria,
  descricao,
  vegetariano = false,
  destaque = false,
  disponivel = true,
  imagem,
  onAdicionar,
  enviando = false,
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [mostrarDescricao, setMostrarDescricao] = useState(false);
  const [curtidas, setCurtidas] = useState(0);
  const [imagemComErro, setImagemComErro] = useState(null);

  const precoFormatado = preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function diminuir() {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  }

  function aumentar() {
    if (quantidade < QUANTIDADE_MAXIMA) {
      setQuantidade(quantidade + 1);
    }
  }

  function adicionar() {
    if (enviando || !disponivel) return;
    onAdicionar({ id, nome, preco, disponivel }, quantidade);
    setQuantidade(1);
  }
  return (
    <article className={destaque ? "card-prato destaque" : "card-prato"}>
      {imagem && imagemComErro !== imagem && (
        <img className="imagem-prato" src={imagem} alt={nome} loading="lazy" onError={() => setImagemComErro(imagem)} />
      )}
      <span className="categoria">{categoria}</span>
      <h2>
        {categoria === "Sobremesa" ? "🍰 " : ""}
        {nome}
      </h2>

      <div className="selos">
        {destaque && <Selo texto="Destaque" tipo="destaque" />}
        {vegetariano && <Selo texto="Vegetariano" tipo="veg" />}
        {!disponivel && <Selo texto="Esgotado" tipo="esgotado" />}
      </div>

      <p className="preco">{precoFormatado}</p>

      {mostrarDescricao && <p className="descricao">{descricao}</p>}
      <button
        type="button"
        className="btn-secundario"
        onClick={() => setMostrarDescricao(!mostrarDescricao)}
      >
        {mostrarDescricao ? "Esconder descrição" : "Ver descrição"}
      </button>

      {disponivel ? (
        <>
          <div className="quantidade">
            <button
              type="button"
              onClick={diminuir}
              disabled={quantidade === 1 || enviando}
              aria-label={`Diminuir quantidade de ${nome}`}
            >
              −
            </button>

            <span>{quantidade}</span>

            <button
              type="button"
              onClick={aumentar}
              disabled={quantidade === QUANTIDADE_MAXIMA || enviando}
              aria-label={`Aumentar quantidade de ${nome}`}
            >
              +
            </button>
          </div>

          <button type="button" className="btn-adicionar" onClick={adicionar} disabled={enviando}>
            Adicionar ao pedido
          </button>
        </>
      ) : (
        <button type="button" className="btn-indisponivel" disabled>
          Indisponível
        </button>
      )}
      <button
        type="button"
        className="btn-secundario"
        onClick={() => setCurtidas(curtidas + 1)}
      >
        ❤️ Curtir ({curtidas})
      </button>
    </article>
  );
}
