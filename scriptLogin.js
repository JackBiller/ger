

var configFormLogin_Global = {};
var configFormMenu_Global = {};

function initFormLogin() {
	configFormLogin_Global = [
		{ h3: { text: 'Configuração Do login' } },
		// { h5: { text: 'Set nome' } },
		{ input: { name: 'no_set_nome', inline: true, type: 'radio'
			, radio: [
				{ text: 'Setar nome' 		, checked:  configJsonProjeto_Global.login.no_set_nome },
				{ text: 'Não setar nome' 	, checked: !configJsonProjeto_Global.login.no_set_nome },
			]
		} },
		{ br: {} }, 
		{ input: { id: 'login_desc' , text: 'Descrição'
			, value: configJsonProjeto_Global.login.login_desc
		} },
		{ input: { id: 'login_type' , text: 'Tipo'
			, value: configJsonProjeto_Global.login.login_type
		} },
		{ input: { id: 'login_maxlength' , text: 'Máximo Caracteres', type: 'number'
			, value: configJsonProjeto_Global.login.login_maxlength
		} },
		{ input: { id: 'login_ckInativo' , text: 'Campo Inativo'
			, value: configJsonProjeto_Global.login.login_ckInativo
		} },
		{ button: { desc: 'Salvar Configuração de Login'
			, class: 'btn btn-success btn-block'
			, click: function() { salvarConfiguracaoLogin(); }
		} },
	]
	$("#formularioLogin").html(resolvConfig(configFormLogin_Global, 1, true));


	configFormMenu_Global = [
		{ 
			h3: { text: 'Configuração Menu' },
			menu: { descForm: 'menuConfigMenu', abas: 
				[
					{ text: 'Cadastro', icon: 'pencil', ctx: [
						{ input: { id: 'descMenu', text: 'Desc' } },
						{ input: { id: 'descMenuRef', type: 'hidden' } },
						{ button: { class: 'btn btn-block btn-success' 
							, desc: 'Salvar Item Menu', icon: 'floppy-o'
							, click: () => { salvarItemMenu(); }
						} },
						{ button: { class: 'btn btn-block btn-primary' 
							, desc: 'Novo Item Menu', icon: 'file'
							, click: () => { novoItemMenu(); }
						} },
						{ br: {} },
						{ div: { id: 'gradeMenuItens' } }
					] },
					{ text: 'Consulta', icon: 'list', ctx: [
						{ div: { id: 'gradeMenu' } }
					] }
				]
			}
		}
	]

	$("#formularioMenu").html(resolvConfig(configFormMenu_Global, 1, true));

	$("#gradeMenu").html(''
		+ resolvGrade(configJsonProjeto_Global.menu.filter(m => (m.desc || '') != ''), {
			inputs: [
				{ head: 'Desc', param: 'desc' },
				{ head: 'Nº Itens', param: dt => dt.itens.length },
				{ head: '', tdClick: 'editItemMenu'
					, param: dt => resolvConfig({ button: { 
						name: 'editMenu', data: { id: dt.desc },
						icon: 'pencil', class: 'btn btn-warning'
					} })
				}
			],
			descForm: 'gradeMenu',
			no_scrollX: true,
			languageJson: '../../../js/Portuguese.json'
		})
	)
}

function salvarConfiguracaoLogin() { 
	var login = {
		no_set_nome: document.getElementsByName('no_set_nome')[0].checked,
		login_desc: $("#login_desc").val(),
		login_type: $("#login_type").val(),
		login_maxlength: $("#login_maxlength").val(),
		login_ckInativo: $("#login_ckInativo").val(),
	}
	configFormLogin_Global.login = login;
	salvarConfigProjeto();
}

