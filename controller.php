<?php

date_default_timezone_set('America/Sao_Paulo');

include './vendor/autoload.php';

include 'funcoes.php';

/****************************************************************************************/
/* Operações Banco de Dados */
/****************************************************************************************/
if (!empty($_POST['buscarTabela'])) {
	$path_admin = $_POST['path_admin'];

	$pdo = getConection('../' . $path_admin . './config.env');
	$tabela = empty($_POST['tabela']) ? '' : "AND TABLE_NAME = '" . $_POST['tabela'] . "'";

	$config = json_decode(file_get_contents('../' . $path_admin . './config.env'));
	$db_nome = $config->db_nome;

	$sql = "SELECT
				TABLE_NAME AS DS_TABELA
			FROM information_schema.tables
			WHERE table_schema = '$db_nome'
			$tabela";
	// printQuery($sql);
	echo toJson(padraoResultado($pdo, $sql, 'Nenhuma tabela disponivel!'));
}

if (!empty($_POST['carregarCampos'])) {
	$pdo = getConection();
	$tabelaBd = $_POST['tabelaBd'];
	$sql = "SHOW COLUMNS FROM $tabelaBd;";
	// printQuery($sql);
	echo toJson(padraoResultado($pdo, $sql, 'Nenhum resultado encontrado!'));
}

if (!empty($_POST['rodarScript'])) {
	$path_admin = $_POST['path_admin'];

	$pdo = getConection('../' . $path_admin . './config.env');

	$config = json_decode(file_get_contents('../' . $path_admin . './config.env'));
	$db_nome = $config->db_nome;

	checkTableScript($pdo, $db_nome);

	$ds_script = $_POST['ds_script'];
	$script = ctxFile('../' . $path_admin . './script/' . $ds_script);
	if (empty($_POST['no_run'])) {
		// printQuery($script);
		padraoExecute($pdo, $script, '');
	}
	$script = str_replace("'", "\\'", $script);

	$sql = "INSERT INTO SCRIPT 	(CTX_SCRIPT, DS_SCRIPT)
			VALUES 				('$script', '$ds_script');";
	// printQuery($sql);
	echo padraoExecute($pdo, $sql, '');
}

if (!empty($_POST['listarScripts'])) {
	$path_admin = $_POST['path_admin'];

	$pdo = getConection('../' . $path_admin . './config.env');

	$config = json_decode(file_get_contents('../' . $path_admin . './config.env'));
	$db_nome = $config->db_nome;

	checkTableScript($pdo, $db_nome);

	$sql = "SELECT * FROM SCRIPT";
	// printQuery($sql);
	echo toJson(padraoResultado($pdo, $sql, 'Nenhum script rodado!'));
}

function checkTableScript($pdo, $db_nome) {
	$sql = "SELECT
				TABLE_NAME AS DS_TABELA
			FROM information_schema.tables
			WHERE table_schema = '$db_nome'
			AND TABLE_NAME = 'SCRIPT'";
	// printQuery($sql);
	$resultado = padraoResultado($pdo, $sql, 'Nenhum resultado encontrado!');
	$resultado = $resultado[0];

	if ($resultado->get('debug') != 'OK') {
		$sql = "CREATE TABLE SCRIPT (
					ID_SCRIPT INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
					DS_SCRIPT VARCHAR(50) NOT NULL,
					DT_SCRIPT DATETIME DEFAULT CURRENT_TIMESTAMP,
					CTX_SCRIPT TEXT NOT NULL
				);";
		// printQuery($sql);
		padraoExecute($pdo, $sql, '');
	}
}



/****************************************************************************************/
/* Gerenciador de Projetos */
/****************************************************************************************/
if (!empty($_POST['get_config_json_projeto'])) {
	class ConfigJson extends PadraoObjeto {
		var $paginas = array();
		var $libs = array();
	}

	$nome = $_POST['nome'];

	if (!is_dir('./setting')) mkdir('./setting');

	if (is_file("./setting/config$nome.json")) {
		echo ctxFile("./setting/config$nome.json");
	} else {
		echo toJson(new ConfigJson());
	}
}

