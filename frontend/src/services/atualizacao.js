// Consulta novamente depois da resposta anterior, sem acumular requisicoes.
export function acompanharAtualizacoes(
  consultar,
  receber,
  tratarErro,
  intervalo = 5000,
) {
  let ativo = true;
  let consultando = false;
  let repetirAgora = false;
  let temporizador;
  let controlador;

  async function atualizar() {
    if (!ativo || document.visibilityState === "hidden") return;
    if (consultando) {
      repetirAgora = true;
      return;
    }
    clearTimeout(temporizador);
    consultando = true;
    controlador = new AbortController();
    let demorou = false;
    const limite = setTimeout(() => {
      demorou = true;
      controlador.abort();
    }, 30000);
    try {
      const dados = await consultar(controlador.signal);
      if (ativo) receber(dados);
    } catch (erro) {
      if (ativo && (demorou || erro.name !== "AbortError")) {
        const falha = demorou
          ? new Error(
              "A conexão demorou mais que o esperado. Tentaremos novamente.",
            )
          : erro;
        if (tratarErro(falha) === false) ativo = false;
      }
    } finally {
      clearTimeout(limite);
      consultando = false;
      if (ativo) {
        temporizador = setTimeout(atualizar, repetirAgora ? 0 : intervalo);
        repetirAgora = false;
      }
    }
  }

  function retomar() {
    if (document.visibilityState !== "hidden") atualizar();
  }

  document.addEventListener("visibilitychange", retomar);
  window.addEventListener("focus", retomar);
  window.addEventListener("sabor-digital:atualizar", retomar);
  atualizar();

  return () => {
    ativo = false;
    clearTimeout(temporizador);
    controlador?.abort();
    document.removeEventListener("visibilitychange", retomar);
    window.removeEventListener("focus", retomar);
    window.removeEventListener("sabor-digital:atualizar", retomar);
  };
}

export function solicitarAtualizacao() {
  window.dispatchEvent(new Event("sabor-digital:atualizar"));
}
