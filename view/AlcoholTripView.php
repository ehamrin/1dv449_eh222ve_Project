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

    public function RenderModule(){

        $this->model->GetProducts();

        return <<<HTML
        <form action="" method="POST">
        <input type="search" name="search_term"/>
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