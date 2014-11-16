<?php

use Silex\Application;
use Silex\Provider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\HttpKernelInterface;

$app = require(__DIR__ . '/bootstrap.php');

$now = time();

//// extend twig service w/ globals
//$app['twig'] = $app->share($app->extend('twig', function($twig, $app) {
//	$twig->addGlobal('headerNav', array(
//		'signature' => 'SANDWICHES',
//		'recipe'    => 'RECIPES',
//		'contest'   => 'CONTEST',
//		'cheese'    => 'CHEESES',
//		'freebie'   => 'FREEBIES',
//	));
//
//	$twig->addGlobal('contestActive', $app['contest-active']);
//
//	return $twig;
//}));

//$db = new DBHelper($app);
//$forms = new FormHelper($app);
//$users = new UserHelper($app);
//
//$app['db_helper'] = $db;
//$app['form_helper'] = $forms;
//$app['user_helper'] = $users;
//

$asset_manifest = array(
	//array("src" => "images/boarder-large.png", "id" => "boarder-large"),
	array("src" => "images/sprite-boarder.png", "id" => "boarder-small"),
	
	array("src" => "images/obstacles/rock-1.png", "id" => "rock-1"),
	array("src" => "images/obstacles/rock-2.png", "id" => "rock-2"),
	array("src" => "images/obstacles/rock-3.png", "id" => "rock-3"),
	array("src" => "images/obstacles/rock-4.png", "id" => "rock-4"),
			
	array("src" => "images/obstacles/tree-single.png", "id" => "tree-1"),
	array("src" => "images/obstacles/tree-stump.png", "id" => "stump-1"),
			
	array("src" => "images/banners/start.png", "id" => "start-banner"),
			
	array("src" => "images/bonuses/beer.png", "id" => "beer"),
	array("src" => "images/bonuses/coin.png", "id" => "coin"),
			
	array("src" => "images/interaction/jump-center.png", "id" => "jump-center"),
	array("src" => "images/interaction/jump-left.png", "id" => "jump-left"),
	array("src" => "images/interaction/jump-right.png", "id" => "jump-right"),
	
	array("src" => "images/misc/sinistar-sprite.gif", "id" => "sinistar"),
			
	array("src" => "images/snow-bg.jpg", "id" => "snow-surface"),
	array("src" => "images/snow-bg-2.jpg", "id" => "snow-surface-2"),
	array("src" => "sounds/snow-1.xogg", "id" => "snow-1")
);

// routes
$app->get('/', function() use ($app) {
	return $app['twig']->render('game.twig.html', array());
})->bind('home');

$app->get('/js/game.js', function() use ($app, $asset_manifest) {
	//$app['session']->set('recipe-filters', array());
	
	clearstatcache();
	
	$new_manifet = array();
	$total_size = 0;
	foreach ($asset_manifest as $idx => $entry) {
		$path = __DIR__ . '/../web/' . trim($entry['src']);
		$realpath = realpath($path);
		$entry['size'] = filesize($realpath);
		
		$total_size += $entry['size'];
		$new_manifet[$entry['id']] = $entry;
	}
	
	$js = file_get_contents(__DIR__ . '/../web/js/game-source.js');
	
	
	$js = str_replace('"{{manifest-data}}"', json_encode($asset_manifest, JSON_PRETTY_PRINT), $js);
	$js = str_replace('"{{manifest-sizes}}"', json_encode(array('assets' => $new_manifet, 'total' =>$total_size), JSON_PRETTY_PRINT), $js);
	
	return new Response(
    $js,
    '200',
    array('Content-Type' => 'text/plain')
	);
})->bind('game.js');

$app->match('/scores/{action}', function($action) use ($app) {
	$resp = array();
	$is_success = true;
	$message = 'Success';
	
	switch ($action) {
		case 'list':
			$sql = "SELECT name, score, created FROM high_scores ORDER BY score DESC";
			$resp = $app['db']->fetchAll($sql);
			break;
		case 'submit':
			//$resp = $request;
			$ret = $app['db']->insert('high_scores',
				array(
					'name' => $app['request']->request->get('name'),
					'score' => $app['request']->request->get('score'),
					'created' => new \DateTime()
				),
				array(
					PDO::PARAM_STR,
					PDO::PARAM_INT,
					'datetime'
				)
			);
			
			$is_success = $ret == 1;
			
			break;
	}
	
	$payload = array(
		'success' => $is_success,
		'message' => $message,
		'payload' => $resp
	);
	
	return new Response(
    json_encode($payload),
    '200',
    array('Content-Type' => 'text/plain')
	);
})->bind('scores');

return $app;