if (!empty($_POST['abrir_projeto'])) {
	$path_root = empty($_POST['path_root']) ? 'C:/xampp/htdocs/' : $_POST['path_root'];
	$path = empty($_POST['path']) ? '' : $_POST['path'];
	shell_exec('cd ' . $path_root . '/' . $path . ' && code .');
	echo 'cd ' . $path_root . '/' . $path . ' && code .';
}

if (!empty($_POST['instalar_projeto'])) {
	$path_root = empty($_POST['path_root']) ? 'C:/xampp/htdocs/' : $_POST['path_root'];
	$path_admin = empty($_POST['path_admin']) ? 'admin' : $_POST['path_admin'];
	$path = empty($_POST['path']) ? '' : $_POST['path'];

	removeDir('../'.$path_admin.'/img');
	copyDir('img', '../' . $path_admin . '/img');
	copyDir('../' . $path . '/img', '../' . $path_admin . '/img');

	installDir($path, $path_admin, '/view');
	installDir($path, $path_admin, '/controller/config');
	installDir($path, $path_admin, '/script');

	installFile($path, $path_admin, '/controller/include.php'			);
	installFile($path, $path_admin, '/controller/upload.php'			);
	installFile($path, $path_admin, '/controller/constConfigAdd.php'	);
	installFile($path, $path_admin, '/create-user/form.php'				);
	installFile($path, $path_admin, '/create-user/form.js'				);
	installFile($path, $path_admin, '/password-change/form.js'			);
	installFile($path, $path_admin, '/principal/_skin-custom.css'		);
	installFile($path, $path_admin, '/config.json'						);
	installFile($path, $path_admin, '/config.env'						);
	if (is_file('../' . $path . '/configProd.env')) {
		installFile($path, $path_admin, '/configProd.env');
	}
	installFile($path, $path_admin, '/composer.json'					);

	echo '1';
}
function installDir($path, $path_admin, $comp, $isMerge=false) {
	if ($isMerge) {
		mergeDir('../' . $path . $comp, '../' . $path_admin . $comp);
	} else {
		removeDir('../' . $path_admin . $comp);
		copyDir('../' . $path . $comp, '../' . $path_admin . $comp);
	}
}
function installFile($path, $path_admin, $comp, $isMerge=false) {
	if ($isMerge) {
		mergeFile('../' . $path, '../' . $path_admin, $comp);
	} else {
		copyFile('../' . $path . $comp, '../' . $path_admin . $comp);
	}
}

if (!empty($_POST['atualizarOrigemRepo'])) {
	$path_root = empty($_POST['path_root']) ? 'C:/xampp/htdocs/' : $_POST['path_root'];
	$path_admin = empty($_POST['path_admin']) ? 'admin' : $_POST['path_admin'];
	$path = empty($_POST['path']) ? '' : $_POST['path'];

	installDir($path_admin, $path, '/view'								, true);
	installDir($path_admin, $path, '/controller/config'					, true);
	installDir($path_admin, $path, '/script'							, true);

	installFile($path_admin, $path, '/controller/include.php'			, true);
	installFile($path_admin, $path, '/controller/upload.php'			, true);
	installFile($path_admin, $path, '/controller/constConfigAdd.php'	, true);
	installFile($path_admin, $path, '/create-user/form.php'				, true);
	installFile($path_admin, $path, '/create-user/form.js'				, true);
	installFile($path_admin, $path, '/password-change/form.js'			, true);
	installFile($path, $path_admin, '/principal/_skin-custom.css'		, true);
	installFile($path_admin, $path, '/config.json'						, true);
	installFile($path_admin, $path, '/config.env'						, true);
	if (is_file('../' . $path . '/configProd.env')) {
		installFile($path_admin, $path, '/configProd.env'				, true);
	}
	installFile($path_admin, $path, '/composer.json'					, true);

	echo '1';
}

