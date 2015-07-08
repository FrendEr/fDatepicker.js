/* =======================================================
 * 
 *  @name        datepicker.js
 *  @author      Frend
 *  @version     1.0.0
 *  @dependency  jQuery
 *  @github      https://github.com/FrendEr/fDatepicker.js
 *
 * ======================================================= */

!function(root, factory) {
    if (typeof define == 'function' && define.amd) {
        define(['jquery'], function($) {
            return factory();
        });
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window[root] = factory();
    }
}('Datepicker', function() {

    'use strict';

    Datepicker.VERSION = '1.0.0';

    Datepicker.DEFAULT = {
        container      : '',
        startDate      : '',
        endDate        : '',
        singleFrame    : false,
        initFrames     : 3,
        loadFrames     : 3,
        loadOffset     : 100,
        i18n           : false,
        selectCallback : $.noop
    };

    function Datepicker(options) {
        var options = $.extend(Datepicker.DEFAULT, options);

        this.$container     = $(options.container);
        this.startDate      = new Date(options.startDate);
        this.endDate        = new Date(options.endDate);
        this.initFrames     = options.initFrame;
        this.restFrames     = 0;
        this.loadFrames     = options.loadFrames;
        this.tmpYear        = 0;
        this.tmpMonth       = 0;
        this.loadOffset     = options.loadOffset;
        this.singleFrame    = options.singleFrame;
        this.i18n           = options.i18n;
        this.selectCallback = options.selectCallback;

        // init scroll event
        $(window).on('scroll', $.proxy(this.scrollLoad, this));

        // init select event
        this.$container.on('click', 'span[data-date]', $.proxy(this.initEvents, this));

        // init datepicker
        this.init();
    }

    Datepicker.prototype = {
        
        constructor: Datepicker,

        init: function() {
            var self = this,
                startYear = this.getStartYear(),
                startMonth = this.getStartMonth(),
                endYear = this.getEndYear(),
                endMonth = this.getEndMonth();

            // invalid params, end date must large than start date
            if ((startYear > endYear) || (startYear == endYear && startMonth > endMonth)) return;

            // render single month
            if (this.singleFrame || (startYear == endYear && startMonth == endMonth)) {
                this.$container.append(UTILS.renderSinglePicker(startYear, startMonth));
                return;
            }

            // render mutiple months
            if (!this.singleFrame) {
                this.restFrames = (endYear - startYear) * 12 + endMonth - startMonth - this.initFrames;

                if (this.restFrames > 0) {
                    var endY = this.tmpYear = startYear + ((startMonth + this.initFrames) > 11 ? 1 : 0),
                        endM = this.tmpMonth = (startMonth + this.initFrames - 1) % 12;

                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endY, endM));
                } else {
                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth));
                }
            }
        },

        initEvents: function(event) {
            var $this = event.target.tagName.toLowerCase() == 'span' ? $(event.target) : $(event.target).parents('span');

            // if the item is outdate or today,
            // do nothing but just return
            if ($this.is('.is-outdate') || $this.is('.is-today')) return;

            this.$container.find('.selected').removeClass('selected');
            $this.addClass('selected');

            // custom callback call
            this.selectCallback.call(this, $this.data('date'));
        },

        getStartYear: function() {
            return this.startDate.getFullYear();
        },

        getStartMonth: function() {
            return this.startDate.getMonth();
        },

        getEndYear: function() {
            return this.endDate.getFullYear();
        },

        getEndMonth: function() {
            return this.endDate.getMonth();
        },

        scrollLoad: function() {
            // when the restFrames is not empty, trigger scrolling to load
            if (this.restFrames <= 0) return;

            var $window = $(window),
                $document = $(document),
                startYear = this.tmpYear,
                startMonth = this.tmpMonth + 1,
                endYear,
                endMonth;

            if (($document.height() - $window.height() - $window.scrollTop()) < this.loadOffset) {
                if (this.restFrames <= this.loadFrames) {
                    this.restFrames = 0;
                    endYear = this.getEndYear();
                    endMonth = this.getEndMonth();

                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth));
                } else {
                    this.restFrames -= this.loadFrames;
                    endYear = this.tmpYear = startYear + ((startMonth + this.loadFrames) > 11 ? 1 : 0);
                    endMonth = this.tmpMonth = (startMonth + this.loadFrames - 1) % 12;
                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth));
                }
                
            }
        }

    }

    // util function and variable
    // ==========================
    var UTILS = {

        weeks: ['日', '一', '二', '三', '四', '五', '六'],

        weeksi18n: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],

        getCurrentDate: function() {
            return new Date();
        },

        getMonthFirstDay: function(year, month) {
            return new Date(year, month, 1).getDay();
        },

        getMonthLastDay: function(year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        fillArr: function(year, month) {
            var firstDay = this.getMonthFirstDay(year, month),
                lastDay = this.getMonthLastDay(year, month),
                totleDays = lastDay,
                arr = (firstDay + lastDay > 36) ? new Array(42) : (firstDay + lastDay > 28) ? new Array(35) : new Array(28);

            for (var j = firstDay, i = 0; i < totleDays; i++, j++) {
                arr[j] = year + '/' + (month + 1) + '/' + (i + 1);
            }

            return arr;
        },

        renderSinglePicker: function(year, month) {
            var self = this,
                $tpl = $('<div class="datepicker-table">' +
                            '<h2 class="datepicker-header">' + year + '年' + (month + 1) + '月' + '</h2>' +
                            (function() {
                                var th = '';
                                //i18n
                                for (var i = 0; i < self.weeks.length; i++) {
                                    th += '<span class="dp-th">' + self.weeks[i] + '</span>';
                                }
                                return th;
                            })() +
                        '</div>'),
                arr = this.fillArr(year, month),
                currentDate = this.getCurrentDate(),
                tmp = '';

            for (var i = 0; i < arr.length; i++) {
                arr[i] == undefined ? 
                (tmp += '<span></span>') : 
                (function(i) {
                    var itemArr = arr[i].split('/'),
                        itemYear = parseInt(itemArr[0]),
                        itemMonth = parseInt(itemArr[1]) - 1,
                        itemDate = parseInt(itemArr[2]),
                        className = '';

                    className += new Date(arr[i]) < currentDate ? 'is-outdate ' : '';
                    className += (currentDate.getFullYear() == itemYear && parseInt(currentDate.getMonth()) == itemMonth && parseInt(currentDate.getDate()) == itemDate) ? 'is-today ' : '';

                    if (i % 7 == 0 || i % 7 == 6) {
                        className += ' is-weekend';
                    }

                    tmp += '<span class="' + className + '" data-date="' + arr[i] + '"><i>' + itemDate + '</i></span>';
                })(i);
            }

            return $tpl.append(tmp);
        },

        renderMutiplePicker: function(startYear, startMonth, endYear, endMonth) {
            var yearDist = endYear - startYear,
                monthDist = yearDist * 12 + endMonth - startMonth,
                $tpl = $('<div/>');

            for (var i = 0; i <= monthDist; i++) {
                var month = (startMonth + i) % 12,
                    year = (startMonth + i) >= 12 ? startYear + 1 : startYear;

                $tpl.append(this.renderSinglePicker(year, month));
            }

            return $tpl;
        }
    }

    return Datepicker;

});