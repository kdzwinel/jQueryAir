;(function ( $, window, document, undefined ) {

    var pluginName = "seatChooser",
        defaults = {
            picture: "gfx/airplane.gif"
        };

    function SeatChooser ( element, options ) {
        this.$element = $(element);
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    function selectSeat(column, row) {
        if(column < 12) {
            column = column * 16 + 122;
        } else {
            column = column * 16 + 137;
        }

        if(row < 3) {
            row = row * 12 + 30;
        } else {
            row = row * 12 + 47;
        }

        this.$plane.find('div').css({
            top: row+'px',
            left: column+'px'
        }).show();
    }

    function seatClicked(e) {
        var x = e.offsetX,
            y = e.offsetY;

        if( (x > 310 && x < 330) || (y > 62 && y < 84) ) {
            return;
        }

        var column = (x < 310) ? Math.round((x - 125)/16) : Math.round((x - 330)/16) + 12;
        var row = (y < 62) ? Math.round((y - 32)/12) : Math.round((y-85)/12) + 3;

        if(row < 0 || column < 0 || column > 24 || row > 5) {
            return;
        }

        this.setSeatByColumnAndRow(column, row);
    }

    function getSeatName(column, row) {
        var rowNames = [
            'F', 'E', 'D', 'C', 'B', 'A'
        ];

        return (column + 1) + rowNames[row];
    }

    function decodeSeatName(seatName) {
        var column = parseInt(seatName);
        var rowName = seatName[seatName.length-1];
        var rowNames = {
            'F': 0,
            'E': 1,
            'D': 2,
            'C': 3,
            'B': 4,
            'A': 5
        };

        if(isNaN(column) || rowNames[rowName] === undefined) {
            return false;
        }

        return {
            column: column - 1,
            row: rowNames[rowName]
        };
    }

    SeatChooser.prototype = {
        init: function () {
            if(!this.$element.is('input[type=text], input[type=hidden]')) {
                throw "seatChooser can only be used with input[type=text] or input[type=hidden]";
            }

            var $img = $('<img>').attr('src', this.settings.picture);
            var $div = $('<div>').css({
                backgroundColor: 'rgba(255,0,0,0.5)',
                position: 'absolute',
                width: '12px',
                height: '12px',
                borderRadius: '10px'
            }).hide();
            this.$plane = $('<div>').css({
                position: 'relative'
            }).append($img).append($div);
            this.$element.after(this.$plane);

            this.$plane.find('img').on('click', seatClicked.bind(this));

            this.currentSeat = null;
        },
        getSeat: function () {
            if(this.currentSeat !== null) {
                return getSeatName(this.currentSeat.column, this.currentSeat.row);
            }

            return null;
        },
        setSeat: function(seat) {
            var output = decodeSeatName(seat);
            if(output) {
                return this.setSeatByColumnAndRow(output.column, output.row);
            }

            return false;
        },
        setSeatByColumnAndRow: function(column, row) {
            if(column < 0 || column > 24 || row < 0 || row > 5) {
                return false;
            }

            this.currentSeat = {
                column: column,
                row: row
            };

            this.$element.val(getSeatName(column, row));
            this.$element.trigger('seatChanged', getSeatName(column, row));
            selectSeat.apply(this, [column, row]);

            return true;
        },
        isValidSeat: function(seat) {
            return decodeSeatName(seat) ? true : false;
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new SeatChooser( this, options ) );
            }
        });

        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );