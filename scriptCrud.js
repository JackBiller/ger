
/*

Constantes: 
	DESC_FORM
	PARAM_ID

Constantes Views:
	TITULO_PAGINA
	JSON_FORM_PAGINA
	JSON_INPUTS_CONSULTA

Constantes Controller:
	VAR_FORM
	TABELA_BD
	CAMPOS_CADASTRO
	VALUES_CADASTRO
	CAMPOS_UPDATE
	AND_INATIVO
	SET_INATIVO
	CAMPO_INATIVO

*/

var config_Global = [
	{ codigoConsulta: {
		select: { text: 'Tabela', value: 'DS_TABELA', desc: 'DS_TABELA' },
		descForm: 'tabelaBd', id: 'DS_TABELA',
		dist: 'S', xs: '12',
		param: { 'buscarTabela': true, path_admin: () => configJsonGeral_Global.path_admin }
	} },
	{ input: { text: 'TITULO_PAGINA', input: 'titulo' 	, id: 'titulo' } },
	{ input: { text: 'DESC_FORM'	, input: 'descricao' , id: 'descricao', required: true } },
	{ br: {} },
	{ button: { desc: 'Gerar', class: 'btn btn-info'
		, click: () => { gerarArquivo(); } 
	} },
	{ button: { desc: 'Salvar', class: 'btn btn-success'
		, click: () => { salvarCampo(); } 
	} },
	{ button: { desc: 'Novo', class: 'btn btn-primary'
		, click: () => { novoFormulario(); } 
	} },
	{ button: { desc: 'Carregar Campos', class: 'btn btn-warning'
		, click: () => { carregarCampos(); } 
	} },
	// { div: { id: 'colunasTabela', style: { 'margin-top':'15px' } } },
]
function initFormCrud() { 
	$("#formularioCadastro").html(resolvConfig(config_Global, 1, true));
	$("body").append(resolvConfigModal(config_Global));
}

var constantes_Global = {};
var processarArquivos_Global;
var indiceProcessarArquivos_Global;
function gerarArquivo() { 
	getCampos();

	var origin_form = resolvVal("descricao");
	var indicePg = configJson_Global.paginas.map(d => d.descricao).indexOf(origin_form);
	if (indicePg < 0) return;

	constantes_Global = gerarConstantesCrud(camposTabela_Global, {
		DESC_FORM: resolvVal("descricao"),
		TITULO_PAGINA: resolvVal("titulo"),
		TABELA_BD: resolvVal('tabelaBd','select'),
		PARAM_SUBFORM: '',
		INDICE_PAG: indicePg,
	});

	processarArquivos_Global = [
		{ path: './crud/view.html'			, ctx: '' , ext: 'html', dist: '../../../view/' },
		{ path: './crud/controller.html'	, ctx: '' , ext: 'php' , dist: '../../../controller/config/' },
	];
	indiceProcessarArquivos_Global = 0;
	processarArquivos();
}

