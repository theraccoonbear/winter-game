<?php

$config = array();

//enable/disable debug mode (defaults to false)
$config['debug'] = true;

//optional timezone (defaults to UTC)
//$config['timezone'] = 'America/Chicago';

//doctrine database config
$config['db.options'] = array(
	'driver'   => 'pdo_mysql',
	'dbname'   => 'dastbasename',
	'host'     => 'localhost',
	'user'     => 'root',
	'password' => 'root',
	'charset'  => 'utf8',
	'port'     => '3306'
);

return $config;
