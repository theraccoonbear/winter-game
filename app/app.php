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
	array("src" => "images/boarder-large.png", "id" => "boarder-large"),
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
			
	array("src" => "images/interaction/jump-center.png ", "id" => "jump-center"),
	array("src" => "images/interaction/jump-left.png", "id" => "jump-left"),
	array("src" => "images/interaction/jump-right.png", "id" => "jump-right"),
	
	array("src" => "images/misc/sinistar-sprite.gif", "id" => "sinistar"),
			
	array("src" => "images/snow-bg.jpg", "id" => "snow-surface"),
	array("src" => "images/snow-bg-2.jpg", "id" => "snow-surface-2"),
	array("src" => "sounds/snow-1.xogg", "id" => "snow-1")
);

// routes
$app->match('/', function() use ($app) {
	return $app['twig']->render('game.twig.html', array());
})->bind('home');

$app->match('/game.js', function() use ($app, $asset_manifest) {
	//$app['session']->set('recipe-filters', array());
	
	$new_manifet = array();
	$total_size = 0;
	foreach ($asset_manifest as $idx => $entry) {
		$entry['size'] = filesize(realpath( __DIR__ . '/../web/' . $entry['src']));
		$total_size += $entry['size'];
		$new_manifet[] = $entry;
	}
	
	$js = readfile(__DIR__ . '/../web/js/game.js');
	
	$js = preg_replace('/["\']<<manifest-data>>["\']/', json_encode($new_manifet));
	$js = preg_replace('/["\']<<manifest-size>>["\']/', $total_size);
	
	
	return $js; //$app['twig']->render('game.twig.html', array());
})->bind('home');



