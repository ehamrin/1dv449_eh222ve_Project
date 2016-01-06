<?php
namespace plugin\AlcoholTrip\view;

use plugin\AlcoholTrip\model\AlcoholTripModel;

class AlcoholTripView
{
    private $application;

    public function __construct(\Application $application, AlcoholTripModel $model)
    {
        $this->application = $application;
        $this->model = $model;
    }

    public function getSearchValue()
    {
        return $_GET['search'] ?? "";

    }

    public function getSearchResult(){
        $ret = "";
        if(isset($_GET['search'])){
            $res = $this->model->searchProduct($_GET['search']);
            if(count($res)){
                foreach($res as $row){
                    $ret .= '<li>
                        <span class="title">' . $row->name . ' (' . $row->alcohol . ')</span>
                        <span class="producer">Producerad av:' . $row->producer . '</span>
                        <span class="price">' . $row->price . 'kr</span>
                        <span class="container">' . $row->volume . 'ml (' . $row->container . ')</span>
                    </li>';
                }

                return '<ul>' . $ret . '</ul>';
            }
        }
        return $ret;
    }

    public function RenderModule(){
        $this->application->AddScriptDependency('/js/AlcoholTrip/trip-calculator.js');
        $this->application->AddCSSDependency('/css/AlcoholTrip/style.css');

        $searchResult = $this->getSearchresult();

        return <<<HTML
        <div id="result"></div>
        <form action="" id="search_form" method="GET" class="inline-2-3">
        <input type="search" name="search" id="product_search" value="{$this->getSearchValue()}"/>
        <div id="search_result" class="product-list">{$searchResult}</div>
</form>
<div class="module-sidebar inline-1-3">
<h2>Varukorg</h2>
<div id="cart" class="product-list">Din varukorg är tom</div>
<h2>Milförbukning</h2>
    <input id="gasConsumption" type="number" step="0.05" min="0" max="3" value="0.4"/>l/mil
<h2>Plats</h2>
    <select id="location">
        <option disabled>--Välj stad--</option>
        <option value="Malmö">Malmö</option>
        <option value="Stockholm">Stockholm</option>
        <option value="Västerås">Västerås</option>
        <option value="Luleå">Luleå</option>
        <option value="Kalmar">Kalmar</option>
        <option value="Vänersborg">Vänersborg</option>
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
<script src="/js/AlcoholTrip/trip-calculator.js"></script>
HTML;

    }
}