function editItemMenu(obj) { 
	$("#descMenu").val(obj.desc);
	$("#descMenuRef").val(obj.desc);

	$("#gradeMenuItens").html(''
		+ resolvGrade(obj.itens, { 
			inputs: [
				{ head: 'desc' 	, param: 'desc' 	},
				{ head: 'file' 	, param: 'file' 	},
				{ head: 'admin' 
					, param: dt => resolvConfig({ input: { type: 'checkbox'
						, name: 'ckAdminMenu', no_desc: true
						, data: { id: dt.desc }
						, checked : (dt.admin || false)
					} })
				},
				{ head: '', tdClick: 'addItemMenuItem'
					, param: dt => resolvConfig({ button: {
						name: 'addItemMenuItem', data: { id: dt.desc }
						, icon: 'pencil', class: 'btn btn-warning'
					} })
				}
			],
			descForm: 'gradeItemMenuItens',
			no_scrollX: true,
			languageJson: '../../../js/Portuguese.json'
		})
		+ resolvConfig({ button: { class: 'btn btn-success btn-block'
			, icon: 'plus', desc: 'Adicionar Sub Item'
			, styleDiv: { 'margin-top':'15px' }
			, click: () => { addItemMenuItem(); }
		} })
	)
	$("#menuConfigMenu0")[0].click();
}

function addItemMenuItem(obj={}) { 
	$("#infoItemMenu").html( $("#descMenu").val() );
	$("#conteudoItemMenu").html(resolvConfig([
		{ input: { id: 'descItemMenuItem'		, text: 'Descricao' 	, value: (obj.desc || '') } },
		{ input: { id: 'descRefItemMenuItem'	, type: 'hidden' 		, value: (obj.desc || '') } },
		{ input: { id: 'fileItemMenuItem'		, text: 'Arquivo' 		, value: (obj.file || '') } },
		{ input: { id: 'adminItemMenuItem'		, text: 'Acesso Admin' 	, checked: (obj.admin || false)
			, type: 'checkbox', styleDiv: { 'margin-top':'15px' }
		} },
	]));
	$("#configuraItemMenu").modal('show');
}

function salvarItemMenuItem() { 
	var descItemMenuItem 	= $("#descItemMenuItem").val();
	var descRefItemMenuItem = $("#descRefItemMenuItem").val();
	var fileItemMenuItem 	= $("#fileItemMenuItem").val();
	var adminItemMenuItem 	= $("#adminItemMenuItem")[0].checked;
	var descMenuRef 		= $("#descMenuRef").val();
	var obj = { 
		desc: descItemMenuItem,
		file: fileItemMenuItem,
		admin: adminItemMenuItem,
	};

	var indice = configJsonProjeto_Global.menu.map(m => m.desc).indexOf(descMenuRef);
	if (indice < 0) return alert('Selecione um item de menu valido!');

	if (descItemMenuItem == '') return alert('Informe descricao!');

	if (descRefItemMenuItem == '') { 
		configJsonProjeto_Global.menu[indice].itens.push(obj);
	} else { 
		var indiceItem = configJsonProjeto_Global.menu[indice].itens.map(m => m.desc).indexOf(descRefItemMenuItem);
		if (indiceItem < 0) return alert('Selecione um item de menu valido!');
		configJsonProjeto_Global.menu[indice].itens[indiceItem] = obj;
	}
	salvarConfigProjeto();
	$("#configuraItemMenu").modal('hide');
}

function salvarItemMenu() { 
	var descMenu = $("#descMenu").val();
	var descMenuRef = $("#descMenuRef").val();

	if (descMenu == '') return alert('Informe desc!');

	if (descMenuRef == '') { 
		configJsonProjeto_Global.menu.push({ desc: descMenu, itens: [] });
	} else { 
		var indice = configJsonProjeto_Global.menu.map(m => m.desc).indexOf(descMenuRef);
		if (indice < 0) return alert('Selecione um item de menu valido!');
		configJsonProjeto_Global.menu[indice].desc = descMenu;
	}
	salvarConfigProjeto();
	$("#configuraItemMenu").modal('hide');
}

function novoItemMenu() { 
	$("#descMenu").val('');
	$("#descMenuRef").val('');
}
