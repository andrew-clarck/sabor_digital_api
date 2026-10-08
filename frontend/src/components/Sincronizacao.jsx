export default function Sincronizacao({
  erro,
  ultimaAtualizacao
}) {
  const horario = ultimaAtualizacao ? new Date(ultimaAtualizacao).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }) : null;
  return <span className={`sincronizacao ${erro ? "offline" : ""}`} title={erro || "Atualização automática a cada 5 segundos"}>
      <span className="ponto-status" />
      {erro ? "Reconectando..." : horario ? `Atualizado às ${horario}` : "Conectando..."}
    </span>;
}
