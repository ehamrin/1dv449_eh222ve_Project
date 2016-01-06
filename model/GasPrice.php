<?php


namespace plugin\AlcoholTrip\model;


class GasPrice
{
    public $gas;
    public $diesel;
    public $ethanol;

    private $gasCount = array();
    private $dieselCount = array();
    private $ethanolCount = array();

    public function addGas($price){
        $this->addEntry('gas', $price);
    }

    public function addDiesel($price){
        $this->addEntry('diesel', $price);
    }

    public function addEthanol($price){
        $this->addEntry('ethanol', $price);
    }

    private function addEntry($var, $priceToAdd){
        $average = 0;
        $this->{$var . 'Count'}[] = $priceToAdd;

        foreach($this->{$var . 'Count'} as $price){
            $average += $price;
        }

        $this->{$var} = $average / count($this->{$var . 'Count'});
    }
}