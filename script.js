let produtos = [];


document.getElementById('cadastro-produtos').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nome = document.getElementById('nome-produto').value;
    const categoria = document.getElementById('categoria-produto').value;
    const preco = parseFloat(document.getElementById('preco-produto').value);
    const quantidade = parseInt(document.getElementById('quantidade-produto').value);

    const produto = { nome, categoria, preco, quantidade };
    produtos.push(produto);
    alert(`Produto "${nome}" cadastrado com sucesso!`);

    this.reset(); 
});


document.getElementById('excluir-produto').addEventListener('click', function() {
    const nomeProduto = prompt("Digite o nome do produto a ser excluído:");
    if (nomeProduto) {
        const produtoIndex = produtos.findIndex(produto => produto.nome.toLowerCase() === nomeProduto.toLowerCase());
        if (produtoIndex !== -1) {
            produtos.splice(produtoIndex, 1);
            alert(`Produto "${nomeProduto}" excluído com sucesso.`);
        } else {
            alert(`Produto "${nomeProduto}" não encontrado.`);
        }
    }
});


document.getElementById('busca-produtos').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nomeBusca = document.getElementById('busca-nome-produto').value;
    const resultados = produtos.filter(produto => produto.nome.toLowerCase().includes(nomeBusca.toLowerCase()));

    const resultadosDiv = document.getElementById('resultados-busca');
    resultadosDiv.innerHTML = `<h3>Resultados:</h3>`;
    if (resultados.length > 0) {
        resultados.forEach(produto => {
            resultadosDiv.innerHTML += `<p>${produto.nome} - Categoria: ${produto.categoria} - Preço: R$${produto.preco.toFixed(2)} - Estoque: ${produto.quantidade}</p>`;
        });
    } else {
        resultadosDiv.innerHTML += `<p>Nenhum produto encontrado.</p>`;
    }
});

document.getElementById('form-atualizacao-estoque').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nomeProduto = document.getElementById('nome-produto').value;
    const tipoMovimentacao = document.getElementById('tipo-movimentacao').value;
    const quantidadeMovimentacao = parseInt(document.getElementById('quantidade-movimentacao').value);

    const produto = produtos.find(produto => produto.nome.toLowerCase() === nomeProduto.toLowerCase());

    if (produto) {
        if (tipoMovimentacao === 'entrada') {
            produto.quantidade += quantidadeMovimentacao;
            alert(`Entrada de ${quantidadeMovimentacao} unidades do produto "${produto.nome}" realizada com sucesso!`);
        } else if (tipoMovimentacao === 'saida') {
            if (produto.quantidade >= quantidadeMovimentacao) {
                produto.quantidade -= quantidadeMovimentacao;
                alert(`Saída de ${quantidadeMovimentacao} unidades do produto "${produto.nome}" realizada com sucesso!`);
            } else {
                alert(`Estoque insuficiente para saída de ${quantidadeMovimentacao} unidades do produto "${produto.nome}".`);
            }
        }
    } else {
        alert(`Produto "${nomeProduto}" não encontrado.`);
    }

    this.reset(); 
});
