
var configRodarScript_Global = { row: [ 
	{ input: { type: 'checkbox', class: '_', text: 'Trazer Scripts Rodados', click: () => { buscarScriptRodados(); }	} },
	{ div: { class: 'col-md-6', id: 'scriptParaRodar' } },
	{ div: { class: 'col-md-6', id: 'scriptRodado' } },
] };

function initFormRodarScript() { 
	$("#rodarScriptDiv").html(resolvConfig(configRodarScript_Global, 1, true));
	buscarScriptRodar();
	buscarScriptRodados();
}

function buscarScriptRodar() { 
	$("#scriptParaRodar").html('teste');
	ajax({
		param: {
			'listDir': true,
			'path': '../' + configJsonGeral_Global.path_admin + '/script',
		},
		done: data => { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);

			var scripts = data.branchs.filter(dt => dt.ext == 'sql');

			if (scripts.length == 0) { 
				$("#scriptParaRodar").html('Nenhum script para rodar!');
				return;
			}
			scriptRodar_Global = scripts;
			montarGradeScriptRodar();
		}
	});
}

function montarGradeScriptRodar() { 
	var scripts = scriptRodar_Global;

	$("#scriptParaRodar").html(resolvGrade(scripts, { 
		inputs: [ 
			{ head: 'Script', param: 'name' },
			{ head: 'Rodar', align: 'center', tdClick: 'rodarScript'
				, param: dt => resolvConfig({ button: { icon: 'play', class: 'warning rodarScript'
					, id: 'btnRodarScript' + tirarAcentuacao(dt.name, true)
				} })
			},
			{ head: 'Registrar', align: 'center', tdClick: 'registrarScript'
				, param: dt => resolvConfig({ button: { icon: 'pencil', class: 'info rodarScript'
					, id: 'btnRegistrarScript' + tirarAcentuacao(dt.name, true)
				} })
			},
		],
		descForm: 'gradeScriptRodar',
		no_scrollX: true,
		class: { tbody: { td: 'celB' } },
	}));
}

var scriptRodados_Global = [];
var scriptRodar_Global = [];
function buscarScriptRodados() { 
	$("#scriptRodado").html('Carregando...');

	ajax({ 
		param: { 
			'listarScripts': true,
			'path_admin': configJsonGeral_Global.path_admin,
		},
		done: function(data) { 
			console.log(data);
			data = JSON.parse(data);
			console.log(data);

			var grade = data[0].debug;
			// var dataView = data.filter(dt => dt.)

			if (grade == 'OK') { 
				$(".rodarScript").attr('disabled', false);

				data.forEach(dt => { 
					$("#btnRodarScript" + tirarAcentuacao(dt.DS_SCRIPT, true)).attr('disabled', true);
					$("#btnRegistrarScript" + tirarAcentuacao(dt.DS_SCRIPT, true)).attr('disabled', true);
				});

				grade = resolvGrade(data, { 
					inputs: [ 
						{ head: 'Descrição', param: 'DS_SCRIPT', tootip: dt => dt.CTX_SCRIPT },
						{ head: 'Data Execução', param: 'DT_SCRIPT', dateFormat: { format: 'DD/MM/Y HH:mm:ss' } },
					],
					descForm: 'gradeScriptRodado',
					no_scrollX: true,
					class: { tbody: { td: 'celB' } },
				});
			}
			$("#scriptRodado").html(grade);
		}
	});
}

function rodarScript(obj) { 
	console.log(obj);
	if ($("#btnRodarScript" + tirarAcentuacao(obj.name, true)).attr('disabled')) 
		return alert('Script já foi rodado!');

	ajax({ 
		param: { 
			'rodarScript': true,
			'ds_script': obj.name,
			'path_admin': configJsonGeral_Global.path_admin,
		},
		done: function(data) { 
			console.log(data);
			alert(data == '1' ? 'Script Rodado com sucesso!' : 'Falha ao rodar script: ' + data);
			buscarScriptRodados();
		}
	});
}

function registrarScript(obj) { 
	console.log(obj);
	if ($("#btnRodarScript" + tirarAcentuacao(obj.name, true)).attr('disabled')) 
		return alert('Script já foi rodado!');

	ajax({ 
		param: { 
			'rodarScript': true,
			'ds_script': obj.name,
			'path_admin': configJsonGeral_Global.path_admin,
			'no_run': true
		},
		done: function(data) { 
			console.log(data);
			alert(data == '1' ? 'Script registrado com sucesso!' : 'Falha ao registrar script: ' + data);
			buscarScriptRodados();
		}
	});
}