if (!empty($_POST['checkUpResolv'])) {
	$path = $_POST['path'];
	$path_admin = $_POST['path_admin'];

	$filObj = getObjFile('resolvConfig.full.js','../' . $path);
	$diff = date_diff( date_create(date('Y-m-d H:i:s')), date_create($filObj->get('dateCriation')) );
	if ($diff->y == 0 && $diff->m == 0 && $diff->d == 0 && $diff->h == 0 && $diff->i == 0 && $diff->s < 3) {
		$_POST['installResolv'] = true;
	}
}

if (!empty($_POST['installResolv'])) {
	$path = $_POST['path'];
	$path_admin = $_POST['path_admin'];

	copyFile('../' . $path . '/resolvConfig.full.js', '../' . $path_admin . '/js/resolvConfig.full.js');
	copyFile('../' . $path . '/resolvConfig.full.js', './resolvConfig.full.js');


	$resolvMin = ctxFile('../' . $path . '/dist/resolvConfig.min.js');
	// var_dump($resolvMin);
	$resolvMin = substr($resolvMin, 6, strlen($resolvMin)-5-6);

	createFile('../' . $path_admin . '/js/resolvConfig.min.js', $resolvMin);
	createFile('./resolvConfig.min.js', $resolvMin);
	// copyFile('../' . $path . '/resolvConfig.min.js', '../' . $path_admin . '/js/resolvConfig.min.js');
	// copyFile('../' . $path . '/resolvConfig.min.js', './resolvConfig.min.js');

	echo '1';
}