function gerarConstantesCrud(obj, options) { 
	var constantes = { 
		DESC_FORM: options.DESC_FORM,
		TITULO_PAGINA: options.TITULO_PAGINA,
		TABELA_BD: options.TABELA_BD,
		PARAM_ID: ((obj.find(d => d.Key == 'PRI') || {}).Field 
			|| 'ID_' + options.TABELA_BD),
		SET_INATIVO: obj.filter(d => d.inativo).length,
		CAMPO_INATIVO: '',
		AND_INATIVO: '',
		CAMPOS_CADASTRO: obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || '')).map(d => d.Field).join(','),
		VALUES_CADASTRO: obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || ''))
			.map(d =>  isTypeString(d.Type) ? `'$${d.Field}'` : `$${d.Field}` )
			.join(','),
		CAMPOS_UPDATE: obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || ''))
			.map(d => d.Field + ' = ' + (isTypeString(d.Type) ? `'$${d.Field}'` : `$${d.Field}`) )
			.join('\n\t\t\t\t,'),
		CAMPOS_SELECT: obj.filter(d => (d.consulta || d.cadastro || d.Key == 'PRI') && d.Field != (options.PARAM_SUBFORM || ''))
			.map(d => options.TABELA_BD + '.' + d.Field)
			.join(','),
		VAR_FORM: obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || ''))
			.map(d => `$${d.Field} = empty($_POST['${d.Field}']) `
				+ `? ${(isTypeString(d.Type) ? `''` : `'NULL'`)} : $_POST['${d.Field}'];`)
			.join('\n\t'),
		JSON_INPUTS_CONSULTA: obj.filter(d => d.consulta)
			.map(d => returnCampoInputConsulta(d)),
		INNER_JOIN_SELECT: '',
		BLOCK_CODE_CONTROLLER: '',
		BLOCK_CODE_SUBFORM: '',
		DISPLAY_SUBFORM: (configJson_Global.paginas[options.INDICE_PAG].subForm || []).length == 0 ? 'none' : 'block',
		ABAS_SUBFORM: jsonToString((configJson_Global.paginas[options.INDICE_PAG].subForm || []).map(subForm => ({
			text: subForm.nomeSubForm,
			ctx: { div: { id: 'subForm' + subForm.paramSubForm + '_' + subForm.subForm } }
		})))
	};

	(['BLOCK_CODE_SUBFORM','BLOCK_CODE_CONTROLLER']).forEach((param,i) => { 
		constantes[param] = (configJson_Global.paginas[options.INDICE_PAG].subForm || []).map(subForm => { 
			// var pagina = (configJson_Global.paginas.find(pag => pag.descricao == subForm.subForm) || {});
			var indice = configJson_Global.paginas.map(pag => pag.descricao).indexOf(subForm.subForm);
			if (indice < 0) return '';

			return gerarArquivoSubForm(
				(configJson_Global.paginas[indice].campos || []),
				{ 
					DESC_FORM: subForm.paramSubForm + '_' + subForm.subForm,
					TITULO_PAGINA: subForm.nomeSubForm,
					TABELA_BD: (configJson_Global.paginas[indice].tabelaBd || ''),
					PARAM_SUBFORM: subForm.paramSubForm,
					DESC_PAI_FORM: options.DESC_FORM,
					TABELA_PAI_BD: constantes.TABELA_BD,
					PARAM_PAI_ID: constantes.PARAM_ID,
					INDICE_PAG: indice,
				}
				, i
			);
		}).join('\n')
	});

	constantes.JSON_FORM_PAGINA = obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || ''))
		.map(d => returnCampoForm(d, constantes));

	constantes = returnCosntates(constantes, obj.filter(d => d.cadastro && d.Field != (options.PARAM_SUBFORM || '')));

	if (!obj.find(d => d.Key == "PRI").cadastro) { 
		var paramId = obj.find(d => d.Key == "PRI");
		constantes.JSON_FORM_PAGINA.push({
			input: { type: 'hidden', value: '0', id: paramId.Field 
				, input: paramId.Field 
			}
		});
	}

	constantes.JSON_INPUTS_CONSULTA = formatJsonArray(constantes.JSON_INPUTS_CONSULTA,5);
	constantes.JSON_FORM_PAGINA = formatJsonArray(constantes.JSON_FORM_PAGINA,3);

	if (constantes.SET_INATIVO) { 
		var inativo = obj.find(d => d.inativo).Field;
		constantes.CAMPO_INATIVO = options.TABELA_BD + '.' + inativo;
		constantes.AND_INATIVO = '\n\t\t\tAND ' + options.TABELA_BD + '.' + inativo + ' = 0';
	}

	return constantes;
}

function isTypeString(type) { 
	return type.indexOf('char') >= 0 || type.indexOf('text') >= 0;
}

function formatJsonArray(json,tab) { 
	json = jsonToString(json,tab,true);
	json = json.split('\n');
	json.splice(0,1);
	json.splice(json.length-1,1);
	return json.join('\n');
}

function processarArquivos() { 
	if (indiceProcessarArquivos_Global >= processarArquivos_Global.length) { 
		indiceProcessarArquivos_Global = 0
		return gravarArquivosProcessados();
	}
	$.ajax({
		url: processarArquivos_Global[indiceProcessarArquivos_Global].path + "?" + (new Date()).toString(),
		dataType: 'text'
	}).done(function(data) { 
		var constantes = Object.keys(constantes_Global);

		constantes.forEach(constante => {
			data = data.replace(
				new RegExp(constante, 'g'),
				typeof constantes_Global[constante] == 'string' 
					? constantes_Global[constante] : JSON.stringify(constantes_Global[constante])
			)
		});
		processarArquivos_Global[indiceProcessarArquivos_Global].ctx = data;
		indiceProcessarArquivos_Global++;
		processarArquivos();
	});
}

