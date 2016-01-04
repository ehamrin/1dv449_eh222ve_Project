$(document).ready(function(){

    var resultContainer = $('#search_result');
    function AddSearchResults(json){

        var html = "";
        resultContainer.empty();

        json.forEach(function(el){
            html += '<li>' +
                '<span class="title">' + el.name + ' (' + el.alcohol + ')</span>' +
            '<span class="producer">' + el.producer + '</span>' +
            '<span class="price">' + el.price + 'kr</span>' +
            '<span class="container">' + el.volume + 'ml (' + el.container + ')</span>' +
            '</li>';
        });

        if(html != ""){
            $('#search_result').html("<ul>" + html + "</ul>")
        }
    }

    var xhr;
    $("#product_search").keyup(function(e){
       if(e.target.value.length >= 3){
           if(!(xhr != 'undefined')){
                xhr.abort();
           }else{
               xhr = $.ajax({
                   type: "GET",
                   url: "/json/AlcoholTrip/products.json?search=" + e.target.value,
                   success: AddSearchResults
               });
           }
       }
    });

    $("#search_form").submit(function(e){
        e.preventDefault();
    });
});