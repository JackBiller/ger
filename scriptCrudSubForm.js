
var configSubFormForm_Global = [
	{ h3: { text: 'SUB-FORM' } },
	{ input: { text: 'Nome Sub-Form'	, id: 'nomeSubForm' 	, classDiv: 'col-md-4' } },
	{ input: { text: 'Sub-Form'			, id: 'subForm' 		, list: 'listPaginas' , classDiv: 'col-md-4' 
		, onblur: () => { carregarTipSubForm(); }
	} },
	{ input: { text: 'Param Sub-Form'	, id: 'paramSubForm' 	, list: 'listFields' , classDiv: 'col-md-4' } },
	{ button: { desc: 'Adicionar Sub-Form', classDiv: 'col-md-6'
		, icon: 'plus', class: 'btn btn-success btn-block'
		, click: () => { adicionarSubForm(); }
	} },
	{ button: { desc: 'Novo Sub-Form', classDiv: 'col-md-6'
		, icon: 'file', class: 'btn btn-info btn-block'
		, click: () => { novoSubForm(); }
	} },
	{ div: { id: 'tipSubForm' } },
	{ div: { id: 'gradeSubForm', classDiv: 'col-md-12' } },
]

function initFormSubForm() { 
	$("#subFormsDiv").html(resolvConfig(configSubFormForm_Global, 1, true));
	$("body").append(resolvConfigModal(configSubFormForm_Global));
}

function carregarTipSubForm() { 
	var inputs = [];
	var paginas = configJson_Global.paginas.filter(config => config.descricao != resolvVal("descricao"));

	(paginas.filter(config => config.descricao == resolvVal('subForm')) || [])
		.forEach(config => { 
			inputs = inputs.concat(config.campos.map(campo => campo.Field));
		});
	inputs = inputs.filter((v,i,a) => a.indexOf(v) == i);

	$("#tipSubForm").html(''
		+ 	'<datalist id="listPaginas">'
		+ paginas.map(config => ''
			+ 	'<option value="' + config.descricao + '">'
		).join('')
		+ 	'</datalist>'
		+ 	'<datalist id="listFields">'
		+ inputs.map(input => ''
			+ 	'<option value="' + input + '">'
		).join('')
		+ 	'</datalist>'
	)
}

function adicionarSubForm() { 
	var origin_form 	= resolvVal("descricao");
	var nomeSubForm 	= resolvVal("nomeSubForm");
	var subForm 		= resolvVal("subForm");
	var paramSubForm 	= resolvVal("paramSubForm");
	var obj = { nomeSubForm, subForm, paramSubForm };


	if (origin_form 	== '') return alert('Informe o formulário pai!');
	if (nomeSubForm 	== '') return alert('Informe o formulário Nome do Sub-form!');
	if (subForm 		== '') return alert('Informe o formulário filho!');
	if (paramSubForm 	== '') return alert('Informe o Param Sub-Form!');

	var indicePg = configJson_Global.paginas.map(d => d.descricao).indexOf(origin_form);
	if (indicePg < 0) return alert('Formulario pai não é valido!');

	if ((configJson_Global.paginas[indicePg].subForm || '') == '') configJson_Global.paginas[indicePg].subForm = [];

	var indice = configJson_Global.paginas[indicePg].subForm.map(sf => sf.subForm).indexOf(subForm);

	if (indice < 0) configJson_Global.paginas[indicePg].subForm.push(obj)
	else 			configJson_Global.paginas[indicePg].subForm[indiceo] = obj;
	montarGradeSubForm();
	novoSubForm();
}

function novoSubForm() { 
	clearForm(configSubFormForm_Global);
	carregarTipSubForm();
}

function editarSubForm(obj) { 
	resolvVal("nomeSubForm", obj.nomeSubForm);
	resolvVal("subForm", obj.subForm);
	resolvVal("paramSubForm", obj.paramSubForm);
	carregarTipSubForm();
}

function apagarSubForm(obj) { 
	var origin_form = resolvVal("descricao");

	var indicePg = configJson_Global.paginas.map(d => d.descricao).indexOf(origin_form);
	if (indicePg < 0) return alert('Formulario pai não é valido!');

	var indice = configJson_Global.paginas[indicePg].subForm.map(sf => sf.subForm).indexOf(obj.subForm);
	if (indice < 0) return alert('Informe o item de sub-form!');
	if (!confirm("Deseja apagar item de sub-form?")) return;
	configJson_Global.paginas[indicePg].subForm.splice(indice, 1);
	montarGradeSubForm();
}

function montarGradeSubForm() { 
	var origin_form = resolvVal("descricao");
	var indicePg = configJson_Global.paginas.map(d => d.descricao).indexOf(origin_form);
	if (indicePg < 0) return;

	$("#gradeSubForm").html(
		((configJson_Global.paginas[indicePg].subForm || []).length == 0 ? '' : ''
			+ resolvGrade((configJson_Global.paginas[indicePg].subForm || []), {
				inputs: [
					{ head: 'Nome Sub-form' 	, param: 'nomeSubForm' 	},
					{ head: 'Sub-form' 			, param: 'subForm' 		},
					{ head: 'Param Sub-form' 	, param: 'paramSubForm' },
					{ head: '' , tdClick: 'editarSubForm'
						, param: dt => resolvConfig({ button: { 
							class: 'btn btn-warning', icon: 'pencil'
						}})
					},
					{ head: '' , tdClick: 'apagarSubForm'
						, param: dt => resolvConfig({ button: { 
							class: 'btn btn-danger', icon: 'times'
						}})
					},
				],
				descForm: 'gradeSubForm',
				no_scrollX: true,
				languageJson: '../../../js/Portuguese.json'
			})
		)
	);
}

function gerarArquivoSubForm(obj, options, ck_controller=false) { 
	// obj similar ao configJson_Global
	/*
		options: { 
			DESC_FORM
			TITULO_PAGINA
			TABELA_BD
			PARAM_SUBFORM
			DESC_PAI_FORM
			TABELA_PAI_BD
			PARAM_PAI_ID
		}
	*/
	var constantes = gerarConstantesCrud(obj, options);
	constantes.PARAM_SUBFORM = options.PARAM_SUBFORM;
	constantes.DESC_PAI_FORM = options.DESC_PAI_FORM;
	constantes.TABELA_PAI_BD = options.TABELA_PAI_BD;
	constantes.PARAM_PAI_ID = options.PARAM_PAI_ID;

	var constantesKeys = Object.keys(constantes);
	var nameBlackCode = ck_controller ? "SUBFORM_CONTROLLER" : "SUBFORM";

	var data = blockCodes_Global.find(b => b.name == nameBlackCode).ctx.replace(
		new RegExp(constantesKeys[0], 'g'), 
		typeof constantes[constantesKeys[0]] == 'string' 
			? constantes[constantesKeys[0]] : JSON.stringify(constantes[constantesKeys[0]])
	)

	constantesKeys.forEach(constante => { 
		data = data.replace(
			new RegExp(constante, 'g'),
			typeof constantes[constante] == 'string' 
				? constantes[constante] : JSON.stringify(constantes[constante])
		)
	});
	return data;
}