function gravarArquivosProcessados() { 
	if (indiceProcessarArquivos_Global >= processarArquivos_Global.length) { 
		linksController();
		return alert('Arquivos gerados com sucesso!');
	}

	$.ajax({
		url: 'controller.php',
		type: 'POST',
		dataType: 'text',
		data: { 
			'gerarArquivo': true,
			'file': processarArquivos_Global[indiceProcessarArquivos_Global].dist 
				+ resolvVal("descricao") + '.'
				+ processarArquivos_Global[indiceProcessarArquivos_Global].ext,
			'ctx': processarArquivos_Global[indiceProcessarArquivos_Global].ctx
		}
	}).done(function(data) { 
		console.log(data);
		indiceProcessarArquivos_Global++;
		gravarArquivosProcessados();
	});
}

function montarGradePaginas() { 
	$("#listaPaginas").html(''
		+ ((configJson_Global.paginas.length || 0) == 0 ? 'Nenhum formulario cadastrado!' : ''
			+ resolvGrade(configJson_Global.paginas, {
				inputs: [
					{ head: 'Titulo'	, param: 'titulo' 		},
					{ head: 'Descrição'	, param: 'descricao' 	},
					{ head: 'Tabela'	, param: 'tabelaBd' 	},
					{ head: '', align: 'center'
						, param: dt => resolvConfig({
							button: { class: 'btn btn-warning', icon: 'pencil' }
						})
						, tdClick: 'editarFormulario'
					},
					{ head: '', align: 'center'
						, param: dt => resolvConfig({
							button: { class: 'btn btn-danger', icon: 'times' }
						})
						, tdClick: 'apagarFormulario'
					},
				],
				descForm: 'gradePaginas',
				no_scrollX: true,
				languageJson: '../../../js/Portuguese.json'
			})
		)
	)
}

function editarFormulario(obj) { 
	console.log(obj);
	obj.DS_TABELA = obj.tabelaBd;
	setForm(obj, config_Global);

	camposTabela_Global = (obj.campos || []);
	montarGradeCampos(obj.tabelaBd);
	montarGradeSubForm();
	carregarTipSubForm();
}

function apagarFormulario(obj) { 
	if (!confirm(`Deseja apagar ${obj.titulo}?`)) return;

	var indice = configJson_Global.paginas.map(d => d.descricao).indexOf(obj.descricao);
	if (indice >= 0) { 
		configJson_Global.paginas.splice(indice, 1);
		salvarArquivo();
	}
}

function novoFormulario() { 
	clearForm(config_Global);
}

var camposTabela_Global = [];
function carregarCampos() { 
	var tabelaBd = resolvVal('tabelaBd','select');
	if (tabelaBd == '') return alert('Informe a tabela!');

	ajax({
		param: { 'carregarCampos': true, tabelaBd },
		done:function(data) { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);
			var grade = data[0].debug;

			if (grade == 'OK') { 
				data.forEach((dt, j) => { 
					var i = camposTabela_Global.map(dt => dt.Field).indexOf(dt.Field)
					if (i >= 0) { 
						camposTabela_Global[i] = $.extend({}, camposTabela_Global[i], dt);
					} else { 
						camposTabela_Global.splice(j, 0, dt);
					}
				});
			} else {
				camposTabela_Global = [];
			}
			montarGradeCampos(tabelaBd);
		}
	})
}

function montarGradeCampos(tabelaBd) { 
	var grade = 'Nenhum resultado encontrado!';
	var data = camposTabela_Global;
	if (data.length > 0) { 
		grade = resolvGrade(data, { 
			inputs: [ 
				{ head: 'Descrição'	, param: dt => resolvConfig({ input: { 
					data: { id: dt.Field }, value: (dt.descricao || dt.Field), name: 'descricao'
				} }) },
				{ head: 'Field'		, param: 'Field' 	},
				{ head: 'Type'		, param: 'Type' 	},
				{ head: 'Null'		, param: 'Null' 	}, 
				// { head: 'Key'		, param: 'Key' 		}, 
				// { head: 'Default'	, param: 'Default' 	}, 
				// { head: 'Extra'		, param: 'Extra' 	},
				{ head: 'Cadastro'	, align: 'center'
					, param: dt => resolvConfig({ input: { type: 'checkbox'
						, name: 'cadastro', data: { id: dt.Field }
						, style: { 'width':'20px' }, no_desc: true
						, checked: dt.cadastro
					} })
				},
				{ head: 'Consulta'	, align: 'center'
					, param: dt => resolvConfig({ input: { type: 'checkbox'
						, name: 'consulta', data: { id: dt.Field }
						, style: { 'width':'20px' }, no_desc: true
						, checked: dt.consulta
					} })
				},
				{ head: 'Inativo'	, align: 'center'
					, param: dt => resolvConfig({ input: { type: 'checkbox'
						, name: 'inativo', data: { id: dt.Field }
						, style: { 'width':'20px' }, no_desc: true
						, checked: dt.inativo
					} })
				},
				{ head: 'Config'	, align: 'center', tdClick: 'configurarCampo'
					, param: dt => resolvConfig({ button: { icon: 'gear', class: 'btn btn-info' } })
				},
			],
			descForm: 'gradeColunasTabela',
			no_scrollX: true,
			no_dataTable: true,
			languageJson: '../../../js/Portuguese.json'
		});
	}
	$("#colunasTabela").html(''
		+ resolvConfig({ h3: { text: 'Tabela: ' + tabelaBd } })
		+ grade
	);	
}

