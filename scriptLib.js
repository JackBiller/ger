

var prefixoLib_Global = '../biblioteca/bower_components/';

var libsProjeto_Global = [
	{ desc: 'jquery'
		, linkFooter: ['jquery/dist/jquery.min.js'] 
	},
	{ desc: 'bootstrap'
		, linkHead: ['bootstrap/dist/css/bootstrap.min.css'] 
		, linkFooter: ['bootstrap/dist/js/bootstrap.min.js'] 
	},
	{ desc: 'font awesome 4'
		, linkHead: ['font-awesome/css/font-awesome.min.css'] 
	},
	{ desc: 'Ionicons'
		, linkHead: ['Ionicons/css/ionicons.min.css'] 
	},
	{ desc: 'datatables'
		, linkHead: ['datatables.net/datatables.min.css',
			// 'datatables.net-bs/css/dataTables.bootstrap.min.css'
		] 
		, linkFooter: ['datatables.net/datatables.min.js'] 
	},
	{ desc: 'select2'
		, linkHead: ['select2/dist/css/select2.min.css'] 
		, linkFooter: ['select2/dist/js/select2.full.min.js'] 
	},
	{ desc: 'photoswipe'
		, linkHead: ['photoswipe/photoswipe.css','photoswipe/default-skin/default-skin.css'] 
		, linkFooter: ['photoswipe/photoswipe.min.js','photoswipe/photoswipe-ui-default.min.js'] 
	},
	{ desc: 'jquery slimscroll'
		, linkFooter: ['jquery-slimscroll/jquery.slimscroll.min.js'] 
	},
	{ desc: 'fastclick'
		, linkFooter: ['fastclick/lib/fastclick.js'] 
	},
	{ desc: 'moment'
		, linkFooter: ['moment/moment.js'] 
	},
	{ desc: 'beeplay'
		, linkFooter: ['beeplay/dist/beeplay.min.js'] 
	},
	{ desc: 'platform'
		, linkFooter: ['platform/platform.js'] 
	},
	{ desc: 'jquery browser detection'
		, linkFooter: ['resolv/lib/jquery.browser.detection.min.js'] 
	},
	{ desc: 'jquery mask'
		, linkFooter: ['resolv/lib/jquery.mask.min.js'] 
	},
	{ desc: 'amcharts'
		, linkFooter: 'core.js,charts.js,animated.js,pt_BR.js'.split(',').map(t => 'amcharts/' + t)
		// ['amcharts/core.js','amcharts/charts.js','amcharts/animated.js','amcharts/pt_BR.js'] 
	},
	{ desc: 'marvinj'
		, linkFooter: ['marvinj/marvinj.js']
		// ['amcharts/core.js','amcharts/charts.js','amcharts/animated.js','amcharts/pt_BR.js'] 
	},
]

function loadLib() { 
	var libs = (configJson_Global.libs || []), lib;
	libsProjeto_Global.forEach((dt, i) => {
		lib = (libs.find(lib => lib.desc == dt.desc) || {});
		libsProjeto_Global[i].libInstall = (lib.libInstall || false);
	});

	var grade = resolvGrade(libsProjeto_Global, {
		inputs: [
			{ head: 'Instalar', align: 'center'
				, tdClick: 'setLibConfigJson'
				, param: dt => resolvConfig({
					input: { type: 'checkbox', name: 'libInstall', data: { id: dt.desc } 
						, checked: dt.libInstall, no_desc: true
					}
				}) 
			},
			{ head: 'Lib', param: 'desc' },
		],
		descForm: 'gradeLibs',
		no_scrollX: true,
		languageJson: '../../../js/Portuguese.json',
		no_dataTable: true
	})
	$("#conteudoLibs").html('<br>'+grade);
}

function setLibConfigJson() { 
	var inputs = document.getElementsByName('libInstall'), indice;

	for (var i = 0; i < inputs.length; i++) {
		indice = libsProjeto_Global.map(d => d.desc).indexOf($(inputs[i]).data('id'));
		if (indice >= 0) { 
			libsProjeto_Global[indice].libInstall = inputs[i].checked;
		}
	}

	configJson_Global.libs = libsProjeto_Global
	salvarArquivo();
}

function linksLibs() { 
	var link = { head: [], footer: [] }

	libsProjeto_Global.forEach(lib => {
		if (lib.libInstall) {
			link.head = link.head.concat((lib.linkHead || []));
			link.footer = link.footer.concat((lib.linkFooter || []));
		}
	});

	console.log(link.head);

	['head','footer'].forEach(linkRef => {
		link[linkRef] = '\n\t' + link[linkRef].map(lib => ''
			+ (lib.substring(lib.lastIndexOf('.'), lib.length) == '.css' 
				? '<link rel="stylesheet" href="'+prefixoLib_Global+lib+'">'
				: '<script src="'+prefixoLib_Global+lib+'"></'+'script>'
			)
		).join('\n\t')
	});

	ajax({
		param: { 'linksLibs': true, prefixo: prefixoLib_Global 
			, linkHead: link.head
			, linkFooter: link.footer
		},
		done: function(data) { console.log(data); }
	});
}

function linksController() { 
	ajax({
		param: { 'linksController': true },
		done: function(data) { console.log(data); }
	});
}

function headFooterView() { 
	ajax({
		param: { 'headFooterView': true },
		done: function(data) { console.log(data); }
	});
}
