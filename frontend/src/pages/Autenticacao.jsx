import { useState } from "react";
import { entrar, registrarUsuario } from "../services/api";

export default function Autenticacao({ cadastro, onEntrar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro("");
    setMensagem("");
    try {
      if (cadastro) {
        await registrarUsuario({ nome, email, senha });
        setMensagem("Conta criada com sucesso! Agora você pode entrar.");
        setSenha("");
      } else {
        onEntrar(await entrar(email, senha));
      }
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="painel pagina-autenticacao">
      <h1>{cadastro ? "Criar conta" : "Entrar"}</h1>
      {erro && (
        <p className="mensagem erro" role="alert">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="mensagem sucesso" role="status">
          {mensagem} <a href="#entrar">Entrar</a>
        </p>
      )}
      <form className="formulario" onSubmit={enviar}>
        {cadastro && (
          <label>
            Nome
            <input
              name="nome"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              maxLength={100}
              autoComplete="name"
              required
              disabled={enviando}
            />
          </label>
        )}
        <label>
          E-mail
          <input
            name="email"
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            maxLength={100}
            autoComplete="email"
            required
            disabled={enviando}
          />
        </label>
        <label>
          Senha
          <input
            name="senha"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete={cadastro ? "new-password" : "current-password"}
            required
            disabled={enviando}
          />
        </label>
        <button type="submit" className="btn-adicionar" disabled={enviando}>
          {enviando ? "Aguarde..." : cadastro ? "Cadastrar" : "Entrar"}
        </button>
      </form>
      <p>
        {cadastro ? (
          <a href="#entrar">Já tenho uma conta</a>
        ) : (
          <a href="#cadastro">Criar uma conta</a>
        )}
      </p>
    </section>
  );
}
