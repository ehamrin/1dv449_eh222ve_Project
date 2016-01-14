<?php
namespace plugin\AlcoholTrip\controller;

use plugin\AlcoholTrip\model;
use plugin\AlcoholTrip\view;

class PublicController
{
    public function __construct(\Application $application, model\SystemetAPI $systemet, model\GoogleAPI $google, model\TwitterAPI $twitter, view\View $view){
        $this->view = $view;

        $this->systemet = $systemet;
        $this->google = $google;
        $this->twitter = $twitter;
    }

    public function AlcoholTrip(...$args){
        return $this->view->RenderModule();
    }

    public function DynamicJSON($filename){
        $possibleError = "Unknown error";

        switch($filename){
            case "products.json":
                if(isset($_GET['search'])){
                    $content = $this->systemet->searchProduct($_GET['search']);
                    $possibleError = "Could not complete a product search";
                }
                break;
            case "location.json":
                if(isset($_GET['lat'], $_GET['long'])){
                    $content = $this->google->getCity($_GET['lat'], $_GET['long']);
                    $possibleError = "Could not retrieve your city";
                }
                break;
            case "distance.json":
                if(isset($_GET['from'], $_GET['to'])){
                    $content = $this->google->getDistance($_GET['from'], $_GET['to']);
                    $possibleError = "Could not retrieve distance between {$_GET['from']} and {$_GET['to']}";
                }
                break;
            case "gas_price.json":
                $content = $this->twitter->getGasPrice();
                $possibleError = "Could not retrieve gas prices";
                break;
        }

        if(isset($content)){
            if($content !== false){
                return json_encode($content);
            }else{
                header("HTTP/1.0 400 Bad Request");
                $error = new \stdClass();
                $error->message = $possibleError;
                return json_encode($error);
            }
        }

        return false;
    }

}