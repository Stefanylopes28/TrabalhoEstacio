const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: "estoque",
  host: "localhost",
  database: "estoque",
  password: "viva1234",
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.post("/produtos", async (req, res) => {
  const { nome_produto, categoria, preco, quantidade } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome_produto, categoria, preco, quantidade) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome_produto, categoria, preco, quantidade]
    );
    res.json({
      message: "Produto cadastrado com sucesso!",
      produto: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/produtos/:nome", async (req, res) => {
  const { nome } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM produtos WHERE nome_produto = $1",
      [nome]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    res.status(200).json({ message: "Produto excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/produtos/:id", async (req, res) => {
  const idProduto = req.params.id;
  const { quantidade } = req.body;

  try {
    const result = await pool.query("SELECT * FROM produtos WHERE id = $1", [
      idProduto,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const produtoAtual = result.rows[0];
    const novaQuantidade = produtoAtual.quantidade + quantidade;

    if (novaQuantidade < 0) {
      return res.status(400).json({ message: "Estoque insuficiente" });
    }

    await pool.query("UPDATE produtos SET quantidade = $1 WHERE id = $2", [
      novaQuantidade,
      idProduto,
    ]);
    res.json({
      message: "Estoque atualizado com sucesso!",
      quantidade: novaQuantidade,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/produtos", async (req, res) => {
  try {
    const { nome } = req.query;
    const result = await pool.query(
      "SELECT * FROM produtos WHERE nome_produto = $1",
      [nome]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/produtos/:nome/movimentacao", async (req, res) => {
  const { nome } = req.params;
  const { tipoMovimentacao, quantidadeMovimentacao } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM produtos WHERE nome_produto = $1",
      [nome]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const produto = result.rows[0];
    let novaQuantidade = produto.quantidade;

    if (tipoMovimentacao === "entrada") {
      novaQuantidade += quantidadeMovimentacao;
    } else if (tipoMovimentacao === "saida") {
      novaQuantidade -= quantidadeMovimentacao;
      if (novaQuantidade < 0) {
        return res.status(400).json({ error: "Estoque insuficiente." });
      }
    } else {
      return res.status(400).json({ error: "Tipo de movimentação inválido." });
    }

    await pool.query(
      "UPDATE produtos SET quantidade = $1 WHERE nome_produto = $2",
      [novaQuantidade, nome]
    );

    res.json({ message: "Estoque atualizado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o estoque." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
