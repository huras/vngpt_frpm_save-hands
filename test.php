<?php

// download the image with url https://content6.bustybloom.com/bellaclub.com/0808/tn_12.jpg
// and save it to the file test.jpg
$url = 'https://content6.bustybloom.com/bellaclub.com/0808/tn_12.jpg';
$img = 'test.jpg';
file_put_contents($img, file_get_contents($url));
