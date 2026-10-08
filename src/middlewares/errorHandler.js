const multer = require("multer");

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        sucesso: false,
        erro: "A imagem deve ter no máximo 5 MB.",
      });
    }

    return res.status(400).json({
      sucesso: false,
      erro: err.message,
    });
  }

  return res.status(500).json({
    sucesso: false,
    erro: err.message || "Erro interno do servidor",
  });
}

module.exports = errorHandler;
