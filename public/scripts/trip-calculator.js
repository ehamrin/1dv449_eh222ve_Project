var products = localStorage.getItem('rawProducts') ? JSON.parse(localStorage.getItem('rawProducts')) : {};
var distances = localStorage.getItem('distances') ? JSON.parse(localStorage.getItem('distances')) : {};

var distanceXHR;

var Result = {
    showDetails: function(){

        var localCost = Cart.total;
        var borderCost = Cart.borderPrice + (GasConsumption.liter * 12.48 * 2);

        var html = '<div id="result_details">';
        html += "<span><strong>Bensinförbrukning:</strong> " + parseFloat(Gas.get()) + "</span>";
        html += "<span><strong>Avstånd:</strong> " + Math.round(Distance.mile) + " mil</span>";
        html += "<span><strong>Literförbrukning:</strong> " + Math.round(GasConsumption.liter * 2) + " liter</span>";
        html += "<span><strong>" + GasPrice.getText() + "pris:</strong> " +  GasPrice.getPrice().toFixed(2) + "kr/liter</span>";
        html += "<span><strong>Total resekostnad:</strong> " + Math.round(GasConsumption.liter * GasPrice.getPrice() * 2) + "kr</span>";
        html += "<span><strong>Alkoholpris:</strong> " +  Math.round(Cart.borderPrice) + "kr</span>";
        html += "<span><strong>Systemetpris:</strong> " +  Math.round(Cart.total) + "kr</span>";
        html += "</div>";

        var type = borderCost < localCost ? "success" : "error";

        swal({
            title: "Detaljer",
            text: html,
            html: true,
            type: type
        });
    },

    calculate: function(){
        var localCost = Cart.total;
        var borderCost = Cart.borderPrice + (GasConsumption.liter * GasPrice.getPrice() * 2);
        var resultContainer = $("#result");

        if(localCost){
            var html;

            if(borderCost < localCost){
                html = '<p class="success">Du sparar ' + Math.round(localCost - borderCost) + 'kr på att åka iväg</p>';
            }else if(borderCost == localCost){
                html = '<p class="error">Du går jämt upp på åka iväg,<br/> är det värt det?</p>';
            }else{
                html = '<p class="error">Du sparar ' + Math.round(borderCost - localCost) + 'kr<br/>på att stanna hemma</p>';
            }

            $("#result_banner").html(html);
            resultContainer.show();
        }else{
            resultContainer.hide();
        }

    }
};

var GasPrice = {
    isValid: function(){
        var cache = JSON.parse(localStorage.getItem('gasPrice'));

        if(!cache){
            return false;
        }

        var currentDate = new Date();
        var cachedDate = new Date(cache.date);
        currentDate.setHours(0,0,0,0);
        cachedDate.setHours(0,0,0,0);

        return currentDate.getTime() >= cachedDate.getTime();
    },

    get: function(){
        if(GasPrice.isValid()){
            return JSON.parse(localStorage.getItem('gasPrice'));
        }else{
            $.ajax({
                type: "GET",
                url: "/json/AlcoholTrip/gas_price.json",
                success: function(response){
                    console.log("got new price", response);
                    localStorage.setItem('gasPrice', JSON.stringify(response));
                    return JSON.parse(localStorage.getItem('gasPrice'));
                }
            });
        }
    },
    getPrice: function(){
        var prices = GasPrice.get();
        var selected = $("#gas_type").val();
        return prices[selected];
    },
    getText: function(){
        return $("#gas_type option:selected").text();
    }
};

var GasConsumption = {
    liter: 0,
    update: function(){
        GasConsumption.liter = Distance.mile * parseFloat(Gas.get());
        Result.calculate();
    }
};

