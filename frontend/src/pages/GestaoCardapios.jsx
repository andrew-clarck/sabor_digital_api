import { useEffect, useState } from "react";
import { buscarCardapio, cadastrarCardapio, excluirCardapio, listarCardapios } from "../services/api";
import { acompanharAtualizacoes } from "../services/atualizacao";
import Icone from "../components/Icone";
import Modal from "../components/Modal";
import Sincronizacao from "../components/Sincronizacao";
const moeda = valor => Number(valor).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
export default function GestaoCardapios({
  token,
  produtos,
  onSessaoExpirada
}) {
  const [cardapios, setCardapios] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [selecionados, setSelecionados] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [idDetalhe, setIdDetalhe] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [idExcluir, setIdExcluir] = useState(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSync, setErroSync] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const validos = selecionados.filter(id => produtos.some(produto => produto.id === id));
  const visiveis = cardapios.filter(menu => menu.nome.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR")));
  useEffect(() => {
    if (ocupado) return;
    return acompanharAtualizacoes(listarCardapios, dados => {
      setCardapios(dados);
      setCarregando(false);
      setErroSync("");
      setUltimaAtualizacao(Date.now());
    }, falha => {
      setCarregando(false);
      setErroSync(falha.message);
      if (falha.status === 401) {
        onSessaoExpirada();
        return false;
      }
    });
  }, [ocupado, onSessaoExpirada]);
  useEffect(() => {
    if (!idDetalhe || ocupado) return;
    return acompanharAtualizacoes(signal => buscarCardapio(idDetalhe, signal), menu => {
      setDetalhe(menu);
      setErro("");
    }, falha => {
      if (falha.status === 404) {
        setIdDetalhe(null);
        setMensagem("Este cardápio foi removido.");
        return false;
      }
      setErro(falha.message);
    });
  }, [idDetalhe, ocupado]);
  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();else setErro(falha.message);
  }
  function selecionar(id) {
    setSelecionados(ids => ids.includes(id) ? ids.filter(atual => atual !== id) : [...ids, id]);
  }
  function abrir() {
    setNome("");
    setDescricao("");
    setDisponivel(true);
    setSelecionados([]);
    setErro("");
    setMensagem("");
    setAberto(true);
  }
  async function cadastrar(evento) {
    evento.preventDefault();
    if (ocupado) return;
    if (!nome.trim()) {
      setErro("Informe o nome do cardápio.");
      return;
    }
    if (validos.length === 0) {
      setErro("Selecione pelo menos um produto disponível na lista.");
      return;
    }
    if (validos.length !== selecionados.length) {
      setErro("Um dos produtos selecionados foi removido. Revise a seleção.");
      setSelecionados(validos);
      return;
    }
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      await cadastrarCardapio({
        nome: nome.trim(),
        descricao: descricao.trim(),
        disponivel,
        produtos: validos
      }, token);
      setAberto(false);
      setMensagem("Cardápio cadastrado com sucesso.");
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
      setCardapios(lista => lista.filter(menu => menu.id !== idExcluir));
      setIdExcluir(null);
      setMensagem("Cardápio excluído com sucesso.");
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }
  return <section className="painel">
    <div className="pagina-cabecalho"><div><span className="sobretitulo">Sabores que combinam</span><h1>Cardápios</h1><p>Organize seus produtos em seleções especiais.</p></div><button className="btn-adicionar" type="button" onClick={abrir}><Icone nome="mais" />Adicionar cardápio</button></div>
    {mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}
    {!aberto && !idDetalhe && !idExcluir && erro && <p className="mensagem erro" role="alert">{erro}</p>}
    <div className="barra-ferramentas"><label className="campo-busca"><Icone nome="busca" /><input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Buscar cardápio" aria-label="Buscar cardápio" /></label><Sincronizacao erro={erroSync} ultimaAtualizacao={ultimaAtualizacao} /></div>
    {carregando && <p className="estado-vazio" role="status">Carregando cardápios...</p>}
    {!carregando && visiveis.length === 0 && <div className="estado-vazio"><Icone nome="grade" tamanho={36} /><h2>{cardapios.length ? "Nenhum resultado encontrado" : "Sua próxima seleção começa aqui"}</h2><p>{cardapios.length ? "Experimente outro nome." : "Crie um cardápio e escolha os produtos que vão fazer parte dele."}</p></div>}
    <div className="grade-cardapios">{visiveis.map(menu => <article className="card-cardapio" key={menu.id}><div className="card-cardapio-topo"><span className="icone-cardapio"><Icone nome="pratos" tamanho={24} /></span><span className={`badge ${menu.disponivel ? "badge-verde" : "badge-cinza"}`}>{menu.disponivel ? "Disponível" : "Indisponível"}</span></div><h2>{menu.nome}</h2><p>{menu.descricao || "Uma seleção de sabores do Sabor Digital."}</p><div className="acoes"><button className="btn-contorno" type="button" onClick={() => {
            setDetalhe(null);
            setErro("");
            setIdDetalhe(menu.id);
          }} disabled={ocupado}>Ver produtos <Icone nome="seta" tamanho={16} /></button><button className="btn-icone perigo" type="button" aria-label={`Excluir cardápio ${menu.nome}`} onClick={() => {
            setIdExcluir(menu.id);
            setErro("");
          }} disabled={ocupado}><Icone nome="excluir" /></button></div></article>)}</div>
    {aberto && <Modal titulo="Adicionar cardápio" onFechar={() => setAberto(false)} ocupado={ocupado}><p className="texto-apoio">Escolha um nome e os produtos dessa seleção.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}<form className="formulario" onSubmit={cadastrar}><fieldset disabled={ocupado}><label>Nome do cardápio<input value={nome} maxLength={100} required placeholder="Ex.: Almoço da semana" autoFocus onChange={evento => setNome(evento.target.value)} /></label><label>Descrição<textarea value={descricao} placeholder="Conte um pouco sobre essa seleção" onChange={evento => setDescricao(evento.target.value)} /></label><label className="opcao-checkbox"><input type="checkbox" checked={disponivel} onChange={evento => setDisponivel(evento.target.checked)} />Cardápio disponível</label><div className="selecao-produtos"><strong>Produtos <small>{validos.length} selecionados</small></strong>{produtos.map(produto => <label className="opcao-checkbox" key={produto.id}><input type="checkbox" checked={selecionados.includes(produto.id)} onChange={() => selecionar(produto.id)} /><span>{produto.nome}<small>{moeda(produto.preco)}{!produto.disponivel && " · Indisponível"}</small></span></label>)}{produtos.length === 0 && <p>Cadastre produtos antes de criar um cardápio.</p>}</div><div className="modal-acoes"><button className="btn-contorno" type="button" onClick={() => setAberto(false)}>Cancelar</button><button className="btn-adicionar" type="submit" disabled={produtos.length === 0}>{ocupado ? "Salvando..." : "Cadastrar cardápio"}</button></div></fieldset></form></Modal>}
    {idDetalhe && <Modal titulo={detalhe?.nome || "Produtos do cardápio"} onFechar={() => setIdDetalhe(null)}><p className="texto-apoio">Essa lista acompanha as alterações dos produtos automaticamente.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}{!detalhe && <p role="status">Carregando produtos...</p>}<ul className="lista-admin">{detalhe?.produtos.map(produto => <li key={produto.id}><div className="item-admin-info"><strong>{produto.nome}</strong><p>{produto.descricao}</p></div><strong>{moeda(produto.preco)}</strong></li>)}</ul>{detalhe?.produtos.length === 0 && <p>Este cardápio não possui produtos.</p>}</Modal>}
    {idExcluir && <Modal titulo="Excluir cardápio?" onFechar={() => setIdExcluir(null)} ocupado={ocupado}><p>Os produtos continuarão cadastrados. Apenas essa seleção será removida.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}<div className="modal-acoes"><button className="btn-contorno" type="button" onClick={() => setIdExcluir(null)} disabled={ocupado}>Cancelar</button><button className="btn-perigo" type="button" onClick={excluir} disabled={ocupado}>{ocupado ? "Excluindo..." : "Excluir cardápio"}</button></div></Modal>}
  </section>;
}