if (!empty($_POST['gerarProducao'])) {
	$path_admin = empty($_POST['path_admin']) ? 'admin' : $_POST['path_admin'];

	removeDir('../' . $path_admin . '/dist');
	mkdir('../' . $path_admin . '/dist');

	copyFile('../' . $path_admin . '/index.html'				, '../' . $path_admin . '/dist/index.html'				);
	mkdir('../' . $path_admin . '/dist/js');
	copyFile('../' . $path_admin . '/js/indexApp.js'			, '../' . $path_admin . '/dist/js/indexApp.js'			);
	copyFile('../' . $path_admin . '/js/resolvConfig.min.js'	, '../' . $path_admin . '/dist/js/resolvConfig.min.js'	);

	copyDir('../' . $path_admin . '/principal'					, '../' . $path_admin . '/dist/principal'				);
	copyDir('../' . $path_admin . '/login'						, '../' . $path_admin . '/dist/login'					);
	copyDir('../' . $path_admin . '/img'						, '../' . $path_admin . '/dist/img'						);
	copyDir('../' . $path_admin . '/controller'					, '../' . $path_admin . '/dist/controller'				);

	$configEnv_text = ctxFile(
		is_file('../' . $path_admin . '/configProd.env')
		? '../' . $path_admin . '/configProd.env'
		: '../' . $path_admin . '/config.env'
	);
	$config_text 	= ctxFile('../' . $path_admin . '/config.json');
	$config = json_decode($config_text);


	if (isset($config->cadastro)) {
		copyDir('../' . $path_admin . '/create-user', '../' . $path_admin . '/dist/create-user');
	}
	if (isset($config->forget_password)) {
		copyDir('../' . $path_admin . '/password-change', '../' . $path_admin . '/dist/password-change');
		copyDir('../' . $path_admin . '/password-reset', '../' . $path_admin . '/dist/password-reset');
	}

	$menu = $config->menu;
	if (!is_dir('../' . $path_admin . '/dist/view')) mkdir('../' . $path_admin . '/dist/view');

	$filesViews = array();
	for ($i=0; $i < sizeof($menu); $i++) {
		$item_menu = $menu[$i];

		if (isset($item_menu->file)) {
			$file = incrementFile($path_admin, $item_menu->file);
			if ($file != '') {
				array_push($filesViews, $item_menu->file);
			}
		}

		if (isset($item_menu->itens)) {
			$itens = $item_menu->itens;
			for ($j=0; $j < sizeof($itens); $j++) {
				$item_subMenu = $itens[$j];

				if (isset($item_subMenu->file)) {
					$file = incrementFile($path_admin, $item_subMenu->file);
					if ($file != '') {
						array_push($filesViews, $item_subMenu->file);
					}
				}
			}
		}
	}
	$dir = listDir('../' . $path_admin . '/view');
	$branchs = $dir->branchs;
	for ($i=0; $i < sizeof($branchs); $i++) {
		$item = $branchs[$i];
		if ($item->ext != "html") {
			copyFile(
				'../' . $path_admin . '/view/' . $item->name,
				'../' . $path_admin . '/dist/view/' . $item->name
			);
		}
	}

	$configEnv_text = str_replace('"', '\\"', $configEnv_text	);
	$config_text 	= str_replace('"', '\\"', $config_text		);

	$constConfigAdd = '';
	if (is_file('../' . $path_admin . '/dist/controller/constConfigAdd.php')) {
		$constConfigAdd = ""
			. ctxFile('../' . $path_admin . '/dist/controller/constConfigAdd.php');
	}

	createFile('../' . $path_admin . '/dist/controller/constConfig.php', ''
		. "<?php"
		. "\n"
		. "\ndefine('EXT_VIEW', 'php');"
		. "\ndefine('CONFIG_ENV', \"$configEnv_text\");"
		. "\ndefine('CONFIG_JSON', \"$config_text\");"
		. "\n"
		. "\n?>$constConfigAdd"
	);

	if (isset($config->cadastro)) {
		replaceResolvFile($path_admin, 'create-user'		, 'index.html'	);
	}
	if (isset($config->forget_password)) {
		replaceResolvFile($path_admin, 'password-change'	, 'index.php'	);
		replaceResolvFile($path_admin, 'password-reset'		, 'index.html'	);
	}
	replaceResolvFile($path_admin, ''					, 'script.js'	);
	replaceResolvFile($path_admin, 'login'				, 'index.html'	);
	replaceResolvFile($path_admin, 'principal'			, 'index.html'	);

	echo '1';
}
function incrementFile($path_admin, $file) {
	if (isset($file) && is_file('../' . $path_admin . '/view/' . $file . '.html')) {
		$fileCtx = ctxFile('../' . $path_admin . '/view/' . $file . '.html');

		createFile(
			'../' . $path_admin . '/dist/view/' . $file . '.php',
			"<?php return; ?>\n".$fileCtx
		);
		return $file;
		// array_push($filesViews, $file);
	}
	return '';
}
function replaceResolvFile($path_admin, $path, $file) {
	if (!is_file('../' . $path_admin . '/' . $path . '/' . $file)) return false;

	$fileCtx = ctxFile('../' . $path_admin . '/' . $path . '/' . $file);
	$fileCtx = str_replace('resolvConfig.full.js','resolvConfig.min.js',$fileCtx);
	createFile('../' . $path_admin . '/dist/' . $path . '/' . $file, $fileCtx);
	return true;
}