var configCampo_Global;
function configurarCampo(campo) { 
	console.log(campo);
	var boleano = campo.Type == 'int(1)';
	configCampo_Global = campo;

	$("#conteudoConfigurarCampo").html(resolvConfig({ row: [
		{ input: { id: 'lg', text: 'lg', value: (campo.lg || 12), classDiv: 'col-md-3' } },
		{ input: { id: 'md', text: 'md', value: (campo.md || 12), classDiv: 'col-md-3' } },
		{ input: { id: 'sm', text: 'sm', value: (campo.sm || 12), classDiv: 'col-md-3' } },
		{ input: { id: 'xs', text: 'xs', value: (campo.xs || 12), classDiv: 'col-md-3' } },
		{ br: {} },
		{ input: { type: 'radio', name: 'tipoCampo', radio: [
			{ text: 'Texto / Numero' 	, id: 'ck_textoNumero'		, click: () => { formTextoNumCampo(); } 		, checked: checkedCampo(campo,'ck_textoNumero',!boleano) },
			{ text: 'Boleano' 			, id: 'ck_boleano'			, click: () => { formEmptyCampo(); } 			, checked: checkedCampo(campo,'ck_boleano',boleano) },
			{ text: 'Enum' 				, id: 'ck_enum'				, click: () => { formEnumCampo(); } 			, checked: checkedCampo(campo,'ck_enum') },
			{ text: 'Arquivo' 			, id: 'ck_arquivo'			, click: () => { formArquivoCampo(); } 			, checked: checkedCampo(campo,'ck_arquivo') },
			{ text: 'Codigo Consulta' 	, id: 'ck_codigoConsulta'	, click: () => { formCodigoConsultaCampo(); } 	, checked: checkedCampo(campo,'ck_codigoConsulta') },
		] } },
		{ div: { id: 'formAdicional', isRow: '', class: 'col-md-12', style: { "margin-top": '15px' } } },
	]}))
	$("#infoConfigurarCampo").html(campo.Field);

	var tipoCampo = document.getElementsByName('tipoCampo');
	for (var i = 0; i < tipoCampo.length; i++) { 
		if (tipoCampo[i].checked) tipoCampo[i].click();
	}
	$("#configuraCampo").modal('show');
}

function checkedCampo(campo, id, ck_pre=false) { 
	if (campo[id] == undefined) return ck_pre;
	return campo[id];
}

function salvarConfiguraCampo() { 
	var Field = $("#infoConfigurarCampo").html();
	var indice = camposTabela_Global.map(d => d.Field).indexOf(Field);

	if (indice >= 0) { 
		var inputs = $("#conteudoConfigurarCampo").find('input');
		for (let i = 0; i < inputs.length; i++) { 
			if ($(inputs[i]).data('ignore') != 'true') { 
				camposTabela_Global[indice][$(inputs[i]).attr('id')] = 
					['checkbox','radio'].indexOf($(inputs[i]).attr('type')) < 0 ? inputs[i].value : inputs[i].checked;
			}
		}
	}

	/** Resolv Enum */
	if ($("#ck_enum")[0].checked) 	camposTabela_Global[indice].enum = configCampo_Global.enum;
	else 							camposTabela_Global[indice].enum = undefined;

	/** Resolv Codigo Consulta */
	['codc_descricao','codc_id','codc_consulta','codc_inativo'].forEach(nome => {
		var campos = document.getElementsByName(nome), campoRef, indiceRef;
		for (var i = 0; i < campos.length; i++) {
			campoRef = $(campos[i]).data('id');
			indiceRef = camposTabelaCodc_Global.map(c => c.Field).indexOf(campoRef);
			if (indiceRef >= 0) { 
				camposTabelaCodc_Global[indiceRef][nome] = 
					['checkbox','radio'].indexOf($(campos[i]).attr('type')) < 0 ? campos[i].value : campos[i].checked;
			}
		}
	});
	camposTabela_Global[indice].camposCodc = camposTabelaCodc_Global;

	$("#configuraCampo").modal('hide');
	salvarCampo();
}

