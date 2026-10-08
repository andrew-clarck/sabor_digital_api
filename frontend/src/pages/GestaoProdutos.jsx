import { useEffect, useState } from "react";
import { excluirProduto, salvarProduto } from "../services/api";
import Icone from "../components/Icone";
import Modal from "../components/Modal";
import Sincronizacao from "../components/Sincronizacao";
const formularioVazio = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "",
  disponivel: true
};
const moeda = valor => Number(valor).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});
export default function GestaoProdutos({
  token,
  produtos,
  carregando,
  erroSincronizacao,
  ultimaAtualizacao,
  onSessaoExpirada
}) {
  const [formulario, setFormulario] = useState(formularioVazio);
  const [idEdicao, setIdEdicao] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [idExcluir, setIdExcluir] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const visiveis = produtos.filter(produto => produto.nome.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR")) && (filtro === "todos" || produto.disponivel === (filtro === "disponiveis")));
  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);
  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();else setErro(falha.message);
  }
  function abrir(produto) {
    setIdEdicao(produto?.id || null);
    setFormulario(produto ? {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: String(produto.preco).replace(".", ","),
      categoria: produto.categoria === "Outros" ? "" : produto.categoria,
      disponivel: produto.disponivel
    } : formularioVazio);
    setArquivo(null);
    setPreview(produto?.imagem || "");
    setErro("");
    setMensagem("");
    setAberto(true);
  }
  function fechar() {
    if (!ocupado) {
      setAberto(false);
      setArquivo(null);
      setPreview("");
    }
  }
  function escolherImagem(evento) {
    const imagem = evento.target.files[0] || null;
    if (imagem && (!["image/jpeg", "image/png"].includes(imagem.type) || imagem.size > 5 * 1024 * 1024)) {
      setErro("Selecione uma imagem JPEG ou PNG de até 5 MB.");
      evento.target.value = "";
      setArquivo(null);
      setPreview(produtos.find(produto => produto.id === idEdicao)?.imagem || "");
      return;
    }
    setArquivo(imagem);
    setErro("");
    setPreview(imagem ? URL.createObjectURL(imagem) : produtos.find(produto => produto.id === idEdicao)?.imagem || "");
  }
  async function salvar(evento) {
    evento.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      if (!formulario.nome.trim() || !formulario.descricao.trim()) throw new Error("Preencha o nome e a descrição do produto.");
      if (!Number.isFinite(Number(formulario.preco.replace(",", "."))) || Number(formulario.preco.replace(",", ".")) <= 0) throw new Error("Informe um preço maior que zero.");
      const dados = new FormData();
      dados.append("nome", formulario.nome.trim());
      dados.append("descricao", formulario.descricao.trim());
      dados.append("preco", formulario.preco.trim());
      dados.append("categoria", formulario.categoria.trim());
      dados.append("disponivel", String(formulario.disponivel));
      if (arquivo) dados.append("imagem", arquivo);
      await salvarProduto(idEdicao, dados, token);
      setAberto(false);
      setArquivo(null);
      setPreview("");
      setMensagem(idEdicao ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
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
      await excluirProduto(idExcluir, token);
      setIdExcluir(null);
      setMensagem("Produto excluído com sucesso.");
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }
  return <section className="painel">
    <div className="pagina-cabecalho"><div><span className="sobretitulo">Sua operação, organizada</span><h1>Produtos</h1><p>Um cardápio bem cuidado começa aqui.</p></div><button className="btn-adicionar" type="button" onClick={() => abrir()}><Icone nome="mais" />Adicionar produto</button></div>
    <div className="resumo-admin"><div><span>Total de produtos</span><strong>{produtos.length}</strong></div><div><span>Disponíveis agora</span><strong>{produtos.filter(produto => produto.disponivel).length}</strong></div><div><span>Indisponíveis</span><strong>{produtos.filter(produto => !produto.disponivel).length}</strong></div></div>
    {!aberto && !idExcluir && erro && <p className="mensagem erro" role="alert">{erro}</p>}
    {mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}
    <div className="barra-ferramentas"><label className="campo-busca"><Icone nome="busca" /><input type="search" value={busca} onChange={evento => setBusca(evento.target.value)} placeholder="Buscar produto pelo nome" aria-label="Buscar produto" /></label><label className="filtro-select"><span>Disponibilidade</span><select value={filtro} onChange={evento => setFiltro(evento.target.value)}><option value="todos">Todos</option><option value="disponiveis">Disponíveis</option><option value="indisponiveis">Indisponíveis</option></select></label><Sincronizacao erro={erroSincronizacao} ultimaAtualizacao={ultimaAtualizacao} /></div>
    {carregando && <p className="estado-vazio" role="status">Carregando produtos...</p>}
    {!carregando && visiveis.length === 0 && <div className="estado-vazio"><Icone nome="produtos" tamanho={32} /><h2>Nenhum produto encontrado</h2><p>{produtos.length ? "Experimente ajustar a busca ou o filtro." : "Adicione o primeiro produto do seu cardápio."}</p></div>}
    <ul className="lista-admin">{visiveis.map(produto => <li key={produto.id}><div className="produto-admin-visual"><Icone nome="pratos" tamanho={24} /></div><div className="item-admin-info"><strong>{produto.nome}</strong><p>{produto.categoria} <span>·</span> {moeda(produto.preco)}</p></div><span className={`badge ${produto.disponivel ? "badge-verde" : "badge-cinza"}`}>{produto.disponivel ? "Disponível" : "Indisponível"}</span><div className="acoes"><button className="btn-contorno" type="button" onClick={() => abrir(produto)} disabled={ocupado}><Icone nome="editar" tamanho={16} />Editar</button><button className="btn-icone perigo" type="button" onClick={() => {
            setIdExcluir(produto.id);
            setErro("");
          }} disabled={ocupado} aria-label={`Excluir ${produto.nome}`}><Icone nome="excluir" tamanho={18} /></button></div></li>)}</ul>
    {aberto && <Modal titulo={idEdicao ? "Editar produto" : "Adicionar produto"} onFechar={fechar} ocupado={ocupado}>
      <p className="texto-apoio">Preencha os detalhes que seus clientes vão encontrar no cardápio.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}
      <form className="formulario" onSubmit={salvar}><fieldset disabled={ocupado}>
        <label>Nome do produto<input value={formulario.nome} maxLength={100} required placeholder="Ex.: Lasanha de frango" onChange={evento => setFormulario({
              ...formulario,
              nome: evento.target.value
            })} autoFocus /></label>
        <label>Descrição<textarea value={formulario.descricao} required placeholder="Ingredientes e o que torna esse prato especial" onChange={evento => setFormulario({
              ...formulario,
              descricao: evento.target.value
            })} /></label>
        <div className="form-dupla"><label>Preço (R$)<input value={formulario.preco} inputMode="decimal" placeholder="18,90" required onChange={evento => setFormulario({
                ...formulario,
                preco: evento.target.value
              })} /></label><label>Categoria<input value={formulario.categoria} maxLength={50} placeholder="Ex.: Massas" onChange={evento => setFormulario({
                ...formulario,
                categoria: evento.target.value
              })} /></label></div>
        <label className="opcao-checkbox"><input type="checkbox" checked={formulario.disponivel} onChange={evento => setFormulario({
              ...formulario,
              disponivel: evento.target.checked
            })} /><span>Disponível para pedidos<small>Desmarque quando o produto estiver esgotado.</small></span></label>
        <label className="upload-imagem">{preview && <img src={preview} alt="Prévia do produto" />}<span><Icone nome="produtos" />Imagem do produto<small>JPEG ou PNG, até 5 MB. Opcional.</small></span><input type="file" accept="image/jpeg,image/png" onChange={escolherImagem} /></label>
        {idEdicao && <p className="texto-apoio">A imagem atual será mantida se você não selecionar outra.</p>}
        <div className="modal-acoes"><button className="btn-contorno" type="button" onClick={fechar}>Cancelar</button><button className="btn-adicionar" type="submit">{ocupado ? "Salvando..." : idEdicao ? "Salvar alterações" : "Cadastrar produto"}</button></div>
      </fieldset></form>
    </Modal>}
    {idExcluir && <Modal titulo="Excluir produto?" onFechar={() => setIdExcluir(null)} ocupado={ocupado}><p>O produto será removido do cardápio. Essa ação não pode ser desfeita.</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}<div className="modal-acoes"><button className="btn-contorno" type="button" onClick={() => setIdExcluir(null)} disabled={ocupado}>Cancelar</button><button className="btn-perigo" type="button" onClick={excluir} disabled={ocupado}>{ocupado ? "Excluindo..." : "Excluir produto"}</button></div></Modal>}
  </section>;
}
