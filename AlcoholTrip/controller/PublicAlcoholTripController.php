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

}