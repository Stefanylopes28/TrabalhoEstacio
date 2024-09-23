let produtos = [];

async function carregarProdutos() {
  try {
    const response = await fetch("http://localhost:3000/produtos");
    if (response.ok) {
      produtos = await response.json();
      produtos.forEach((produto) => {
        produto.preco = parseFloat(produto.preco);
      });
      exibirProdutosCadastrados();
    } else {
      console.error("Erro ao carregar produtos");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

function exibirProdutosCadastrados() {
  const listaProdutosDiv = document.getElementById("lista-produtos");
  listaProdutosDiv.innerHTML = "";

  if (produtos.length > 0) {
    produtos.forEach((produto) => {
      const precoFormatado = produto.preco.toFixed(2);
      listaProdutosDiv.innerHTML += `
                <div>
                    <p>${produto.nome} - Categoria: ${produto.categoria} - Preço: R$${precoFormatado} - Estoque: ${produto.quantidade} - ID: ${produto.id}</p>
                    <button onclick="excluirProduto(${produto.id})" style="background-color: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Excluir</button>
                </div>
            `;
    });
  } else {
    listaProdutosDiv.innerHTML = `<p>Nenhum produto cadastrado.</p>`;
  }
}

async function excluirProduto(id) {
  try {
    const response = await fetch(`http://localhost:3000/produtos/id/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      alert("Produto excluído com sucesso!");
      await carregarProdutos();
    } else {
      const error = await response.json();
      alert(`Erro ao excluir produto: ${error.message}`);
    }
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
}

document
  .getElementById("cadastro-produtos")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome-produto").value;
    const categoria = document.getElementById("categoria-produto").value;
    const preco = parseFloat(document.getElementById("preco-produto").value);
    const quantidade = parseInt(
      document.getElementById("quantidade-produto").value
    );

    const produto = { nome, categoria, preco, quantidade };

    try {
      const response = await fetch("http://localhost:3000/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Produto "${nome}" cadastrado com sucesso! ID: ${data.id}`);
        e.target.reset();
        await carregarProdutos();
      } else {
        const error = await response.json();
        alert(`Erro ao cadastrar o produto: ${error.message}`);
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  });

function buscarProdutoPorId(id) {
  return produtos.find((prod) => prod.id === id);
}

document
  .getElementById("form-busca-produtos")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeProduto = document
      .getElementById("busca-nome-produto")
      .value.toLowerCase();
    const resultadosDiv = document.getElementById("resultados-busca");

    const produtosEncontrados = produtos.filter((prod) =>
      prod.nome.toLowerCase().includes(nomeProduto)
    );

    resultadosDiv.innerHTML = `<h3>Resultados da Busca:</h3>`;
    if (produtosEncontrados.length > 0) {
      produtosEncontrados.forEach((produto) => {
        resultadosDiv.innerHTML += `
                <div>
                    <p>${produto.nome} - Categoria: ${
          produto.categoria
        } - Preço: R$${produto.preco.toFixed(2)} - Estoque: ${
          produto.quantidade
        } - ID: ${produto.id}</p>
                </div>
            `;
      });
    } else {
      resultadosDiv.innerHTML += `<p>Nenhum produto encontrado.</p>`;
    }
  });

document
  .getElementById("abrir-modal-atualizacao")
  .addEventListener("click", function () {
    document.getElementById("modal-atualizacao").style.display = "block";
  });

document
  .getElementById("buscar-produto")
  .addEventListener("click", function () {
    const idProduto = parseInt(document.getElementById("id-produto").value);
    const produto = produtos.find((prod) => prod.id === idProduto);

    const detalhesProduto = document.getElementById("detalhes-produto");
    const informacoesProduto = document.getElementById("informacoes-produto");

    if (produto) {
      detalhesProduto.innerHTML = `Produto: ${produto.nome} - Estoque Atual: ${produto.quantidade}`;
      informacoesProduto.style.display = "block";
    } else {
      alert("Produto não encontrado.");
      informacoesProduto.style.display = "none";
    }
  });

document
  .getElementById("form-atualizacao-estoque")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const idProduto = parseInt(document.getElementById("id-produto").value);
    const tipoMovimentacao = document.getElementById("tipo-movimentacao").value;
    const quantidade = parseInt(
      document.getElementById("quantidade-movimentacao").value
    );
    const produto = buscarProdutoPorId(idProduto);

    if (!produto) {
      alert("Produto não encontrado. Atualização não realizada.");
      return;
    }

    const quantidadeMovimentacao =
      tipoMovimentacao === "entrada" ? quantidade : -quantidade;

    try {
      const response = await fetch(
        `http://localhost:3000/produtos/${idProduto}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantidade: quantidadeMovimentacao }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(
          `Estoque atualizado com sucesso! Novo estoque: ${data.quantidade}`
        );
        document.getElementById("form-atualizacao-estoque").reset();
        document.getElementById("informacoes-produto").style.display = "none";
        document.getElementById("modal-atualizacao").style.display = "none";
        await carregarProdutos();
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar o estoque: ${error.message}`);
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  });

document.addEventListener("click", function (event) {
  if (event.target === document.getElementById("modal-atualizacao")) {
    document.getElementById("modal-atualizacao").style.display = "none"; // Esconde o modal
  }
});

window.onload = carregarProdutos;
