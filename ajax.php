<?php
    $bombo = $_REQUEST["numeros"];
    $numeroBolas = count($bombo);
    $bolaExtraida = rand(0, $numeroBolas-1);
    echo $bolaExtraida;
?>