const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "estoque",
  password: "viva1234",
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.post("/produtos", async (req, res) => {
  const { nome, categoria, preco, quantidade } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, categoria, preco, quantidade]
    );
    const produtoId = result.rows[0].id;
    res
      .status(201)
      .json({ message: "Produto cadastrado com sucesso!", id: produtoId });
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

app.get("/buscar-produto", async (req, res) => {
  const nome = req.query.nome;
  try {
    const result = await pool.query(
      "SELECT * FROM produtos WHERE LOWER(nome) LIKE LOWER($1)",
      [`%${nome}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/produtos/id/:id", async (req, res) => {
  const idProduto = req.params.id;
  try {
    const result = await pool.query(
      "DELETE FROM produtos WHERE id = $1 RETURNING *",
      [idProduto]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
