export default function Rodape({ cidade, ano = 2026 }) {
  return (
    <footer className="rodape">
      Sabor Digital · {cidade} · {ano}
    </footer>
  );
}
