import { useEffect, useState } from "react";
import { excluirProduto, listarProdutos, salvarProduto } from "../services/api";

const formularioVazio = { nome: "", descricao: "", preco: "", categoria: "", disponivel: true };

export default function GestaoProdutos({ token, onAlterado, onSessaoExpirada }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [idEdicao, setIdEdicao] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [chaveArquivo, setChaveArquivo] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [idExcluir, setIdExcluir] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;
    listarProdutos()
      .then((dados) => { if (ativo) setProdutos(dados); })
      .catch((falha) => { if (ativo) setErro(falha.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function tratarErro(falha) {
    if (falha.status === 401) onSessaoExpirada();
    else setErro(falha.message);
  }

  function limparFormulario() {
    setFormulario(formularioVazio); setIdEdicao(null); setArquivo(null);
    setChaveArquivo((chave) => chave + 1);
  }

  function editar(produto) {
    setIdEdicao(produto.id);
    setFormulario({ nome: produto.nome, descricao: produto.descricao, preco: String(produto.preco), categoria: produto.categoria === "Outros" ? "" : produto.categoria, disponivel: produto.disponivel });
    setArquivo(null); setChaveArquivo((chave) => chave + 1); setErro(""); setMensagem("");
    document.getElementById("form-produto").scrollIntoView({ behavior: "smooth" });
  }

  async function salvar(evento) {
    evento.preventDefault();
    if (ocupado) return;
    setOcupado(true); setErro(""); setMensagem("");
    try {
      if (arquivo && (!['image/jpeg', 'image/png', 'image/jpg'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024)) {
        throw new Error("Selecione uma imagem JPEG ou PNG de até 5 MB.");
      }
      const dados = new FormData();
      dados.append("nome", formulario.nome.trim());
      dados.append("descricao", formulario.descricao.trim());
      dados.append("preco", formulario.preco.trim());
      dados.append("categoria", formulario.categoria.trim());
      dados.append("disponivel", String(formulario.disponivel));
      if (arquivo) dados.append("imagem", arquivo);
      const resultado = await salvarProduto(idEdicao, dados, token);
      limparFormulario(); setMensagem(resultado.mensagem);
      onAlterado();
      setProdutos(await listarProdutos());
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (ocupado || !idExcluir) return;
    setOcupado(true); setErro(""); setMensagem("");
    try {
      await excluirProduto(idExcluir, token);
      setProdutos((lista) => lista.filter((produto) => produto.id !== idExcluir));
      if (idEdicao === idExcluir) limparFormulario();
      setIdExcluir(null); setMensagem("Produto excluído com sucesso."); onAlterado();
    } catch (falha) {
      tratarErro(falha);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="painel">
      <h1>Gestão de produtos</h1>
      {erro && <p className="mensagem erro" role="alert">{erro}</p>}
      {mensagem && <p className="mensagem sucesso" role="status">{mensagem}</p>}
      <form className="formulario" id="form-produto" onSubmit={salvar}>
        <h2>{idEdicao ? "Editar produto" : "Cadastrar produto"}</h2>
        <fieldset disabled={ocupado}>
          <label>Nome<input value={formulario.nome} maxLength={100} required onChange={(evento) => setFormulario({ ...formulario, nome: evento.target.value })} /></label>
          <label>Descrição<textarea value={formulario.descricao} required onChange={(evento) => setFormulario({ ...formulario, descricao: evento.target.value })} /></label>
          <label>Preço<input value={formulario.preco} inputMode="decimal" placeholder="18,90" required onChange={(evento) => setFormulario({ ...formulario, preco: evento.target.value })} /></label>
          <label>Categoria<input value={formulario.categoria} maxLength={50} onChange={(evento) => setFormulario({ ...formulario, categoria: evento.target.value })} /></label>
          <label className="opcao-checkbox"><input type="checkbox" checked={formulario.disponivel} onChange={(evento) => setFormulario({ ...formulario, disponivel: evento.target.checked })} />Produto disponível</label>
          <label>Imagem (JPEG ou PNG, até 5 MB)<input key={chaveArquivo} type="file" accept="image/jpeg,image/png" onChange={(evento) => setArquivo(evento.target.files[0] || null)} /></label>
          {idEdicao && <p>A imagem atual é mantida se você não selecionar outra.</p>}
          <div className="acoes">
            <button type="submit" className="btn-adicionar">{ocupado ? "Salvando..." : idEdicao ? "Salvar alterações" : "Cadastrar produto"}</button>
            {idEdicao && <button type="button" className="btn-secundario" onClick={limparFormulario}>Cancelar edição</button>}
          </div>
        </fieldset>
      </form>
      <h2>Produtos cadastrados</h2>
      {carregando && <p role="status">Carregando produtos...</p>}
      {!carregando && produtos.length === 0 && <p>Nenhum produto cadastrado.</p>}
      <ul className="lista-admin">
        {produtos.map((produto) => (
          <li key={produto.id}>
            <div><strong>{produto.nome}</strong><p>{produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {produto.disponivel ? "Disponível" : "Indisponível"}</p></div>
            <div className="acoes"><button type="button" className="btn-secundario" onClick={() => editar(produto)} disabled={ocupado}>Editar</button><button type="button" className="btn-secundario" onClick={() => setIdExcluir(produto.id)} disabled={ocupado}>Excluir</button></div>
          </li>
        ))}
      </ul>
      {idExcluir && <div className="confirmacao" role="alert">
        <p>Confirmar a exclusão do produto #{idExcluir}?</p>
        <div className="acoes"><button type="button" className="btn-adicionar" onClick={excluir} disabled={ocupado}>Confirmar exclusão</button><button type="button" className="btn-secundario" onClick={() => setIdExcluir(null)} disabled={ocupado}>Cancelar</button></div>
      </div>}
    </section>
  );
}
