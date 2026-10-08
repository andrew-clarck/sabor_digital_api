import { useEffect, useRef } from "react";
import Icone from "./Icone";
export default function Modal({
  titulo,
  onFechar,
  ocupado = false,
  children
}) {
  const referencia = useRef(null);
  useEffect(() => {
    const dialogo = referencia.current;
    const focoAnterior = document.activeElement;
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogo.showModal();
    dialogo.querySelector("input:not([type='file']), textarea, select")?.focus();
    return () => {
      dialogo.close();
      document.body.style.overflow = rolagemAnterior;
      focoAnterior?.focus();
    };
  }, []);
  return <dialog ref={referencia} className="modal" aria-labelledby="titulo-modal" onCancel={evento => {
    evento.preventDefault();
    if (!ocupado) onFechar();
  }}>
      <div className="modal-cabecalho">
        <div>
          <span className="sobretitulo">Sabor Digital</span>
          <h2 id="titulo-modal">{titulo}</h2>
        </div>
        <button type="button" className="btn-icone" aria-label="Fechar janela" onClick={onFechar} disabled={ocupado}>
          <Icone nome="fechar" />
        </button>
      </div>
      {children}
    </dialog>;
}
