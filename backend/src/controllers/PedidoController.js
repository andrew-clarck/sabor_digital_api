const PedidoService = require('../services/PedidoService');

function responderErro(res, error) {
    const status = error.status || 500;
    if (status === 500) {
        console.error('Erro interno ao processar pedido:', error);
    }
    return res.status(status).json({
        erro: status === 500 ? 'Erro interno do servidor' : error.message
    });
}

class PedidoController {
    async create(req, res) {
        try {
            const pedido = await PedidoService.criarPedido(req.body);
            res.status(201).json({
                mensagem: 'Pedido criado com sucesso',
                pedido
            });
        } catch (error) {
            responderErro(res, error);
        }
    }

    async getAll(req, res) {
        try {
            const pedidos = await PedidoService.listarPedidos();
            res.status(200).json(pedidos);
        } catch (error) {
            responderErro(res, error);
        }
    }

    async getById(req, res) {
        try {
            const id = req.params.id;
            const pedido = await PedidoService.obterPedidoPorId(id);
            res.status(200).json(pedido);
        } catch (error) {
            responderErro(res, error);
        }
    }

    async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const { status } = req.body || {};
            
            if (!status) {
                return res.status(400).json({ erro: 'O campo status é obrigatório.' });
            }

            const pedidoAtualizado = await PedidoService.atualizarStatus(id, status);
            res.status(200).json({
                mensagem: 'Status atualizado com sucesso',
                pedido: pedidoAtualizado
            });
        } catch (error) {
            responderErro(res, error);
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            await PedidoService.excluirPedido(id);
            res.status(200).json({ mensagem: 'Pedido excluído com sucesso' });
        } catch (error) {
            responderErro(res, error);
        }
    }
}

module.exports = new PedidoController();
