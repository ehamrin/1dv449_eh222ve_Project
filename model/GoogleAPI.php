<?php


namespace plugin\AlcoholTrip\model;


class GoogleAPI
{
    public function getCity($lat, $long){
        $url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=";
        $url .= round($lat,2).",";
        $url .= round($long,2);

        $jsonfile = file_get_contents($url.'&sensor=false');
        $jsonarray = json_decode($jsonfile);

        if (isset($jsonarray->results[1]->address_components[1]->long_name)) {
            return($jsonarray->results[1]->address_components[1]->long_name);
        }
        return false;
    }

    public function getDistance($from, $to){
        $mode = "drive";

        $url = "http://maps.googleapis.com/maps/api/directions/json?origin=";
        $url .= urlencode($from);
        $url .= "&destination=";
        $url .= urlencode($to);
        $url .= "&sensor=false&language=sv&mode=$mode";

        $jsonfile = file_get_contents($url);
        $jsonarray = json_decode($jsonfile);

        if (isset($jsonarray->routes[0]->legs[0]->distance->value)) {
            return($jsonarray->routes[0]->legs[0]->distance->value);
        }
        return false;
    }

}