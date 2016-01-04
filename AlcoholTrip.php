<?php


namespace plugin\AlcoholTrip;

/**
 * @Name Alcohol Trip Module
 * @Description A module to calculate travel cost for booze
 * @Author Erik Hamrin
 * @Version v0.5
 * @Icon fa-users
 */


class AlcoholTrip implements \IPlugin
{
    private $model;
    private $view;
    private $adminController;
    private $publicController;

    public function __construct(\Application $application){
        $this->application = $application;
        $this->model = new model\AlcoholTripModel();
        $this->view = new view\AlcoholTripView($this->application, $this->model);

        $this->adminController = new controller\AdminAlcoholTripController($this->application, $this->model, $this->view);
        $this->publicController = new controller\PublicAlcoholTripController($this->application, $this->model, $this->view);
    }

    function Init($method="Index", ...$params){
        if(method_exists($this->publicController, $method)){
            return $this->publicController->{$method}(...$params);
        }
        return false;
    }

    public function AdminPanelInit($method = "Index", ...$params)
    {
        if(method_exists($this->adminController, $method)) {
            return $this->adminController->{$method}(...$params);
        }

        return false;
    }

    public function Index(...$params){
        return 'AlcholTripIndex';
    }

    public function Install(){
        $this->model->Install();
    }

    public function UnInstall(){
        $this->model->Uninstall();
    }

    public function IsInstalled(){
        return $this->model->IsInstalled();
    }

    public function HookPageModules(){
        return array(
            'AlcoholTrip'
        );
    }

    public function HookPageModuleAlcoholTrip(...$args){
        return $this->publicController->AlcoholTrip(...$args);
    }

    public function HookJSON($filename){
        switch($filename){
            case "products.json":
                if(isset($_GET['search'])){
                    $res = $this->model->searchProduct($_GET['search']);
                    return json_encode($res, JSON_PRETTY_PRINT);
                }
                break;
        }

        return false;
    }
}