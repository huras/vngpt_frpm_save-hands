<?php
// Get the URL of the image to be fetched from the query parameter
$imageUrl = urldecode($_GET['url']);

// Set the appropriate Content-Type header based on the image type (e.g., JPEG)
header('Content-Type: image/jpeg'); // Change to the appropriate content type if needed

// Disable caching to ensure that the latest image is fetched
// header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
// header('Cache-Control: post-check=0, pre-check=0', false);


// header('Pragma: cache');
//Turn cache ensuring cahed image is fetched
header('Cache-Control: max-age=3600, public');

// Fetch the image from the external server and serve it

readfile($imageUrl);
