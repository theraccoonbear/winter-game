<?php

error_reporting(E_ALL);

require_once(__DIR__ . '/../vendor/autoload.php');

use Silex\Provider\DoctrineServiceProvider;
use Silex\Provider\ValidatorServiceProvider;
use Silex\Provider\TranslationServiceProvider;
use Silex\Provider\FormServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\UrlGeneratorServiceProvider;
use Silex\Provider\SessionServiceProvider;
use Silex\Provider\SecurityServiceProvider;


use Symfony\Component\HttpFoundation\Session\Storage\Handler\PdoSessionHandler;


//use Aws\Silex\AwsServiceProvider;

use Doctrine\DBAL\Schema\Table;


$default_tz = 'UTC';

date_default_timezone_set($default_tz);

$defaults = array(
	'timezone' => $default_tz
);

$config = array_merge($defaults, require(__DIR__ . '/config.php'));

$app = new Silex\Application($config);


// register doctrine
$app->register(new DoctrineServiceProvider());

// auto-create tables
$app->before(function() use ($app) {
  $schema = $app['db']->getSchemaManager();

//  // Email news form
//  if (!$schema->tablesExist('email_news')) {
//		$table = new Table('email_news');
//		$table->addColumn('id', 'integer', array('unsigned' => true,'autoincrement' => true));
//		$table->addColumn('email', 'string');
//		$table->addColumn('created', 'datetime');
//		$table->setPrimaryKey(array('id'));
//		$table->addIndex(array('created'));
//		$schema->createTable($table);
//  }
//  
//  if (!$schema->tablesExist('contest_entry')) {
//		$table = new Table('contest_entry');
//		$table->addColumn('id', 'integer', array('unsigned' => true,'autoincrement' => true));
//		$table->addColumn('first_name', 'string');
//		$table->addColumn('last_name', 'string');
//		$table->addColumn('email', 'string');
//		$table->addColumn('address_1', 'string');
//		$table->addColumn('address_2', 'string', array('notnull' => false));
//		$table->addColumn('city', 'string');
//		$table->addColumn('state', 'string', array(2));
//		$table->addColumn('zip', 'string');
//		$table->addColumn('photo', 'string');
//		$table->addColumn('caption', 'string');
//		$table->addColumn('sandwich_name', 'string');
//		$table->addColumn('description', 'text');
//		$table->addColumn('directions', 'text');
//		$table->addColumn('ingredients', 'text');
//		$table->addColumn('age_18', 'boolean');
//		$table->addColumn('accept_rules', 'boolean');
//		$table->addColumn('rights', 'boolean');
//		$table->addColumn('receive_news', 'boolean');
//		$table->addColumn('created', 'datetime');
//		$table->setPrimaryKey(array('id'));
//		$table->addIndex(array('created'));
//		$schema->createTable($table);
//	}
//	
//	if(!$schema->tablesExist('session')) {
//		$table = new Table('session');
//		$table->addColumn('id', 'string', array('length' => 255));
//		$table->addColumn('value', 'text');
//		$table->addColumn('time', 'integer');
//		$table->setPrimaryKey(array('id'));
//		$schema->createTable($table);
//	}
//	
//	if (!$schema->tablesExist('ratings')) {
//		$table = new Table('ratings');
//		$table->addColumn('id', 'integer', array('unsigned' => true,'autoincrement' => true));
//		$table->addColumn('contest_entry_id', 'integer');
//		$table->addColumn('score', 'integer');
//		$table->addColumn('cheese', 'string');
//		$table->addColumn('comment', 'text', array('length' => 16000000));
//		$table->addColumn('meta', 'text', array('length' => 16000000));
//		$table->setPrimaryKey(array('id'));
//		$schema->createTable($table);
//	}
	
	/* example pulled from ricaysaludable-old
	if(!$schema->tablesExist('submits')) {
		$table = new Table('submits');
		$table->addColumn('id', 'integer', array('unsigned' => true,'autoincrement' => true));
		$table->addColumn('data', 'array');
		$table->addColumn('created', 'datetime');
		$table->addColumn('processed', 'datetime');
		$table->setPrimaryKey(array('id'));
		$table->addIndex(array('created'));
		$schema->createTable($table);
	}
	*/
});


// register validator
$app->register(new ValidatorServiceProvider());


// register translation
$app->register(new TranslationServiceProvider());


// register forms
$app->register(new FormServiceProvider());


// register urlgenerator
$app->register(new UrlGeneratorServiceProvider());

// register twig
$app->register(new TwigServiceProvider());


//$app['session.storage.handler'] = $app->share(function() use ($app) {
//	return new PdoSessionHandler(
//		$app['db']->getWrappedConnection(),
//		array(
//			'db_table'    => 'session',
//			'db_id_col'   => 'id',
//			'db_data_col' => 'value',
//			'db_time_col' => 'time'
//		),
//		$app['session.storage.options']
//	);
//});

$app['twig.loader.filesystem'] = new Twig_Loader_Filesystem();


$now = time();

$inc_path = __DIR__ . '/../inc/';
if(is_dir($inc_path) && $inc_dir = opendir($inc_path)) {
	while(false !== ($section = readdir($inc_dir))) {
		$section_path = $inc_path . '/' . $section;
		if(is_dir($section_path) && $section_dir = opendir($section_path)) {
			$app['twig.loader.filesystem']->addPath($section_path);
			//while(false !== ($release = readdir($releasedir))) {
			//	$releasepath = $versionpath . '/' . $release;
			//	if(is_dir($releasepath)) {
			//		if($release == 'default') {
			//			//add to end of loader chain
			//			$app['twig.loader.filesystem']->addPath($releasepath, $version);
			//		} elseif(preg_match($releasepattern, $release, $matches)) {
			//			$year = intval($matches[1]);
			//			$month = intval($matches[2]);
			//			$day = intval($matches[3]);
			//			$hour = intval($matches[4]);
			//			$minute = intval($matches[5]);
			//			$second = intval($matches[6]);
			//
			//			$timestamp = mktime($hour, $minute, $second, $month, $day, $year);
			//
			//			
			//			
			//			if($timestamp <= $now) {
			//				//release is past, add to loader 
			//				$app['twig.loader.filesystem']->prependPath($releasepath, $version);
			//			}
			//		}
			//	}
			//}

			closedir($section_dir);
		}
	}

	closedir($inc_dir);
}

return $app;
