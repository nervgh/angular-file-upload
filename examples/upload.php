<?php

if ( !empty( $_FILES ) ) {

    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadPath = dirname( __FILE__ ) . '\uploads\\' . $_FILES[ 'file' ][ 'name' ];

    move_uploaded_file( $tempPath, $uploadPath );

    echo 'File transfer completed';

} else {

    echo 'No files';

}

?>