if (!empty($_POST['installTemplate'])) {
	$path_admin = empty($_POST['path_admin']) ? 'admin' : $_POST['path_admin'];
	$path = empty($_POST['path']) ? '' : $_POST['path'];

	$config_text = ctxFile('../' . $path_admin . '/config.json');
	if ($config_text != '') {
		$config_text = json_decode($config_text);
		$template = '';
		if (isset($config_text->template)) {
			$template = $config_text->template;
		}
		if ($template == '') $template = 'adminLTE';

		$dirOrigin = '../' . $path_admin . '/template/' . $template . '/';
		$dirDist = '../' . $path_admin . '/';
		$fileCopy = 'index.html';
		copyFile($dirOrigin . $fileCopy, $dirDist . $fileCopy);
		$dirCopy = 'principal';
		copyDir($dirOrigin . $dirCopy, $dirDist . $dirCopy);

		iTemplateDirCustom($config_text, $dirOrigin, $dirDist, 'login');
		iTemplateDirCustom($config_text, $dirOrigin, $dirDist, 'password-change');
		iTemplateDirCustom($config_text, $dirOrigin, $dirDist, 'password-reset');
		iTemplateDirCustom($config_text, $dirOrigin, $dirDist, 'create-user');

		installFile($path_admin, $path, '/create-user/form.php'		, true);
		installFile($path_admin, $path, '/create-user/form.js'		, true);
		installFile($path_admin, $path, '/password-change/form.js'	, true);
		echo '1';
	} else {
		echo '0';
	}
}
function iTemplateDirCustom($config, $dirOrigin, $dirDist, $dir) {
	$dirDist .= $dir;
	removeDir($dirDist);

	if (isset($config->customView) && isset($config->customView->$dir)
		&& !empty($config->customView->$dir)
	) {
		mkdir($dirDist);
		if (gettype($config->customView->$dir) == 'string') {
			copyDir('../'.$config->customView->$dir, $dirDist);
		} else if (
			isset($config->customView->$dir->dir) && !empty($config->customView->$dir->dir)
			&& (!isset($config->customView->$dir->files) || empty($config->customView->$dir->files))
		) {
			copyDir('../'.$config->customView->$dir->dir, $dirDist);
		} else {
			$dirOriginObj = '../'.$config->customView->$dir->dir;
			$files = $config->customView->$dir->files;
			$etx = array('html','php','phtml');
			for ($i=0; $i < sizeof($files); $i++) {
				$file = $files[$i];
				$fileObj = explode('.', $file);

				$fileName = (array_search($fileObj[sizeof($fileObj)-1], $etx) != '');
				$fileName = $fileName ? 'index.'.$fileObj[sizeof($fileObj)-1] : $file;

				copyFile($dirOriginObj.'/'.$file, $dirDist.'/'.$fileName);
			}
		}
	} else {
		copyDir($dirOrigin.$dir, $dirDist);
	}
}



/****************************************************************************************/
/* Index / Controller */
/****************************************************************************************/
if (!empty($_POST['headFooterView'])) {
	$tempName = date('YmdHis');

	$files = listDir("../../../view");
	$files = $files->branchs;
	$filesDesc = array();
	for ($i = 0; $i < sizeof($files); $i++) {
		createFile("./template/$tempName.html", ctxFile('./template/view.html'));
		$text = getTextInFile('../../../view/' . $files[$i]->name
			, "<!-- START_CXT_VIEW -->", "<!-- END_CXT_VIEW -->"
		);

		setTextInFile("./template/$tempName.html", $text
			, "<!-- START_CXT_VIEW -->", "<!-- END_CXT_VIEW -->"
		);

		copyFile("./template/$tempName.html", '../../../view/' . $files[$i]->name);
	}
	deleteFile("./template/$tempName.html");
}

if (!empty($_POST['linksLibs'])) {
	$linkHead = $_POST['linkHead'];
	$linkFooter = $_POST['linkFooter'];

	setTextInFile('../../../principal/index.html', $linkHead
		, "\n\t<!-- START_LIB_HEAD -->", "\n\t<!-- END_LIB_HEAD -->"
	);
	setTextInFile('../../../principal/index.html', $linkFooter
		, "\n\t<!-- START_LIB_FOOTER -->", "\n\t<!-- END_LIB_FOOTER -->"
	);
}

