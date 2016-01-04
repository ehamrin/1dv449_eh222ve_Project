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
                        <span class="producer">' . $row->producer . '</span>
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

        $searchResult = $this->getSearchresult();

        return <<<HTML
        <form action="" id="search_form" method="GET">
        <input type="search" name="search" id="product_search" value="{$this->getSearchValue()}"/>
        <div id="search_result">{$searchResult}</div>
</form>
<div class="module-sidebar">
<h2>Varukorg</h2>
Din varukorg är tom
<h2>Milförbukning</h2>
    <input type="number" step="0.05" min="0" max="3" value="0.4"/>l/mil
<h2>Plats</h2>
    <select>
        <option>Stockholm</option>
        <option>Västerås</option>
        <option>Luleå</option>
        <option>Malmö</option>
        <option>Kalmar</option>
        <option>Vänersborg</option>
        <option>Göteborg</option>
    </select>
<h2>Resultat</h2>
<p>Visa upp resultat om det är värt det eller inte</p>
</div>
<script src="/js/AlcoholTrip/trip-calculator.js"></script>
HTML;

    }
}