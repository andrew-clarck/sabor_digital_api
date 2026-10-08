const caminhos = {
  busca: "m21 21-5-5 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16",
  sacola: "M5 7h14l1 14H4L5 7 M9 8V6a3 3 0 0 1 6 0v2",
  folha: "M20 3C9 2 3 7 5 15c2 7 12 7 15-12 M5 20 16 9",
  mais: "M12 5v14 M5 12h14",
  menos: "M5 12h14",
  fechar: "m6 6 12 12 M18 6 6 18",
  seta: "M5 12h14 m-6-6 6 6-6 6",
  voltar: "M19 12H5 m6-6-6 6 6 6",
  certo: "m5 12 4 4L19 6",
  relogio: "M12 8v5l3 2 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20",
  editar: "m15 5 4 4 M4 20l4-1L20 7a2 2 0 0 0-3-3L5 16l-1 4",
  excluir: "M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7",
  usuario: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  sair: "M9 4H4v16h5 M9 12h12 m-4-4 4 4-4 4",
  pratos: "M4 3v6c0 3 6 3 6 0V3 M7 3v18 M19 3c-4 3-4 9 0 9V3v18",
  produtos: "m12 3 9 5v9l-9 5-9-5V8l9-5 M3 8l9 5 9-5 M12 13v9 M7 5l9 5",
  atualizar: "M20 8a8 8 0 0 0-14-3L3 8 M3 3v5h5 M4 16a8 8 0 0 0 14 3l3-3 M16 16h5v5",
  grade: "M3 3h7v7H3V3 M14 3h7v7h-7V3 M3 14h7v7H3v-7 M14 14h7v7h-7v-7"
};
export default function Icone({
  nome,
  tamanho = 20,
  ...props
}) {
  return <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={caminhos[nome] || caminhos.pratos} />
    </svg>;
}