if (!empty($_POST['linksController'])) {
	$files = listDir("../../../controller/config");
	$files = $files->branchs;
	$filesDesc = array();
	for ($i = 0; $i < sizeof($files); $i++) {
		array_push($filesDesc, 'include \'./config/' . $files[$i]->name . '\';');
	}
	setTextInFile('../../../controller/controller.php'
		, "\n" . implode("\n", $filesDesc)
		, "\n" . '/* START_CONFIG_FILE */'
		, "\n" . '/* END_CONFIG_FILE */'
	);
}



/****************************************************************************************/
/* Operações Arquivo */
/****************************************************************************************/
if (!empty($_POST['gerarArquivo'])) {
	$file = $_POST['file'];
	$ctx = $_POST['ctx'];
	echo createFile($file, $ctx);
}

if (!empty($_POST['listDir'])) {
	// echo $_POST['path'];
	$path = $_POST['path'];
	echo toJson(listDir($path));
}

if (!empty($_POST['limparProjeto'])) {

}



/****************************************************************************************/
/* Operações FTP */
/****************************************************************************************/
if (!empty($_POST['verificarDir'])) {
	$dir = $_POST['dir'];
	$is_connect = false;

	$config = json_decode(file_get_contents("./config.env"));

	$ftp_host 		= $config->ftp_host;
	$ftp_user_name 	= $config->ftp_user_name;
	$ftp_user_pass 	= $config->ftp_user_pass;

	$file_list = scandir('../'.$dir);
	foreach ($file_list as $file) {
		if (!is_dir("../$dir/$file") && file_exists("../$dir/$file")) {
			// $segDiff = date('i') - date("i",filemtime($file));
			// $segDiff < 10
			$diff = date_diff(date_create(date('Y-m-d H:i:s')), date_create(date('Y-m-d H:i:s', filemtime("../$dir/$file"))));

			if ($diff->y == 0 && $diff->m == 0 && $diff->d == 0 && $diff->h == 0 && $diff->i == 0 && $diff->s < 3) {
				if (!$is_connect) {
					$is_connect = true;
					$connect = ftp_connect($ftp_host) or die( "Couldn't connect to server!!!" );
					if (!ftp_login($connect, $ftp_user_name, $ftp_user_pass)) {
						echo "Couldn't connect as $ftp_user_name\n";
						return false;
					}
					// ftp_pasv($connect, true);
				}
				$file_up = "./html/$dir/$file";
				$fp = fopen('php://temp', 'r+');
				fwrite($fp, ctxFile("../$dir/$file"));
				rewind($fp);
				if (ftp_fput($connect, $file_up, $fp, FTP_BINARY)) {// , FTP_ASCII
					$hora = date("H")-1;
					if ($hora == 0) $hora = 23;
					echo "<b>$dir/$file</b> foi atualizado (" . date("d/m/Y $hora:i:s") . ")<br>";
				} else {
					echo "Falha ao atualizar <b>$dir/$file</b> em <b>./html/$dir/$file</b><br>";
				}
				fclose($fp);
				// $fp = fopen("../$dir/$file", 'r+');
				// rewind($fp);
				// if (ftp_fput($connect, "./html/$dir/$file", $fp, FTP_BINARY)){
				// // if (ftp_fput($connect, $file_up, $fp, FTP_BINARY)){// , FTP_ASCII
				// // if (ftp_put($connect, "./html/$dir/$file", $fp, FTP_BINARY)){
				// 	echo "$dir/$file foi atualizado<br>";
				// } else {
				// 	echo "Falha ao atualizar $dir/$file em ./html/$dir/$file<br>";
				// }
				// fclose($fp);
			}
		}
	}
	if ($is_connect) ftp_close($connect);
	// $file_ftp_list = ftp_nlist($connect, './html/'.$dir);
}



/****************************************************************************************/
/* Operações Block Code */
/****************************************************************************************/
if (!empty($_POST['getListBlockCode'])) {
	echo toJson(listDir('./block-code'));
}


?>