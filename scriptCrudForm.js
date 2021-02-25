
/** Form Text / Numero */
function formTextoNumCampo() { 
	var form = resolvConfig([
		{ input: { id: 'ck_textarea', text: 'É textarea', type: 'checkbox', checked: (configCampo_Global.ck_textarea || false) } },
		{ input: { id: 'textarea_rows', text: 'Rows', type: 'number', value: (configCampo_Global.textarea_rows || '') } },
	]);
	$("#formAdicional").html(form);
}

/** Form Vazio */
function formEmptyCampo() {
	$("#formAdicional").html('');
}

/** Form Enum */
function formEnumCampo() { 
	var form = resolvConfig([
		{ h5: { text: '<option value="Value">Desc</option>' } },
		{ input: { data: { ignore: 'true' } , id: 'enum_value'		, text: 'Value' 	} },
		{ input: { data: { ignore: 'true' } , id: 'enum_desc'		, text: 'Desc' 		} },
		{ input: { data: { ignore: 'true' } , id: 'enum_valueRef'	, type: 'hidden' 	} },
		{ button: { class: 'btn btn-success btn-block'
			, desc: 'Salvar Item', icon: 'plus'
			, styleDiv: { 'margin-top':'15px' }
			, click: () => { salvarItemEnum(); }
		} },
		{ button: { class: 'btn btn-primary btn-block'
			, desc: 'Novo Item', icon: 'file'
			, styleDiv: { 'margin-top':'15px' }
			, click: () => { novoItemEnum(); }
		} },
		{ div: { id: 'gradeItemEnum', style: { 'margin-top':'15px' } } }
	])
	// configCampo_Global
	$("#formAdicional").html(form);
	montarGradeItemEnum();
}

function salvarItemEnum() { 
	var enum_value 		= $("#enum_value").val();
	var enum_desc 		= $("#enum_desc").val();
	var enum_valueRef 	= $("#enum_valueRef").val();

	if (enum_value == '') return alert('Informe Value!');
	if (enum_desc == '') return alert('Informe Desc!');

	if ((configCampo_Global.enum || '') == '') configCampo_Global.enum = [];

	var obj = { value: enum_value, desc: enum_desc };

	var indice = configCampo_Global.enum.map(e => e.value)
		.indexOf(enum_valueRef == '' ? enum_value : enum_valueRef);

	if (indice < 0) configCampo_Global.enum.push(obj);
	else 			configCampo_Global.enum[indice] = obj;

	montarGradeItemEnum();
	novoItemEnum();
}

function montarGradeItemEnum() { 
	$("#gradeItemEnum").html(''
		+ ((configCampo_Global.enum || []).length == 0 ? '' : ''
			+ resolvGrade(configCampo_Global.enum, { 
				inputs: [
					{ head: 'value', param: 'value' },
					{ head: 'desc', param: 'desc' },
					{ head: '', align: 'center', tdClick: 'editItemEnum'
						, param: dt => resolvConfig({ button: { class: 'btn btn-warning'
							, name: 'btnEditItemEnum', data: { id: dt.value }, icon: 'pencil'
						} })
					},
					{ head: '', align: 'center', tdClick: 'removeItemEnum'
						, param: dt => resolvConfig({ button: { class: 'btn btn-danger'
							, name: 'btnRemoveItemEnum', data: { id: dt.value }, icon: 'times'
						} })
					},
				],
				descForm: 'gradeOpcoesEnum',
				no_scrollX: true,
				no_dataTable: true,
				languageJson: '../../../js/Portuguese.json'
			} )
		)
	)
}

function novoItemEnum() { 
	$("#enum_value").val('');
	$("#enum_desc").val('');
	$("#enum_valueRef").val('');
}

function editItemEnum(obj) { 
	$("#enum_value").val(obj.value);
	$("#enum_desc").val(obj.desc);
	$("#enum_valueRef").val(obj.value);
}

function removeItemEnum(obj) { 
	var indice = configCampo_Global.enum.map(e => e.value).indexOf(obj.value);

	if (indice > 0) return alert('Informe um item de enum valido!');
	if(!confirm("Deseja remover item de enum?")) return;

	configCampo_Global.enum.splice(indice, 1);
	montarGradeItemEnum();
}

/** Form Arquivo */
function formArquivoCampo() { 
	var form = resolvConfig([
		{ input: { text: 'Path File' 		, id: 'pathFile' 		, type: 'text' 		, value: 	(configCampo_Global.pathFile 		|| '') } },
		{ input: { text: 'Imagem Padrão' 	, id: 'defaultImg' 		, type: 'file' 		, value: 	(configCampo_Global.defaultImg 		|| '') } },
		{ input: { text: 'É imagem' 		, id: 'fileType' 		, type: 'checkbox' 	, checked: 	(configCampo_Global.fileType 		|| false) } },
		{ input: { text: 'Usar Web Cam' 	, id: 'ck_webCam' 		, type: 'checkbox' 	, checked: 	(configCampo_Global.ck_webCam 		|| false) } },
		{ input: { text: 'Buscar Google' 	, id: 'ck_buscaGoogle' 	, type: 'checkbox' 	, checked: 	(configCampo_Global.ck_buscaGoogle 	|| false) } },
	]);
	$("#formAdicional").html(form);
}

