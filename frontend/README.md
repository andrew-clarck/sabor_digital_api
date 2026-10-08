# Sabor Digital — Frontend

Aplicação React + Vite integrada à API Sabor Digital. Utiliza componentes funcionais, props, `useState`, `useEffect` e `fetch`. A navegação usa o hash da URL, permitindo voltar e avançar pelo navegador sem uma biblioteca de rotas.

## Executar

1. Configure e inicie o backend na pasta `../backend` com `npm start`.
2. Na pasta `frontend`, execute `npm ci` e depois `npm run dev`.
3. Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

A API utiliza `https://sabor-digital-api.onrender.com` por padrão. Para usar o backend local ou outro endereço, copie `.env.example` para `.env.local`, ajuste `VITE_API_URL` e reinicie o Vite. Essa variável contém apenas o endereço público da API. Se `VITE_API_URL` estiver configurada na Vercel, ela tem prioridade sobre o endereço padrão; mantenha o valor atualizado e faça um novo deploy após alterá-la.

## Páginas

- **Cardápio:** produtos reais, categorias, disponibilidade, imagens, montagem do pedido, envio e consulta do status.
- **Criar conta / Entrar:** cadastro de cliente e autenticação. O token e os dados do usuário são guardados no navegador para manter a sessão. A senha não é armazenada.
- **Produtos (administrador):** cadastro e edição com `FormData`, imagem JPEG/PNG de até 5 MB e exclusão com confirmação.
- **Cardápios (administrador):** cadastro com seleção dos IDs em `produtos`, consulta dos produtos vinculados e exclusão.
- **Pedidos (administrador):** listagem, detalhes, alteração de status e exclusão.

As páginas administrativas são exibidas para contas cujo papel retornado pela API seja `admin`. O cadastro público do frontend não envia o campo `papel`. Para administrar, entre com uma conta de administrador já existente no backend.

O carrinho guarda os IDs reais dos produtos. O envio contém apenas `cliente` e itens com `produto_id` e `quantidade` numérica inteira; o total definitivo é calculado pelo backend. Em caso de falha, os itens são mantidos para uma nova tentativa.

Os dados de `src/data/cardapio.js` são uma referência da aula e não são utilizados pela aplicação integrada. As curtidas continuam locais, pois a API não possui uma rota para elas.

## Verificar

```bash
npm run lint
npm run build
```