function salvarCampo() { 
	var { param } = getForm(config_Global);
	var indice = configJson_Global.paginas.map(c => c.descricao).indexOf(param.descricao);

	if (((param || {}).descricao || '') == '') return;

	if (indice < 0) { 
		indice = configJson_Global.paginas.length;
		configJson_Global.paginas.push(param)
	} else { 
		configJson_Global.paginas[indice] = $.extend(configJson_Global.paginas[indice], param);
	}
	getCampos();
	salvarArquivo();
}

function getCampos() { 
	['descricao','cadastro','consulta','inativo'].forEach(name => { 
		var inputs = document.getElementsByName(name), indice, type;
		for (var i = 0; i < inputs.length; i++) {
			indice = camposTabela_Global.map(d => d.Field).indexOf($(inputs[i]).data('id'));
			if (indice >= 0) { 
				type = $(inputs[i]).attr('type');
				camposTabela_Global[indice][name] = inputs[i][type == 'checkbox' ? 'checked' : 'value'];
			}
		}
	});

	var descricao = resolvVal('descricao');
	indice = configJson_Global.paginas.map(p => p.descricao).indexOf(descricao);
	if (indice >= 0) { 
		configJson_Global.paginas[indice].campos = camposTabela_Global;
	}
}

function returnCampoForm(obj, constantes) { 
	/*
		back-end
			quando houver campo estrangeiro tem que resolver inner join na query principal

			'upload' + resolvVal("descricao")
				rotina de upload de arquivo quando houver
			'codigo' + obj.Field + '_' + resolvVal("descricao")
				rotina para listar campo de tabela estrangeira quando houver

		------------------------------------------------------------------------------------

		lg md sm xs

		- Tipo Campo
			ck_textoNumero: (0|1)
			ck_boleano: (0|1)
			ck_enum: (0|1)
			ck_arquivo: (0|1)
			ck_codigoConsulta: (0|1)

		- Enum -- um array do campo
			value
			desc

		- Arquivo 
			defaultImg: ''
			fileType: (0|1)
			ck_webCam: (0|1)
			ck_buscaGoogle: (0|1)

		- Grade Codigo Consulta
			tabelaCodc
			ck_selectConsulta: (0|1)
				selectText: ''
				selectValue: ''
				selectDesc: ''
			ck_codigoCodigoConsulta: (0|1)
				codigoText: ''
				codigoInput: ''
				descricaoText: ''
				descricaoInput: ''
			camposCodc
				Default: "0"
 				Extra: ""
				Field: "CK_INATIVO"
				Key: ""
				Null: "NO"
				Type: "int(1)"
				codc_descricao: ''
				codc_id: (0|1)
				codc_consulta: (0|1)
				codc_inativo: (0|1)
	*/
	var classDiv = '';
	['lg','md','sm','xs'].forEach((t,i) => { 
		classDiv += `${(i == 0 ? '' : ' ')}col-${t}-${(obj[t] || '12')}`;
	});

	if (obj.ck_textoNumero || obj.ck_textoNumero == undefined) { 
		var objReturn = {};
		objReturn[(obj.ck_textarea ? 'textarea' : 'input')] = { id: obj.Field, classDiv
			, text: obj.descricao
			, input: obj.Field
			, rows: (obj.textarea_rows || '')
			, required: obj.Null.toUpperCase().replace(/ /g, '') == 'NO'
		}
		return objReturn;
	}

	if (obj.ck_boleano) { 
		return { input: { name: obj.Field, type: 'radio', classDiv
			, required: obj.Null.toUpperCase().replace(/ /g, '') == 'NO'
			, input: obj.Field
			, radio: [ { text: 'Sim' },{ text: 'Não' } ]
		} };
	}

	if (obj.ck_enum) { 
		return { input: { id: obj.Field, classDiv
			, text: obj.descricao
			, input: obj.Field
			, required: obj.Null.toUpperCase().replace(/ /g, '') == 'NO'
			, enum: JSON.parse('{' + obj.enum.map(e => `"${e.value}":"${e.desc}"`).join(',') + '}')
		} };
	}

	if (obj.ck_arquivo) { 
		// BLOCK_CODE_CONTROLLER

		var objReturn =  { input: { id: obj.Field, type: 'file', classDiv
			, text: 			obj.descricao
			, input: 			obj.Field
			, required: 		obj.Null.toUpperCase().replace(/ /g, '') == 'NO'
			// , path: 			'../img/' + (obj.pathFile || 'upload')
			, defaultImg: 		obj.defaultImg
			, ck_webCam: 		obj.ck_webCam
			, ck_buscaGoogle: 	obj.ck_buscaGoogle
			// , upload: { param: JSON.parse(`{ "upload${resolvVal("descricao")}": true }`) }
			// , upload: { param: {} }
			, upload: { }
		} };
		if ((obj.fileType || false)) objReturn.input.fileType = 'img';
		eval(''	
			+ `objReturn.input.upload.onsend = function() { `
			+ 	`return resolvVal("${constantes.PARAM_ID}") != "0" ? true : "É preciso informar um registro cadastrado!";`
			+ `}`
		)
		eval(''	
			+ `objReturn.input.upload.path = function() { `
			+ 	`return '../img/${(obj.pathFile || 'upload')}/' + resolvVal("${constantes.PARAM_ID}");`
			+ `}`
		)
		// objReturn.input.upload.param['upload' + resolvVal("descricao")] = true;
		return objReturn;
	}

	if (obj.ck_codigoConsulta) { 

		var objReturn =  { codigoConsulta: { id: obj.Field, classDiv
			, required: obj.Null.toUpperCase().replace(/ /g, '') == 'NO'
			, param: { }
			, grade: { 
				inputs: (obj.camposCodc.filter(c => c.codc_consulta).map(o => ({
					head: o.codc_descricao, param: o.Field
					, format: o.Type.indexOf('char') < 0 ? {} : undefined
				})) || [])
			}
			, descForm: obj.Field
		} };
		objReturn.codigoConsulta.param['codigo' + obj.Field + '_' + resolvVal("descricao")] = true;

		if (obj.ck_selectConsulta) { 
			objReturn.codigoConsulta.dist = 'S';
			objReturn.codigoConsulta.xs = '12';

			objReturn.codigoConsulta.select = { 
				text: 	obj.selectText,
				value: 	obj.selectValue,
				desc: 	obj.selectDesc,
			}
		} else { // ck_codigoCodigoConsulta
			objReturn.codigoConsulta.codigo = { 
				text: 	obj.codigoText,
				input: 	obj.codigoInput,
			}
			objReturn.codigoConsulta.desc = { 
				text: obj.descricaoText,
				input: obj.descricaoInput,
			}
		}
		return objReturn;
	}
	return {};
}