/** Form Condigo Consulta */
function formCodigoConsultaCampo() { 
	var form = resolvConfig([
		{ input: { text: 'Botão Limpar' , id: 'ck_btnClear' , type: 'checkbox' , checked: (configCampo_Global.ck_btnClear || false) } },
		{ input: { id: 'tabelaCodc', text: 'Tabela'
			, datalist: { param: { 'buscarTabela': true }, input: 'DS_TABELA' }
			, value: (configCampo_Global.tabelaCodc || '')
		} },
		{ button: { class: 'btn btn-primary btn-block', desc: 'Buscar Campos'
			, click: () => { formCodigoConsultaTabela(); } 
		} },
		{ div: { id: 'subFormCodigoConsultaCampo' } },
	]);
	$("#formAdicional").html(form);
	if ((configCampo_Global.tabelaCodc || '') != '') formCodigoConsultaTabela();
}

var camposTabelaCodc_Global
function formCodigoConsultaTabela() { 
	var tabela = $("#tabelaCodc").val();
	if (tabela == '') return alert('Informe a tabela!');

	ajax({
		param: { 'carregarCampos': true, 'tabelaBd': tabela },
		done: function(data) { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);
			if (data[0].debug != 'OK') return alert('Tabela Invalida!');

			camposTabelaCodc_Global = $.extend(data, configCampo_Global.camposCodc);
			var click = () => { formSubgradeTipoCondigoConsulta(); }

			var form = resolvConfig([
				{ div: { text: resolvGrade(data, { 
					inputs: [
						{ head: 'Descrição'	, param: dt => resolvConfig({ input: { 
							data: { id: dt.Field, ignore: 'true' }, value: (dt.codc_descricao || dt.Field)
							, name: 'codc_descricao'
						} }) },
						{ head: 'Field'		, param: 'Field' 	},
						{ head: 'Type'		, param: 'Type' 	},
						{ head: 'Null'		, param: 'Null' 	},
						{ head: 'Id'		, align: 'center' 
							, param: dt => resolvConfig({ input: { type: 'checkbox'
								, name: 'codc_id', data: { id: dt.Field, ignore: 'true' }
								, style: { 'width':'20px' }, no_desc: true
								, checked: (dt.codc_id || false)
							} })
						},
						{ head: 'Consulta'		, align: 'center' 
							, param: dt => resolvConfig({ input: { type: 'checkbox'
								, name: 'codc_consulta', data: { id: dt.Field, ignore: 'true' }
								, style: { 'width':'20px' }, no_desc: true
								, checked: (dt.codc_consulta || false)
							} })
						},
						{ head: 'Inativo'	, align: 'center' 
							, param: dt => resolvConfig({ input: { type: 'checkbox'
								, name: 'codc_inativo', data: { id: dt.Field, ignore: 'true' }
								, style: { 'width':'20px' }, no_desc: true
								, checked: (dt.codc_inativo || false)
							} })
						},
					],
					descForm: 'gradeColunasTabelaCondigoConsulta',
					no_scrollX: true,
					no_dataTable: true,
					languageJson: '../../../js/Portuguese.json'
				}) } },
				{ input: { type: 'radio', name: 'tipoCondigoConsulta', radio: [
					{ text: 'Select'			, id: 'ck_selectConsulta' 		, click, checked: (configCampo_Global.ck_selectConsulta 		|| false) },
					{ text: 'Código Consulta'	, id: 'ck_codigoCodigoConsulta' , click, checked: (configCampo_Global.ck_codigoCodigoConsulta 	|| false) },
				] } },
				{ div: { id: 'subFormCodigoConsultaTipoCampo' } },
			])
			$("#subFormCodigoConsultaCampo").html(form);
			if ($("#ck_selectConsulta")[0].checked || $("#ck_codigoCodigoConsulta")[0].checked) formSubgradeTipoCondigoConsulta();
		}
	});
}

function formSubgradeTipoCondigoConsulta() { 
	var datalist = { param: { 'carregarCampos': true, 'tabelaBd': $("#tabelaCodc").val() }, input: 'Field' };
	var form = resolvConfig($("#ck_selectConsulta")[0].checked 
		? [
			{ input: 	{ text: 'text'		, id: 'selectText' 	, value: (configCampo_Global.selectText || '')} },
			{ input: 	{ text: 'value'		, id: 'selectValue' , value: (configCampo_Global.selectValue || ''), datalist } },
			{ input: 	{ text: 'desc'		, id: 'selectDesc' 	, value: (configCampo_Global.selectDesc || ''), datalist } },
		]
		: [
			{ h4: 		{ text: 'Código' 	} },
			{ input: 	{ text: 'text'		, id: 'codigoText' 	, value: (configCampo_Global.codigoText || '')} },
			{ input: 	{ text: 'input'		, id: 'codigoInput' , value: (configCampo_Global.codigoInput || '') , datalist } },
			{ h4: 		{ text: 'Descrição' } },
			{ input: 	{ text: 'text'		, id: 'descricaoText' 	, value: (configCampo_Global.descricaoText || '') } },
			{ input: 	{ text: 'input'		, id: 'descricaoInput' 	, value: (configCampo_Global.descricaoInput || '') , datalist } },
		]
	)
	$("#subFormCodigoConsultaTipoCampo").html(form);
}

