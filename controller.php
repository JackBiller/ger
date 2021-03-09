<?php

date_default_timezone_set('America/Sao_Paulo');


include 'funcoes.php';
// $conn = new Conexao();
// $pdo = $conn->Connect();
$pdo = getConection('./config.env');


$config = json_decode(file_get_contents("./config.env"));
$db_nome = $config->db_nome;

/****************************************************************************************/
/* Operações Banco de Dados */
/****************************************************************************************/
if (!empty($_POST['buscarTabela'])) { 
	$tabela = empty($_POST['tabela']) ? '' : "AND TABLE_NAME = '" . $_POST['tabela'] . "'";

	$sql = "SELECT 
				TABLE_NAME AS DS_TABELA 
			FROM information_schema.tables
			WHERE table_schema = '$db_nome'
			$tabela";
	// printQuery($sql);
	echo toJson(padraoResultado($pdo, $sql, 'Nenhuma tabela disponivel!'));
}

if (!empty($_POST['carregarCampos'])) { 
	$tabelaBd = $_POST['tabelaBd'];
	$sql = "SHOW COLUMNS FROM $tabelaBd;";
	// printQuery($sql);
	echo toJson(padraoResultado($pdo, $sql, 'Nenhum resultado encontrado!'));
}



/****************************************************************************************/
/* Gerenciador de Projetos */
/****************************************************************************************/
if (!empty($_POST['abrir_projeto'])) { 
	$path_root = empty($_POST['path_root']) ? 'D:\CDI Web\PHP\\' : $_POST['path_root'];
	$path = empty($_POST['path']) ? 'OrdemServico' : $_POST['path'];
	shell_exec('cd ' . $path_root . '/' . $path . ' && code .');
	echo 'cd ' . $path_root . '/' . $path . ' && code .';
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
				if (ftp_fput($connect, $file_up, $fp, FTP_BINARY)) {  // , FTP_ASCII
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
				// // if (ftp_fput($connect, $file_up, $fp, FTP_BINARY)){ // , FTP_ASCII
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