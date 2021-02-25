<?php

class PadraoObjeto {
	var $debug = 'OK';
	public function get($nome_campo){
		return $this->$nome_campo;
	}

	public function set($valor , $nome_campo){
		$this->$nome_campo = $valor;
	}

	public function check($nome_campo){
		return isset($this->$nome_campo);
	}

	public function push($valor, $nome_campo){
		if(gettype($this->$nome_campo) == "array") array_push($this->$nome_campo, $valor);
	}

	public function removeQuebra($tipo, $valor){
							$valor = 	str_replace("\"", '\'',
										str_replace("\r", '', $valor));
		if($tipo == 'html') return 		str_replace("\t", '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
										str_replace("\n", '<br>', $valor));
		else 				return 		str_replace("\t", ' ',
										str_replace("\n", '', $valor));
	}
}

class FalseDebug extends PadraoObjeto{ 
	public function __construct($msm){
		if(!empty($msm) && gettype($msm) == 'string') $this->set($msm, 'debug');
	}
}

?>