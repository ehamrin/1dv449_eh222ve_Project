<?php


namespace plugin\AlcoholTrip\model;


class GasPrice
{
    public $gas;
    public $diesel;
    public $ethanol;
    public $date;

    private $gasCount = array();
    private $dieselCount = array();
    private $ethanolCount = array();

    public function __construct($tweet_array){

        //Set todays date for frontend caching
        $this->date = date('Y-m-d');

        try {
            $regexArray = array(
                'gas' => 'B95',
                'diesel' => 'Diesel',
                'ethanol' => 'E85'
            );

            foreach ($tweet_array as $tweet) {
                $text = $tweet["text"];

                foreach ($regexArray as $key => $val) {
                    preg_match('/' . $val . ': (.*)/', $text, $m);
                    if (isset($m[1])) {
                        $price = str_replace(',', '.', $m[1]);
                        $price = floatval($price);
                        $this->addEntry($key, $price);
                    }
                }
            }
        }catch (\Exception $e){
            $this->gas = 12.43;
            $this->diesel = 11.51;
            $this->ethanol = 11.68;
        }
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