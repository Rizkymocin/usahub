<?php
$file = 'storage/logs/laravel.log';
$lines = file($file);
$lastLines = array_slice($lines, -50);
foreach ($lastLines as $line) {
    echo $line;
}
