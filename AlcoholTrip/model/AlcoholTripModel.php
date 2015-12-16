<?php
namespace plugin\AlcoholTrip\model;

class AlcoholTripModel
{
    private $conn;

    public function __construct(){
        $this->conn = \Database::GetConnection();
    }

    public function Install(){

    }

    public function Uninstall(){

    }

    public function IsInstalled(){
        return true;
    }

}