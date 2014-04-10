(function () {
    "use strict";

    /**************************
     SETTINGS
     *************************/
    var availableTickets = [
        {city: 'Barcelona', cost: 120},
        {city: 'Berlin', cost: 60},
        {city: 'London', cost: 50},
        {city: 'Oslo', cost: 100},
        {city: 'Stockholm', cost: 150},
        {city: 'Paris', cost: 100}
    ];
    var priorityCost = 15;
    var luggageCost = 20;

    /**************************
     CACHED VARIABLES
     *************************/
    var $destination = $('#destination');
    var $departureDate = $('#departureDate');
    var $seat = $('#seat');
    var $name = $('#passengerName');
    var $surname = $('#passengerSurname');
    var $email = $('#emailAddress');
    var $additionalLuggage = $('#additionalLuggage');
    var $priority = $('#priority');
    var $termsAccepted = $('#terms');

    /**************************
     PLUGINS
     *************************/
    //Datepicker
    $departureDate.datepicker();

    //Autocomplete
    $destination.typeahead({
        source: function(query, callback) {
            query = query.toLowerCase();

            var result = availableTickets.filter(function(ticket) {
                return (ticket.city.toLowerCase().indexOf(query) !== -1);
            }).map(function(ticket){
                return ticket.city;
            });

            callback(result);
        }
    });

    //Choosing a seat in the plane
    $seat.seatChooser();

    /**************************
    VALIDATORS
    *************************/
    $departureDate.on('changeDate', function() {
        var date = $(this).data().datepicker.viewDate;

        clearError(this);

        //date in past
        if(Date.now() > date.getTime()) {
            setError(this, 'Chosen date is in the past')
        }
    }).on('change', function() {
        $(this).data().datepicker.setValue($(this).val());
    });

    $destination.on('change', function() {
        var city = $(this).val();

        clearError(this);

        if(!isValidDestination(city)) {
            setError(this, 'Invalid destination');
        }
    });

    function isValidDestination(city) {
        return availableTickets.some(function(ticket) {
            return ticket.city === city;
        });
    }

    $email.on('change', function() {
        var email = $(this).val();

        clearError(this);

        if(!isValidEmail(email)) {
            setError(this, 'Invalid email');
        }
    });

    function isValidEmail(email) {
        return /^[a-z0-9._-]+\@[a-z0-9._-]+\.[a-z0-9._-]+$/gi.test(email);
    }

    $seat.on('seatChanged', function() {
        clearError(this);
    });

    $surname.on('change', function() {
        clearError(this);

        if($(this).val().length < 2) {
            setError(this, 'Your surname is too short');
        }
    });

    $name.on('change', function() {
        clearError(this);

        if($(this).val().length < 2) {
            setError(this, 'Your name is too short');
        }
    });

    $termsAccepted.on('change', function() {
        clearError(this);

        if(!$termsAccepted.is(':checked')) {
            setError($termsAccepted.get(0), 'You have to accept terms and conditions');
        }
    })

    $('form').on('submit', function() {
        var valid = true;

        if(!$termsAccepted.is(':checked')) {
            setError($termsAccepted.get(0), 'You have to accept terms and conditions');
            valid = false;
        }

        if($surname.val().length < 2) {
            setError($surname.get(0), 'Your surname is too short');
            valid = false;
        }

        if($name.val().length < 2) {
            setError($name.get(0), 'Your name is too short');
            valid = false;
        }

        if (!$seat.val()) {
            setError($seat.get(0), 'Please chose a preferred seat.');
            valid = false;
        }

        if (!isValidEmail($email.val())) {
            setError($email.get(0), 'Invalid email');
            valid = false;
        }

        if (!isValidDestination($destination.val())) {
            setError($destination.get(0), 'Invalid destination');
            valid = false;
        }

        if(Date.now() > $departureDate.data().datepicker.viewDate.getTime()) {
            setError($departureDate.get(0), 'Chosen date is in the past');
            valid = false;
        }

        if(valid) {
            showSummaryDialog({
                destination: $destination.val(),
                departure: $departureDate.data().datepicker.viewDate,
                name: $name.val() + ' ' + $surname.val(),
                seat: $seat.val(),
                email: $email.val(),
                luggage: $additionalLuggage.val(),
                priority: $priority.is(':checked')
            });
        }

        return false;
    });

    /**************************
     COST CALCULATION
     *************************/
    $('#destination, #additionalLuggage, #priority').on('change', function() {
        var destination = $('#destination').val();
        var additionalLuggage = $('#additionalLuggage').val();
        var priority = $('#priority').is(':checked');

        var ticket = availableTickets.filter(function(ticket){
            return (ticket.city === destination);
        });

        if(!ticket.length) {
            $('#totalCost').text('-');
            return;
        }

        $('#totalCost').text(ticket[0].cost + (additionalLuggage * luggageCost) + (priority ? priorityCost : 0));
    });

    /**************************
     SUMMARY DIALOG
     *************************/
    function showSummaryDialog(data) {
        var $modal = $('#summaryModal');

        $modal.find('.name').text(data.name);
        $modal.find('.email').text(data.email);

        $modal.find('.destination').text(data.destination);
        $modal.find('.departure').text(data.departure);

        $modal.find('.seat').text(data.seat);
        $modal.find('.luggage_count').text(data.luggage);

        if(data.luggage == 0) {
            $modal.find('.luggage').hide();
        } else {
            $modal.find('.luggage').show();
        }

        if(data.priority) {
            $modal.find('.priority').show();
        } else {
            $modal.find('.priority').hide();
        }

        $modal.modal();
    }

    /**************************
     ERROR HANDLING
     *************************/
    function clearError(elem) {
        var $formGroup = $(elem).closest('.form-group, .checkbox');
        var $controlLabel = $formGroup.find('.control-label');

        $formGroup.removeClass('has-error');
        if($controlLabel) {
            $controlLabel.text('').hide();
        }
    }

    function setError(elem, text) {
        var $formGroup = $(elem).closest('.form-group, .checkbox');
        var $controlLabel = $formGroup.find('.control-label');

        if(!$controlLabel.length) {
            $controlLabel = $('<label>').addClass('control-label');
            $formGroup.find('label').after($controlLabel);
        }

        $formGroup.addClass('has-error');
        $controlLabel.text(text).show();
    }
})();