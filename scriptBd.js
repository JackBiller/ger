
var configFormBd_Global = { row: [
	{ input: { type: 'checkbox', id: 'criarTabela', text: 'Criar Tabela' 
		, checked: true
		, classDiv: 'col-md-12'
	} },
	{ input: { id: 'nomeTabelaBD', text: 'Nome da Tabela'
		, onblur: () => { validaNomeTabela(); }
		, classDiv: 'col-md-12'
		, datalist: { 
			ajax: 'ajax', param: { 'buscarTabela': true }, input: 'DS_TABELA'
		}
	} },
	{ button: { desc: 'Novo', class: 'btn btn-primary btn-block', icon: 'file'
		, click: () => { novoTabelaBd(); }
		, classDiv: 'col-md-6'
	} },
	{ button: { desc: 'Gerar Script', class: 'btn btn-info btn-block', icon: 'gear'
		, click: () => { gerarScript(); }
		, classDiv: 'col-md-6'
	} }
]}

function initFormBd() {
	$("#formularioBd").html(resolvConfig(configFormBd_Global, 1, true));
}

function validaNomeTabela() { 
	if (!resolvVal('criarTabela')) return;

	var tabela = resolvVal('nomeTabelaBD');
	if (tabelaBd == '') return;

	ajax({
		param: { 'buscarTabela': true, tabela },
		done: function(data) { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);
			if (data[0].debug == 'OK') { 
				resolvEl('criarTabela').checked = false;
				resolvDisabled('criarTabela');
				buscarCamposTabela();
				// resolvEl('nomeTabelaBD').el.val('')[0].focus();
				// alert('Tabela já exite no sistema')
			}
		}
	});
}

function buscarCamposTabela() { 
	var tabelaBd = resolvVal('nomeTabelaBD');
	if (tabelaBd == '') return alert('Informe a tabela!');

	ajax({
		param: { 'carregarCampos': true, tabelaBd },
		done: function(data) { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);
		}
	});
}

function novoTabelaBd() { 
	clearForm(configFormBd_Global);
}

function gerarScript() { 

}

