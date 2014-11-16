<?php

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

//ini_set("default_charset", 'utf-8');

$app = require(__DIR__ . '/../app/app.php');

$app->run();