var Distance = {
    mile: 0,
    update: function(){
        var from = $("#location").val();
        var to = $("#destination").val();

        if(from && to){
            if(!distances[from]){
                distances[from] = {};
            }

            if(distances[from][to]){
                Distance.mile = distances[from][to];
                GasConsumption.update();
            }else{
                distanceXHR = $.ajax({
                    type: "GET",
                    url: "/json/AlcoholTrip/distance.json?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to),
                    success: function(distance){
                        Distance.mile = parseInt(distance)/10000;
                        GasConsumption.update();
                        distances[from][to] = Distance.mile;
                        localStorage.setItem('distances', JSON.stringify(distances));
                    }
                });
            }
        }
    },
    has: function(trip){
        return !!distances[trip];
    }
};

var Gas = {
    get: function(){
        if(!localStorage.getItem('gasConsumption')){
            Gas.set($("#gasConsumption").val());
        }
        return localStorage.getItem('gasConsumption')
    },

    set: function(consumption){
        localStorage.setItem('gasConsumption', consumption);
    },

    draw: function(){
        var consumption = Gas.get();
        if(consumption){
            $("#gasConsumption").val(consumption);
        }
    }
};

var Locator = {
    has: function(){
        var city = localStorage.getItem('userCity');

        return city != null;
    },

    update: function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }

        // Get the latitude and the longitude;
        function successFunction(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            $.ajax({
                type: "GET",
                url: "/json/AlcoholTrip/location.json?lat=" + lat + "&long=" + lng,
                success: function(city){
                    Locator.set(city);
                    Locator.draw();
                }
            });
        }

        function errorFunction(){
            console.error('Could not retrieve location');
        }
    },

    set: function(city){
        localStorage.setItem('userCity', city);
    },

    get: function(){
        if(!Locator.has()){
            Locator.update();
        }

        return localStorage.getItem('userCity');
    },

    draw: function(){
        var location = Locator.get();
        var locationSelect = $("#location");

        if(!$("#location option[value='" + location + "']").length && location){
            locationSelect.append('<option value="' + location + '">' + location + '</option>');
            locationSelect.val(location).change();
        }
    }
};

var Cart = {
    total: 0,
    borderPrice: 0,

    get: function(){
        var cart = sessionStorage.getItem("products");
        return cart ? JSON.parse(cart) : {};
    },
    add: function(id){

        swal({
            title: "Steg 1(2)",
            text: 'Hur många vill du köpa av "'  + products[id].name + '"?',
            type: "input",
            inputType: "number",
            inputValue: (Cart.get()[id] ? Cart.get()[id].qty : null),
            showCancelButton: true,
            confirmButtonColor: "#5dc2f1",
            confirmButtonText: "Gå vidare",
            cancelButtonText: "Avbryt",
            closeOnConfirm: false,
            closeOnCancel: true
        }, function (qty) {
            if (qty === false) return false;
            if (qty <= 0) {
                swal.showInputError("Du måste lägga till minst en vara!");
                return false;
            }

            swal({
                title: "Steg 2(2)",
                text: "Hur mycket kostar det i bordershoppen? På systemet kostar det " + (Math.round(products[id].price) * qty) + "kr",
                type: "input",
                inputType: "number",
                inputValue: (Cart.get()[id] ? Cart.get()[id].price : null),
                showCancelButton: true,
                confirmButtonColor: "#5dc2f1",
                confirmButtonText: "Lägg till",
                cancelButtonText: "Avbryt",
                closeOnConfirm: false,
                closeOnCancel: true
            }, function (cost) {
                if (cost === false) return false;
                if (cost <= 0) {
                    swal.showInputError("Det kan inte vara gratis!");
                    return false;
                }

                var cart = Cart.get();

                cart[id] = {
                    item: products[id],
                    qty: qty,
                    price: cost,
                    localPrice: qty * products[id].price
                };

                sessionStorage.setItem("products", JSON.stringify(cart));
                Cart.draw();
                Result.calculate();

                swal.close();
            });

        });
    },

    draw: function(){
        var html = "";

        Cart.total = 0;
        Cart.borderPrice = 0;

        $.each(Cart.get(), function(id, product) {
            var el = product.item;
            Cart.total += parseFloat(el.price) * parseFloat(product.qty);
            Cart.borderPrice += parseFloat(product.price);

            html += '<li class="cart-item" data-id="' + id + '">' +
                '<div class="remove" data-remove="' + id + '"><i class="fa fa-times-circle"></i></div>' +
                '<div class="product" data-id="' + id + '">' +
                '<span class="title">' + el.name + ' (' + el.alcohol + ')</span>' +
                '<span class="price">' + product.qty + 'st á ' + el.price + 'kr (' + product.localPrice + 'kr)</span>' +
                '<span class="borderprice">' + product.price + 'kr på bordershop</span>' +
                '</div>' +
                '</li>';
        });

        if(html != ""){
            html = "<ul>" + html + "</ul><p>Totalt på systembolaget:" + Cart.total + "kr</p><p>Totalt på bordershop:" + Cart.borderPrice + "kr</p>";
        }else{
            html = "<p>Din varukorg är tom...</p>"
        }

        $("#cart").html(html);
    },

    remove: function(id){
        var cart = Cart.get();

        if(cart[id]){
           delete cart[id];
        }

        sessionStorage.setItem("products", JSON.stringify(cart));
        Cart.draw();
        Result.calculate();
    },

    empty: function(id){
        var cart = {};
        sessionStorage.setItem("products", JSON.stringify(cart));
        Cart.draw();
    }
};

$(document).ready(function(){

    var resultContainer = $('#search_result');

    function AddSearchResults(json){

        var html = "";
        resultContainer.empty();

        json.forEach(function(el){
            products[el.id] = el;
            localStorage.setItem('rawProducts', JSON.stringify(products));

            html += '<li class="product" data-id="' + el.id + '">' +
                '<span class="title">' + el.name + ' (' + el.alcohol + ')</span>' +
            '<span class="producer">Producerad av:' + el.producer + '</span>' +
            '<span class="price">' + el.price + 'kr</span>' +
            '<span class="container">' + el.volume + 'ml (' + el.container + ')</span>' +
            '</li>';
        });

        if(html != ""){
            $('#search_result').html("<ul>" + html + "</ul>")
        }
    }


    var xhr;
    var searchBar = $("#product_search");

    searchBar.focus();
    searchBar.keyup(function(e){

        if(xhr){
            xhr.abort();
        }

        if(e.target.value.length >= 3){

           xhr = $.ajax({
               type: "GET",
               url: "/json/AlcoholTrip/products.json?search=" + e.target.value,
               success: AddSearchResults
           });

        }else if(e.target.value.length == 0){
            resultContainer.empty();
        }
    });

    $("#search_form").submit(function(e){
        e.preventDefault();
    });

    var cartElement = $("#cart");

    cartElement.on("click", ".remove", function(e){
        var element = $(this);
        if(!element.hasClass("remove")){
            element = element.closest(".remove");
        }

        var id = element.data("remove");
        Cart.remove(id);
    });

    cartElement.on('click', '.product', function(e){
        var element = $(this);
        if(!element.hasClass("product")){
            element = element.closest(".product");
        }

        var id = element.data("id");
        Cart.add(id);
    });

    resultContainer.on('click', 'li', function(e){
        var id = $(this).data("id");
        Cart.add(id);
    });

    $("#gasConsumption").on("change",function(){
        Gas.set($(this).val());
        GasConsumption.update();
    });

    $("#location").on("change", Distance.update);
    $("#gas_type").on("change", Result.calculate);
    $("#destination").on("change", Distance.update);
    $("#view_results").on("click", Result.showDetails);

    $('#cart_menu').click(function(e){
        $('body').toggleClass('active');
    });

    Cart.draw();
    Locator.draw();
    Gas.draw();
    Distance.update();
});