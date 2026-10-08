const PedidoRepository = require('../repositories/PedidoRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');

function criarErro(status, mensagem) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

class PedidoService {
    async criarPedido(pedidoData) {
        const { cliente, itens } = pedidoData || {};

        if (!Array.isArray(itens) || itens.length === 0) {
            throw criarErro(400, 'O pedido deve conter um array com ao menos um item.');
        }

        let totalCalculado = 0;
        const itensCompletos = [];

        for (const item of itens) {
            if (!item || typeof item !== 'object' || Array.isArray(item) || !item.produto_id ||
                !Number.isSafeInteger(item.quantidade) || item.quantidade <= 0) {
                throw criarErro(400, 'Cada item deve ter produto_id e quantidade numérica inteira maior que zero.');
            }

            const produto = await ProdutoRepository.findById(item.produto_id);
            if (!produto) {
                throw criarErro(404, `Produto com ID ${item.produto_id} não encontrado.`);
            }

            if (!produto.disponivel) {
                throw criarErro(400, `O produto ${produto.nome} está indisponível para pedidos.`);
            }

            const subtotal = produto.preco * item.quantidade;
            totalCalculado += subtotal;

            itensCompletos.push({
                produto_id: produto.id,
                quantidade: item.quantidade,
                preco_unitario: produto.preco
            });
        }

        const novoPedido = {
            cliente,
            status: 'pendente',
            total: totalCalculado
        };

        const pedidoId = await PedidoRepository.create(novoPedido, itensCompletos);
        return await PedidoRepository.findById(pedidoId);
    }

    async listarPedidos() {
        return await PedidoRepository.findAll();
    }

    async obterPedidoPorId(id) {
        const pedido = await PedidoRepository.findById(id);
        if (!pedido) {
            throw criarErro(404, 'Pedido não encontrado.');
        }
        return pedido;
    }

    async atualizarStatus(id, novoStatus) {
        const statusValidos = ['pendente', 'preparo', 'pronto', 'entregue'];
        if (!statusValidos.includes(novoStatus)) {
            throw criarErro(400, `Status inválido. Permitidos: ${statusValidos.join(', ')}`);
        }

        const pedidoExistente = await PedidoRepository.findById(id);
        if (!pedidoExistente) {
            throw criarErro(404, 'Pedido não encontrado.');
        }

        const affectedRows = await PedidoRepository.update(id, { status: novoStatus });
        if (affectedRows === 0) {
            throw criarErro(500, 'Não foi possível atualizar o status do pedido.');
        }
        return await PedidoRepository.findById(id);
    }

    async excluirPedido(id) {
        const pedidoExistente = await PedidoRepository.findById(id);
        if (!pedidoExistente) {
            throw criarErro(404, 'Pedido não encontrado.');
        }

        const affectedRows = await PedidoRepository.delete(id);
        if (affectedRows === 0) {
            throw criarErro(500, 'Falha ao excluir pedido.');
        }
    }
}

module.exports = new PedidoService();
