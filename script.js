let produtos = [];

function carregarProdutos() {
  fetch("http://localhost:3000/produtos")
    .then((response) => response.json())
    .then((data) => {
      const produtosDiv = document.getElementById("produtos-cadastrados");
      produtosDiv.innerHTML = "<h3>Produtos Cadastrados:</h3>";

      if (data.length > 0) {
        data.forEach((produto) => {
          const preco = parseFloat(produto.preco);
          produtosDiv.innerHTML += `<p>${produto.nome_produto} - Categoria: ${
            produto.categoria
          } - Preço: R$${preco.toFixed(2)} - Estoque: ${
            produto.quantidade
          }</p>`;
        });
      } else {
        produtosDiv.innerHTML += `<p>Nenhum produto cadastrado ainda.</p>`;
      }
    })
    .catch((error) => {
      alert(`Erro ao carregar produtos: ${error.message}`);
    });
}

document
  .getElementById("form-cadastro-produto")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome-produto").value;
    const categoria = document.getElementById("categoria-produto").value;
    const preco = parseFloat(document.getElementById("preco-produto").value);
    const quantidade = parseInt(
      document.getElementById("quantidade-produto").value
    );

    fetch("http://localhost:3000/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome_produto: nome,
        categoria: categoria,
        preco,
        quantidade,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        e.target.reset();

        carregarProdutos();
      })
      .catch((error) => {
        alert(`Erro: ${error.message}`);
      });
  });

document.addEventListener("DOMContentLoaded", function () {
  carregarProdutos();
});

document
  .getElementById("excluir-produto")
  .addEventListener("click", function () {
    const nomeProduto = prompt("Digite o nome do produto a ser excluído:");
    if (nomeProduto) {
      fetch(`http://localhost:3000/produtos/${nomeProduto}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Erro ao excluir o produto: " + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          alert(data.message);
          carregarProdutos();
        })
        .catch((error) => {
          alert(`Erro: ${error.message}`);
        });
    } else {
      alert("Nenhum nome de produto foi fornecido.");
    }
  });

document
  .getElementById("form-busca-produtos")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeBusca = document.getElementById("busca-nome-produto").value;

    fetch(`http://localhost:3000/produtos?nome=${nomeBusca}`)
      .then((response) => response.json())
      .then((resultados) => {
        const resultadosDiv = document.getElementById("resultados-busca");
        resultadosDiv.innerHTML = `<h3>Resultados:</h3>`;
        if (resultados.length > 0) {
          resultados.forEach((produto) => {
            const preco = parseFloat(produto.preco); // Converte para número
            resultadosDiv.innerHTML += `<p>${
              produto.nome_produto
            } - Categoria: ${produto.categoria} - Preço: R$${preco.toFixed(
              2
            )} - Estoque: ${produto.quantidade}</p>`;
          });
        } else {
          resultadosDiv.innerHTML += `<p>Nenhum produto encontrado.</p>`;
        }
      })
      .catch((error) => {
        alert(`Erro: ${error.message}`);
      });
  });

document
  .getElementById("form-movimentacao-estoque")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeProduto = document.getElementById("nome-movimentacao").value;
    const tipoMovimentacao = document.getElementById("tipo-movimentacao").value; // 'entrada' ou 'saida'
    const quantidadeMovimentacao = parseInt(
      document.getElementById("quantidade-movimentacao").value
    );

    if (isNaN(quantidadeMovimentacao) || quantidadeMovimentacao <= 0) {
      alert("Por favor, insira uma quantidade válida.");
      return;
    }

    fetch(`http://localhost:3000/produtos/${nomeProduto}/movimentacao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tipoMovimentacao, quantidadeMovimentacao }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Erro ao atualizar o estoque: " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message);

        carregarProdutos();
      })
      .catch((error) => {
        alert(`Erro: ${error.message}`);
      });
  });
