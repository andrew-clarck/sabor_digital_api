import { useEffect, useState } from "react";
import {
  buscarCardapio,
  cadastrarCardapio,
  excluirCardapio,
  listarCardapios,
  listarProdutos,
} from "../services/api";

export default function GestaoCardapios({ token, onSessaoExpirada }) {
  const [cardapios, setCardapios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [selecionados, setSelecionados] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [idExcluir, setIdExcluir] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([listarCardapios(), listarProdutos()])
      .then(([menus, itens]) => {
        if (ativo) {
          setCardapios(menus);
          setProdutos(itens);
        }
      })
      .catch((falha) => {
        if (ativo) setErro(falha.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();
    else setErro(falha.message);
  }

  function selecionar(id) {
    setSelecionados((ids) =>
      ids.includes(id) ? ids.filter((atual) => atual !== id) : [...ids, id],
    );
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    if (ocupado) return;
    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um produto.");
      return;
    }
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      await cadastrarCardapio(
        {
          nome: nome.trim(),
          descricao: descricao.trim(),
          disponivel,
          produtos: selecionados,
        },
        token,
      );
      setNome("");
      setDescricao("");
      setDisponivel(true);
      setSelecionados([]);
      setMensagem("Cardápio cadastrado com sucesso.");
      setCardapios(await listarCardapios());
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  async function verDetalhes(id) {
    setOcupado(true);
    setErro("");
    try {
      setDetalhe(await buscarCardapio(id));
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (ocupado || !idExcluir) return;
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      await excluirCardapio(idExcluir, token);
      setCardapios((lista) => lista.filter((menu) => menu.id !== idExcluir));
      if (detalhe?.id === idExcluir) setDetalhe(null);
      setIdExcluir(null);
      setMensagem("Cardápio excluído com sucesso.");
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="painel">
      <h1>Gestão de cardápios</h1>
      {erro && (
        <p className="mensagem erro" role="alert">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="mensagem sucesso" role="status">
          {mensagem}
        </p>
      )}
      {carregando && <p role="status">Carregando cardápios e produtos...</p>}
      <form className="formulario" onSubmit={cadastrar}>
        <h2>Cadastrar cardápio</h2>
        <fieldset disabled={ocupado || carregando}>
          <label>
            Nome
            <input
              value={nome}
              maxLength={100}
              required
              onChange={(evento) => setNome(evento.target.value)}
            />
          </label>
          <label>
            Descrição
            <textarea
              value={descricao}
              onChange={(evento) => setDescricao(evento.target.value)}
            />
          </label>
          <label className="opcao-checkbox">
            <input
              type="checkbox"
              checked={disponivel}
              onChange={(evento) => setDisponivel(evento.target.checked)}
            />
            Cardápio disponível
          </label>
          <p>Produtos do cardápio:</p>
          {produtos.map((produto) => (
            <label className="opcao-checkbox" key={produto.id}>
              <input
                type="checkbox"
                checked={selecionados.includes(produto.id)}
                onChange={() => selecionar(produto.id)}
              />
              {produto.nome}
            </label>
          ))}
          {!carregando && produtos.length === 0 && (
            <p>Cadastre produtos antes de criar um cardápio.</p>
          )}
          <button
            type="submit"
            className="btn-adicionar"
            disabled={produtos.length === 0}
          >
            {ocupado ? "Aguarde..." : "Cadastrar cardápio"}
          </button>
        </fieldset>
      </form>
      <h2>Cardápios cadastrados</h2>
      {!carregando && cardapios.length === 0 && (
        <p>Nenhum cardápio cadastrado.</p>
      )}
      <ul className="lista-admin">
        {cardapios.map((menu) => (
          <li key={menu.id}>
            <div>
              <strong>{menu.nome}</strong>
              <p>{menu.descricao}</p>
            </div>
            <div className="acoes">
              <button
                type="button"
                className="btn-secundario"
                onClick={() => verDetalhes(menu.id)}
                disabled={ocupado}
              >
                Ver produtos
              </button>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setIdExcluir(menu.id)}
                disabled={ocupado}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
      {detalhe && (
        <div className="detalhe">
          <h3>{detalhe.nome}</h3>
          <ul>
            {detalhe.produtos.map((produto) => (
              <li key={produto.id}>
                {produto.nome} ·{" "}
                {produto.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setDetalhe(null)}
          >
            Fechar detalhes
          </button>
        </div>
      )}
      {idExcluir && (
        <div className="confirmacao" role="alert">
          <p>Confirmar a exclusão do cardápio #{idExcluir}?</p>
          <div className="acoes">
            <button
              type="button"
              className="btn-adicionar"
              onClick={excluir}
              disabled={ocupado}
            >
              Confirmar exclusão
            </button>
            <button
              type="button"
              className="btn-secundario"
              onClick={() => setIdExcluir(null)}
              disabled={ocupado}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
