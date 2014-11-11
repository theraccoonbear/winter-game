<?php

header('Content-type: text/html');

$sizes = array();
$total_size = 0;

if (array_key_exists('manifest', $_POST)) {
	$man = $_POST['manifest'];

	$root = $_SERVER['DOCUMENT_ROOT'] . '/';
	
	foreach ($man as $idx => $entry) {
		$src = $entry['src'];
		$size = 0;
		if (!preg_match('/\.{2}/', $src)) {
			$path = $root . $src;
			if (file_exists($path)) {
				$size = filesize($path);
			}
			$entry['size'] = $size;
			$total_size += $size;
			$sizes[$entry['id']] = $entry;
		}		
	}
}

$payload = array(
	'assets' => $sizes,
	'total' => $total_size
);

print json_encode($payload, JSON_PRETTY_PRINT);