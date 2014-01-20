<?php

if ( !empty( $_FILES ) && array_key_exists('file', $_FILES)) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadName = $_FILES[ 'file' ][ 'name' ];

    $pattern = '/^([A-z0-9\-_]+[\.]?)?[A-z0-9\-_]+\.(gif|jpg|jpeg|png)$/';
    if(!preg_match($pattern, $uploadName, $hits)) {
    	header("HTTP/1.0 400 Bad Request");
    	exit();
    }

    $uploadPath = dirname( __FILE__ ) . '/uploads/' . $uploadName;

    move_uploaded_file( $tempPath, $uploadPath );

    $answer = array( 'answer' => 'File transfer completed' );
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>