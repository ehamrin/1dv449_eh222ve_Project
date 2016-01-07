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
    private $systemet;
    private $view;
    private $publicController;

    public function __construct(\Application $application){
        $this->application = $application;

        //Models
        $this->systemet = new model\SystemetAPI();
        $google = new model\GoogleAPI();
        $twitter = new model\TwitterAPI();

        //Views
        $this->view = new view\View($this->application, $this->systemet, $google, $twitter);

        //Controllers
        $this->publicController = new controller\PublicController($this->application, $this->systemet, $google, $twitter, $this->view);
    }

    function Init($method="Index", ...$params){
        if(method_exists($this->publicController, $method)){
            return $this->publicController->{$method}(...$params);
        }
        return false;
    }

    public function Index(...$params){
        return 'AlcholTripIndex';
    }

    public function Install(){
        $this->systemet->Install();
    }

    public function UnInstall(){
        $this->systemet->Uninstall();
    }

    public function IsInstalled(){
        return $this->systemet->IsInstalled();
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
        return $this->publicController->DynamicJSON($filename);
    }
}