////Signature Sandwiches
//$app->match('/signature', function() use ($app) {
//	$app['session']->set('recipe-filters', array());
//	return $app['twig']->render('@desktop/signature/list.twig.html', array(
//	  'activeSection' => 'signature',
//	  'navColor' => 'magenta'
//	));
//})->bind('signature-list');
//
//$app->match('/signature/{index}', function($index) use ($app) {
//	if (SandwichExtension::sandwichExists($index)) {
//		$app['session']->set('recipe-filters', array());
//		return $app['twig']->render('@desktop/signature/detail.twig.html', array(
//			'index' => $index,
//			'activeSection' => 'signature',
//			'navColor' => 'magenta'
//		));
//	} else {
//		return $app->redirect('/signature');
//	}
//})->bind('signature-detail');
//
//
////Recipe Search
//$app->match('/recipe', function(Request $request) use ($app) {
//	$tags = array();
//	$fields = array();
//	foreach ($request->request->keys() as $id) {
//	  $pp = $request->request->get($id);
//	  $fields[$id] = $pp;
//	  if (strlen(trim($pp)) > 0) {
//			$val = preg_split('/\s*,\s*/', $pp);
//			$tags = array_merge($tags, $val);
//	  }
//	}
//	$app['session']->set('recipe-filters', $tags);
//
//	$origins = array(
//	  'signature' => 'Signature Sandwiches',
//	  'winner' => 'All Contest Winners',
//	  'entry' => 'All Contest Entries'
//	);
//
//	$types = array(
//	  'breakfast' => 'Breakfast',
//		'lunch || dinner' => 'Lunch/Dinner',
//	  'sweet' => 'Sweet',
//	  'savory' => 'Savory',
//	  'meatless' => 'Vegetarian'
//	);
//
//
//  $keywords = (array)ContentExtension::getTags();
//
//	return $app['twig']->render('@desktop/recipe/list.twig.html', array(
//	  'activeSection' => 'recipe',
//	  'navColor' => 'umber',
//	  'tags' => $tags,
//	  'fields' => $fields,
//	  'originFilters' => $origins,
//	  'typeFilters' => $types,
//	  'keywordFilters' => $keywords
//	));
//})->bind('recipe-list');
//
//$app->match('/recipe/{index}', function($index) use ($app) {
//
//	if (RecipeExtension::recipeExists($index)) {
//		$tags = $app['session']->get('recipe-filters');
//		$tags = is_array($tags) ? $tags : array();
//	
//		return $app['twig']->render('@desktop/recipe/detail.twig.html', array(
//			'index' => $index,
//			'activeSection' => 'recipe',
//			'navColor' => 'umber',
//			'tags' => $tags
//		));
//	} else {
//		return $app->redirect('/recipe');
//	}
//})->bind('recipe-detail');
//
//
////Contests
//$app->match('/contest', function() use ($app) {
//  $app['session']->set('recipe-filters', array());
//	return $app['twig']->render('@desktop/contest/list.twig.html', array(
//	  'activeSection' => 'contest',
//	  'navColor' => 'orange'
//	));
//})->bind('contest-list');
//
//
//
//
//$app->match('/contest/{index}/{sub}', function(Request $request, $index, $sub) use ($app, $db, $forms) {
//  $s3 = $app['aws']->get('s3');
//  $app['session']->set('recipe-filters', array());
//
//  $index = preg_replace('/[^A-Z-a-z0-9-]+/', '_', $index);
//  $twig_file = __DIR__ . '/../inc/desktop/default/contest/' . $index . '.twig.html';
//
//	$param_array = array(
//		'index' => $index,
//		'activeSection' => 'contest',
//		'navColor' => 'orange',
//		'hasErrors' => false
//	);
//
//  if (file_exists($twig_file)) {
//		$form = '';
//
//		if (in_array($index, array('terms', 'privacy', 'rules'))) { $param_array['navColor'] = 'magenta'; }
//
//		if ($index == 'enter' || $index == 'form') {
//			if ($app['contest-active'] === true) { // don't display contest form, et al unless we're in the contest window or explicitly enable it
//				if ($sub == 'thank-you') {
//					return $app['twig']->render('@desktop/contest/thank-you.twig.html', array());
//				} elseif ($sub == 'your-page') {
//					// do something...
//				} else {
//					$form = $forms->buildContestForm();
//
//					$form->handleRequest($request);
//
//
//					if ($form->isSubmitted()) {
//						$param_array['hasErrors'] = true;
//
//
//						if ($form->isValid()) {
//							$data = $forms->getContestData($form->getData());
//
//							$src_file = $data['photo_src'];
//							$base_dst_key = $data['photo_key'];
//							$ext = $data['photo_ext'];
//							$dst_key = $base_dst_key . '.' . $ext;
//
//							$cnt = 0;
//							while ($s3->doesObjectExist($app['aws.config']['bucket'], $dst_key)) {
//								$cnt++;
//								$dst_key = $base_dst_key . '_' . $cnt .  '.' . $ext;
//							}
//							unset($data['photo_src']);
//							unset($data['photo_key']);
//							unset($data['photo_ext']);
//
//							$data['photo'] = $dst_key;
//
//							$insert_id = $db->addContestEntry($data);
//
//							$results[] = $s3->putObject(array(
//								'Bucket'     => $app['aws.config']['bucket'],
//								'Key'        => $dst_key,
//								'SourceFile' => $src_file
//							));
//
//							return $app->redirect('thank-you');
//						}
//					}
//					$param_array['form'] = $form->createView();
//				} // general contest page
//			} else { // contest active?
//				return $app->redirect('/contest', 302);
//			}
//		} elseif (in_array($index, array('terms', 'privacy', 'rules'))) {// enter form
//			$param_array['noScrollTab'] = true;
//		}
//
//		return $app['twig']->render("@desktop/contest/$index.twig.html", $param_array);
//  } else {
//		return $app['twig']->render('@desktop/contest/list.twig.html', $param_array);
//  }
//})->value('index', '')->value('sub', '')->bind('contest-page');
//
//
////Meet the Cheeses
//$app->match('/cheese', function() use ($app) {
//	$app['session']->set('recipe-filters', array());
//
//	return $app['twig']->render('@desktop/cheese/list.twig.html', array(
//	  'activeSection' => 'cheese',
//	  'navColor' => 'blue'
//	));
//})->bind('cheese-list');
//
//$app->match('/cheese/{index}', function($index) use ($app) {
//	$app['session']->set('recipe-filters', array());
//
//	if (CheeseExtension::cheeseExists($index)) {
//		return $app['twig']->render('@desktop/cheese/detail.twig.html', array(
//			'index' => $index,
//			'activeSection' => 'cheese',
//			'navColor' => 'blue'
//		));
//	} else {
//		return $app->redirect('/cheese');
//	}
//})->bind('cheese-detail');
//
//
////Freebies
//$app->match('/freebies', function() use ($app) {
//	return $app['twig']->render('@desktop/freebie/list.twig.html', array(
//	  'activeSection' => 'freebie',
//	  'navColor' => 'green'
//	));
//})->bind('freebie-list');
//
//$app->match('/ajax/{action}', function(Request $request, $action) use ($app, $db) {
//	$resp = new \stdClass();
//	$resp->success = true;
//	$resp->payload = new \stdClass();
//	$resp->message = 'OK';
//
//	if ($action == 'email') {
//
//	  $email = $request->query->get('email');
//	  $resp->message = 'signed up';
//	  $resp->payload->email = $email;
//
//	  try {
//      if (!$resp->payload->db_resp = $db->addNewsSignup(array('email' => $email))) {
//        $resp->success = false;
//        $resp->message = 'DB error';
//      }
//	  } catch (Exception $ex) {
//      $resp->success = false;
//      $resp->message = 'unable to save';
//	  }
//	}
//
//	return new Response(
//	  json_encode($resp),
//	  200,
//	  array('Content-Type' => 'text/plain')
//	);
//})->bind('ajax');
//
//
//$app->match('/admin', function() use ($app, $db) {
//  return $app['twig']->render('@desktop/admin/index.twig.html', array());
//})->bind('admin-index');
//
//$app->match('/login', function (Request $request) use ($app, $users) {
//	return $users->login();
//})->bind('login');
//
//
//$app->match('/logout', function() use ($app, $users) {
//	$users->logout();
//})->bind('logout');
//
//$app->match('/admin/{section}', function(Request $request, $section) use ($app, $db, $forms, $users) {
//
//	if (false === $user = $users->loggedUser()) {
//		return $app->redirect('/login?redir=' . $app['request']->server->get('REQUEST_URI'));
//	}
//
//	$section = strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $section));
//
//	$all_entries = $db->getFullContestEntries();
//	$idx = $request->query->get('idx', false);
//
//	$app['twig']->addGlobal('entries', $all_entries);
//	$app['twig']->addGlobal('idx', $idx);
//
//	switch ($section) {
//		case 'sandbox':
//			return $app['twig']->render('@desktop/admin/sandbox.twig.html', array(
//				'test_data' => $db->getFullContestEntries()
//			));
//			break;
//		case 'entries':
//			if ($idx !== false) {// && array_key_exists($idx, $all_entries)) {
//				$entry = false;
//				foreach ($all_entries as $i => $ent) {
//					if ($ent['idx'] == $idx) {
//						$entry = $ent;
//						break;
//					}
//				}
//
//				if ($entry === false) {
//					return '';
//				}
//
//				$form = $forms->buildRatingsForm($all_entries[$idx]);
//
//				$form->handleRequest($request);
//
//				if ($form->isSubmitted()) {
//					$data = $form->getData();
//					$data['meta'] = new \stdClass();
//					$data['meta']->reviewer = $data['reviewer'];
//					unset($data['reviewer']);
//					$db->rateContestEntry($data);
//				}
//
//				return $app['twig']->render('@desktop/admin/view-entry.twig.html', array(
//					'form' => $form->createView(),
//					'entries' => array_reverse($db->getFullContestEntries()),
//					'entry' => $entry
//				));
//			} else {
//				$filter_form = $forms->buildEntryFilterForm();
//				$filter_form->handleRequest($request);
//				$total_entry_count = count($all_entries);
//				$filtered_entry_count = $total_entry_count;
//
//				if ($filter_form->isSubmitted()) {
//					$form_data = $filter_form->getData();
//					$score_filter = strlen(trim($form_data['score'])) > 0 ? $form_data['score'] : false;
//					$cheese_filter = strlen(trim($form_data['cheese'])) > 0 ? $form_data['cheese'] : false;
//					$all_entries = $forms->filterEntries($all_entries, $score_filter, $cheese_filter);
//					$filtered_entry_count = count($all_entries);
//				}
//
//				$all_entries = array_reverse($all_entries);
//
//				$percentage_shown = sprintf('%.2f', ($filtered_entry_count / $total_entry_count) * 100);
//
//				return $app['twig']->render('@desktop/admin/entries.twig.html', array(
//					'filter_form' => $filter_form->createView(),
//					'entries' => $all_entries,
//					'total_count' => $total_entry_count,
//					'display_count' => $filtered_entry_count,
//					'percentage' => $percentage_shown
//				));
//			}
//			break;
//		default:
//			return $app['twig']->render('@desktop/error.twig.html', array(
//				'code'    => '404',
//				'message' => 'Invalid section'
//			));
//	}
//})->value('section', 'index')->bind('admin-section');
//
//$app->get('/login', function(Request $request) use ($app) {
//    return $app['twig']->render('login.html', array(
//        'error'         => $app['security.last_error']($request),
//        'last_username' => $app['session']->get('_security.last_username'),
//    ));
//});
//
//$app->match('/sitemap{type}', function($type) use ($app) {
//  $output = '';
//  if ($type == '.xml') {
//	return new Response(
//	  $app['twig']->render('@desktop/sitemap.twig.xml'),
//	  200,
//	  array('Content-Type' => 'text/plain')
//	);
//  } elseif ($type == '.txt') {
//	return new Response(
//	  $app['twig']->render('@desktop/sitemap.twig.txt'),
//	  200,
//	  array('Content-Type' => 'text/plain')
//	);
//  } else {
//	return $app['twig']->render('@desktop/sitemap.twig.html', array('navColor' => 'magenta', 'noScrollTab' => true));
//  }
//})->value('type', '.html')->bind('site-map');
//
//$app->match('/{type}.txt', function($type) use ($app) {
//  $output = '';
//  if ($type == 'humans') {
//		$output = $app['twig']->render('@desktop/humans.twig.txt', array());
//  } else {
//		$output = $app['twig']->render('@desktop/robots.twig.txt', array());
//  }
//
//  return new Response(
//		$output,
//		200,
//		array('Content-Type' => 'text/plain')
//  );
//})->bind('txt');
//
//// old site static page (disabled post-contest, 5/21/2014)
//$app->match('/mediaresources.html', function() use ($app) {
//	//return $app['twig']->render('@desktop/mediaresources.twig.html');
//	return $app->redirect('/', 301);
//})->bind('media-resources');
//
//$app->match('/{wildcard}', function($wildcard) use ($app) {
//
//  $sandwiches = $app['content']->getSandwiches();
//  foreach ($sandwiches as $idx => $sand) {
//		$l = preg_replace('/-/', '', $sand->key);
//		if ($wildcard == $l) {
//			return $app->redirect($app['url_generator']->generate('signature-detail', array('index' => $sand->key)), 301);
//		}
//  }
//
//  return $app->redirect('/');
//})->bind('wildcard');
//
//
return $app;