function returnCosntates(constantes, objs) { 
	// CAMPOS_SELECT
	// INNER_JOIN_SELECT
	// BLOCK_CODE_CONTROLLER

	/*
		constantes: 
			CAMPO_REF
			CAMPOS_SELECT
			TABELA_BD
			AND_INATIVO
	*/
	var obj;
	for (var i = 0; i < objs.length; i++) { 
		obj = objs[i];

		if (obj.ck_codigoConsulta) { 
			var constantesBlockCode = {
				CAMPO_REF: obj.Field,
				TABELA_BD: obj.tabelaCodc,
				CAMPOS_SELECT: obj.camposCodc.filter(o => o.codc_consulta || o.codc_id)
					.map(o => obj.tabelaCodc + '.' + o.Field ).join(','),
				AND_INATIVO: obj.camposCodc.find(o => o.codc_inativo) == undefined ? '' : ''
					+ "\n\t\t\tAND " + obj.tabelaCodc + '.' + obj.camposCodc.find(o => o.codc_inativo).Field + ' = 0',
			}
			var blockCode = blockCodes_Global.find(b => b.name == "CODIGO_CONSULTA_GRADE").ctx
				.replace(/DESC_FORM/g, constantes.DESC_FORM);
	
			Object.keys(constantesBlockCode).forEach(constanteBlock => {
				blockCode = blockCode.replace(new RegExp(constanteBlock, 'g'), constantesBlockCode[constanteBlock]);
			});
			constantes.BLOCK_CODE_CONTROLLER += blockCode;
		}
	}
	return constantes;
}

function returnCampoInputConsulta(obj) { 
	var objReturn = { head: obj.descricao, param: obj.Field };
	if (obj.Type.indexOf('char') < 0) { 
		objReturn.format = {};
	}
	return objReturn;
}
