import CardPrato from "./CardPrato";

export default function SecaoCardapio({ titulo, pratos, onAdicionar, enviando }) {
  return (
    <section className="secao">
      <h2 className="titulo-secao">{titulo}</h2>
      <div className="cardapio">
        {pratos.map((prato) => (
          <CardPrato
            key={prato.id}
            id={prato.id}
            nome={prato.nome}
            preco={prato.preco}
            categoria={prato.categoria}
            descricao={prato.descricao}
            vegetariano={prato.vegetariano}
            destaque={prato.destaque}
            disponivel={prato.disponivel}
            imagem={prato.imagem}
            onAdicionar={onAdicionar}
            enviando={enviando}
          />
        ))}
      </div>
    </section>
  );
}
