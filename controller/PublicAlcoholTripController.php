<?php
namespace plugin\AlcoholTrip\controller;

use plugin\AlcoholTrip\model;
use plugin\AlcoholTrip\view;

class PublicAlcoholTripController
{
    public function __construct(\Application $application, model\AlcoholTripModel $model, view\AlcoholTripView $view){
        $this->view = $view;
        $this->model = $model;
    }

    public function AlcoholTrip(...$args){
        return $this->view->RenderModule();
    }

    public function DynamicJSON($filename){

        switch($filename){
            case "products.json":
                if(isset($_GET['search'])){
                    $content = $this->model->searchProduct($_GET['search']);
                    die();
                }
                break;
            case "location.json":
                if(isset($_GET['lat'], $_GET['long'])){
                    $content = $this->model->getCity($_GET['lat'], $_GET['long']);
                }
                break;
            case "distance.json":
                if(isset($_GET['from'], $_GET['to'])){
                    $content = $this->model->getDistance($_GET['from'], $_GET['to']);
                }
                break;
            case "gas_price.json":
                $content = $this->model->getGasPrice();
                break;
        }

        if(isset($content)){
            if($content !== false){
                return json_encode($content, JSON_PRETTY_PRINT);
            }else{
                header("HTTP/1.0 400 Bad Request");
                return json_encode("Unknown error");
            }
        }

        return false;
    }

}