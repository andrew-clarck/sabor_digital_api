import { useState } from "react";
import { entrar, registrarUsuario } from "../services/api";
import Icone from "../components/Icone";
export default function Autenticacao({
  cadastro,
  onEntrar
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
        if (!nome.trim()) throw new Error("Informe seu nome.");
        await registrarUsuario({
          nome,
          email,
          senha
        });
        setMensagem("Conta criada! Entre com seu e-mail e senha.");
        setSenha("");
      } else onEntrar(await entrar(email, senha));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }
  return <section className="pagina-autenticacao"><div className="autenticacao-arte"><Icone nome="folha" tamanho={52} /><span className="sobretitulo">Seu momento de sabor</span><h2>Boas escolhas.<br />Melhores sabores.</h2><p>Um jeito simples de encontrar seus favoritos e aproveitar o Sabor Digital.</p><a href="#cardapio">Conhecer o cardápio <Icone nome="seta" /></a></div><div className="autenticacao-form"><a className="voltar-link" href="#cardapio"><Icone nome="voltar" tamanho={17} />Voltar ao cardápio</a><span className="sobretitulo">Sabor Digital</span><h1>{cadastro ? "Vamos começar?" : "Que bom ter você aqui."}</h1><p className="texto-apoio">{cadastro ? "Crie sua conta com os dados abaixo." : "Entre com seu e-mail e senha para acessar sua conta."}</p>{erro && <p className="mensagem erro" role="alert">{erro}</p>}{mensagem && <p className="mensagem sucesso" role="status">{mensagem} <a href="#entrar">Entrar</a></p>}<form className="formulario" onSubmit={enviar}>{cadastro && <label>Seu nome<input name="nome" value={nome} onChange={evento => setNome(evento.target.value)} maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" required disabled={enviando} /></label>}<label>E-mail<input name="email" type="email" value={email} onChange={evento => setEmail(evento.target.value)} maxLength={100} autoComplete="email" placeholder="voce@exemplo.com" required disabled={enviando} /></label><label>Senha<div className="campo-senha"><input name="senha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={evento => setSenha(evento.target.value)} autoComplete={cadastro ? "new-password" : "current-password"} placeholder="Sua senha" required disabled={enviando} /><button type="button" className="btn-texto" aria-pressed={mostrarSenha} onClick={() => setMostrarSenha(!mostrarSenha)}>{mostrarSenha ? "Ocultar" : "Mostrar"}</button></div></label><button type="submit" className="btn-adicionar btn-largo" disabled={enviando}>{enviando ? "Aguarde..." : cadastro ? "Criar minha conta" : "Entrar"}<Icone nome="seta" /></button></form><p className="alternar-autenticacao">{cadastro ? <>Já tem conta? <a href="#entrar">Entrar</a></> : <>Ainda não tem conta? <a href="#cadastro">Criar conta</a></>}</p>{!cadastro && <p className="nota-pedido">Gerencia o restaurante? Use sua conta de administrador.</p>}</div></section>;
}
