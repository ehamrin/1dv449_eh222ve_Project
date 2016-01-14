<?php
namespace plugin\AlcoholTrip\view;

use plugin\AlcoholTrip\model\SystemetAPI;
use plugin\AlcoholTrip\model\GoogleAPI;
use plugin\AlcoholTrip\model\TwitterAPI;

class View
{
    private $application;

    public function __construct(\Application $application, SystemetAPI $systemet)
    {
        $this->application = $application;
        $this->systemet = $systemet;
    }

    public function RenderModule(){
        //Make sure our scripts and css get loaded
        $this->application->AddScriptDependency('/js/AlcoholTrip/trip-calculator.min.js');
        $this->application->AddCSSDependency('/css/AlcoholTrip/style.min.css');

        return <<<HTML
        <div id="result">
            <div id="view_results"><i class="fa fa-eye"></i></div>
            <div id="result_banner"></div>
        </div>
        <form action="" id="search_form" method="GET" class="inline-2-3">
        <div id="search_bar">
            <input type="search" name="search" autocomplete="off" placeholder="Sök efter varor på systembolaget" id="product_search"/>
            <span class="clear-helper">x</span>
        </div>
        <div id="search_result" class="product-list"></div>
</form>
<div id="cart_menu"></div>
<div class="module-sidebar inline-1-3">
<h2>Varukorg</h2>
<div id="cart" class="product-list">Din varukorg är tom</div>
<h2>Milförbukning</h2>
    <select id="gas_type">
        <option value="gas" selected>Bensin</option>
        <option value="diesel">Diesel</option>
        <option value="ethanol">Etanol</option>
    </select>
    <input id="gasConsumption" type="number" step="0.05" min="0" max="3" value="0.4"/>l/mil
<h2>Plats</h2>
    <select id="location">
        <option disabled>--Välj stad--</option>
        <option value="Malmö">Malmö</option>
        <option value="Stockholm">Stockholm</option>
        <option value="Västerås">Västerås</option>
        <option value="Luleå">Luleå</option>
        <option value="Kalmar">Kalmar</option>
        <option value="Trollhättan">Trollhättan</option>
        <option value="Göteborg">Göteborg</option>
    </select>
    <h3>Destination</h3>
    <select id="destination">
        <option disabled>--Välj bordershop--</option>
        <option value="Neue Goorstorfer Strasse 50, 18146 Rostock, Germany">Calle Rostock</option>
        <option value="Dorfstr. 8, 25927 Aventoft, Tyskland">Calle Aventoft</option>
        <option value="Norderstrasse 1, 25923 Süderlügum, Tyskland">Calle Süderlügum</option>
        <option value="Grönfahrtweg 28, 24955 Harrislee, Tyskland">Calle Harrislee</option>
        <option value="Zur Kupfermühle 13 Kupfermühle, 24955 Harrislee, Tyskland">Calle Kobbermølle</option>
    </select>
</div>
HTML;

    }
}