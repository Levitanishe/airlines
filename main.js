/**
 * Created by Левитан on 12.11.2016.
 */

$(function() {
    var api = 'http://api.anywayanyday.com/api/NewRequest3/?Route=2102MOWPARAD1CN0IN0SCE&_Serialize=JSON&Partner=awadweb';
    $('#table').hide();
    
    
// событие, срабатывает при получении джейсона с результатом поиска
    $(document).on('LoadingFinished',function () {
        var airports = window.result['References']['Airports'];
        var planes = window.result['References']['Planes'];
        var carriers = window.result['References']['Carriers'];
        var airlines  = window.result['Airlines'];
        var arrayFromJSON = [];
        //парс джейсона и запись в нужном мне виде в arrayFromJSON
        airlines.forEach(function (airlinesOfOneCompany, index, array) {
            var aviacompany;
            carriers.forEach(function (CarrierObject, indexOfCarrierObject, arrayOfCarriers){
                if (CarrierObject['Code'] == airlinesOfOneCompany['Code']){
                    aviacompany = CarrierObject['Name'];
                }
             });

            airlinesOfOneCompany['Fares'].forEach(function (fareObject, indexOfFareObject, arrayOfFares) {
                var price = fareObject['TotalAmountRub'];

                fareObject['Directions'].forEach(function (directionObject, indexOfDirectionObject, arrayOfDirections){
                    var CodeAirportDeparture  = directionObject['Points'][0]['ArrivalCode'];
                    var CodeAirportArrival  = directionObject['Points'][directionObject['Points'].length -1]['ArrivalCode'];
                    var airportDeparture;
                    var airportArrival;
                    airports.forEach(function (airportObject, indexOfAirportObject, arrayOfAirports){
                        if (airportObject['Code'] == CodeAirportArrival){
                            airportArrival = airportObject['Name'];
                        }

                        if (airportObject['Code'] == CodeAirportDeparture){
                            airportDeparture = airportObject['Name'];
                        }
                    });

                        directionObject['Variants'].forEach(function (variantObject, indexOfVariantObject, arrayOfVariants){
                        var travelTime = variantObject['TravelTime'];
                        var firstRaceNumber = variantObject['Legs'][0]['FlightNumber'];
                        var dateOfDeparture  = variantObject['Legs'][0]['DepartureDate'];
                        var dateOfArrival = variantObject['Legs'][variantObject['Legs'].length - 1]['DepartureDate'];
                        var changes = variantObject['Legs'].length - 1;
                        var CodeType0fFirstPlane =  variantObject['Legs'][0]['Plane'];
                        var type0fFirstPlane;
                            planes.forEach(function (planeObject, indexOfPlaneObject, arrayOfPlanes) {
                                if (planeObject['Code'] == CodeType0fFirstPlane) {
                                    type0fFirstPlane = planeObject['Name'];
                                }
                            });
                        arrayFromJSON.push([
                            firstRaceNumber,
                             aviacompany,
                             price,
                             dateOfDeparture,
                             dateOfArrival,
                             travelTime,
                             changes,
                             airportDeparture,
                             airportArrival,
                             type0fFirstPlane
                        ]);
                    });
                });
            });
        });
        
        $('#table').show();
        //отображение данных в иоговую таблицу
        $('#table').dataTable({
            'aaData' : arrayFromJSON,
            "order": [[ 2, "asc" ]]
        });
    });

    //первый запрос к поисковой машине
    $.ajax({
        url: api,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
           var idSynonym = data['IdSynonym'];
            getResultOfSearch(idSynonym);
        }
    });
   // данный метод ждёт поисковую машину а затем получает итоговый джейсон и вызывает событие LoadingFinish
    function getResultOfSearch(idSynonym) {
       
        var procent;
        var apiForCheck = 'http://api.anywayanyday.com/api/RequestState/?R=' + idSynonym + '&_Serialize=JSON';
        var apiForResult = 'http://api.anywayanyday.com/api/Fares2/?R='
            + idSynonym + '&L=RU&C=RUB&Limit=200&DebugFullNames=true&_Serialize=JSON';
        console.log(apiForResult);
        timerId = setInterval(function () {
            $.ajax({
                url: apiForCheck,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    window.procent = data['Completed'];
                    console.log(window.procent);
                    $('#wait').text('loading...' + window.procent +'%');
                    if(window.procent == 100){
                        clearInterval(timerId);
                        $('#wait').hide();
                        $.ajax({
                            async: false,
                            url: apiForResult,
                            type: "GET",
                            dataType: "jsonp",
                            success: function (data) {
                                window.result = data;
                                $(document).trigger('LoadingFinished');
                            }
                        });
                    }
                }
            });
            },1000);
    }
});
