/* =======================================================
 *
 *     ______                                   _
 *    /  ___/                                  | |
 *   |  /      _   __   _____    _  __     ___ / |
 *   |  |_ _  |  |/ /  / ___ \  | \/ _ \  / __   |
 *   |  _ _/  |  _ /  | /___\_\ | |  | | | |   | |
 *   |  |     |  |    | |_____  | |  | | | |___| |
 *   |__/     |_/      \_ _ _/  |_/  \_|  \ ____ /
 *
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
        initDate       : '',
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
        this.initDate       = typeof options.initDate == 'string' ? new Date(options.initDate) : options.initDate;
        this.startDate      = typeof options.startDate == 'string' ? new Date(options.startDate) : options.startDate;
        this.endDate        = typeof options.endDate == 'string' ? new Date(options.endDate) : options.endDate;
        this.initFrames     = options.initFrame;
        this.restFrames     = 0;
        this.loadFrames     = options.loadFrames;
        this.tmpYear        = 0;
        this.tmpMonth       = 0;
        this.loadOffset     = options.loadOffset;
        this.singleFrame    = options.singleFrame;
        this.i18n           = options.i18n;
        this.selectCallback = options.selectCallback;

        // cache after props set
        var self = this;

        // init scroll event
        $(window).on('scroll', $.proxy(this.scrollLoad, this));

        // init select event
        this.$container.on('click', 'span[data-date]', $.proxy(this.initEvents, this));

        // init month exchange event
        this.$container.on('click', '#prevBtn, #nextBtn', function(event) {
            UTILS.monthExchange(event.target, self.tmpYear || self.getInitYear() || self.getStartYear(), (self.tmpYear != 0 && self.tmpMonth >= 0) ? self.tmpMonth : (self.getInitMonth() || self.getStartMonth()), self);
        });

        // init datepicker
        this.init();
    }

    Datepicker.prototype = {

        constructor: Datepicker,

        init: function() {
            var self = this,
                startYear = this.singleFrame ? (this.getInitYear() ? this.getInitYear() : this.getStartYear()) : this.getStartYear(),
                startMonth = this.singleFrame ?(this.getInitMonth() ? this.getInitMonth() : this.getStartMonth()) : this.getStartMonth(),
                endYear = this.getEndYear(),
                endMonth = this.getEndMonth();

            // invalid params, end date must large than start date
            if ((startYear > endYear) || (startYear == endYear && startMonth > endMonth)) return;

            // render single month
            if (this.singleFrame || (startYear == endYear && startMonth == endMonth)) {
                this.$container.append(UTILS.renderSinglePicker(startYear, startMonth, self));
                return;
            }

            // render mutiple months
            if (!this.singleFrame) {
                this.restFrames = (endYear - startYear) * 12 + endMonth - startMonth - this.initFrames;

                if (this.restFrames > 0) {
                    var endY = this.tmpYear = startYear + ((startMonth + this.initFrames) > 11 ? 1 : 0),
                        endM = this.tmpMonth = (startMonth + this.initFrames - 1) % 12;

                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endY, endM, self));
                } else {
                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth, self));
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

            // reset initDate
            this.initDate = new Date($this.data('date'));

            // custom callback call
            this.selectCallback.call(this, $this.data('date'));
        },

        getInitYear: function() {
            return this.initDate.getFullYear();
        },

        getInitMonth: function() {
            return this.initDate.getMonth();
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

        getEndDate: function() {
            return this.endDate;
        },

        scrollLoad: function() {
            // when the restFrames is not empty, trigger scrolling to load
            if (this.restFrames <= 0) return;

            var self = this,
                $window = $(window),
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

                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth, self));
                } else {
                    this.restFrames -= this.loadFrames;
                    endYear = this.tmpYear = startYear + ((startMonth + this.loadFrames) > 11 ? 1 : 0);
                    endMonth = this.tmpMonth = (startMonth + this.loadFrames - 1) % 12;
                    this.$container.append(UTILS.renderMutiplePicker(startYear, startMonth, endYear, endMonth, self));
                }

            }
        }

    }

    // util function and variable
    // ==========================
    var UTILS = {

        weeks      : ['日', '一', '二', '三', '四', '五', '六'],
        weeksi18n  : ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
        months     : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        monthsi18n : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

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

        monthExchange: function(target, year, month, datepickerObj) {
            var $this = $(target),
                // year = year,
                // month = month,
                className = $this[0].className;

            if (className.indexOf('disable-btn') != -1) return;
            // prev month
            if (className.indexOf('prev-btn') != -1) {
                (month - 1 >= 0) ? (function() {
                    datepickerObj.tmpYear = year;
                    datepickerObj.tmpMonth = month - 1;
                })() : (function() {
                    datepickerObj.tmpYear = year - 1;
                    datepickerObj.tmpMonth = 11;
                })();
                datepickerObj.$container.empty().append(this.renderSinglePicker(datepickerObj.tmpYear, datepickerObj.tmpMonth, datepickerObj));
            }
            // next month
            if (className.indexOf('next-btn') != -1) {
                (month + 1 <= 11) ? (function() {
                    datepickerObj.tmpYear = year;
                    datepickerObj.tmpMonth = month + 1;
                })() : (function() {
                    datepickerObj.tmpYear = year + 1;
                    datepickerObj.tmpMonth = 0;
                })();
                datepickerObj.$container.empty().append(this.renderSinglePicker(datepickerObj.tmpYear, datepickerObj.tmpMonth, datepickerObj));
            }
        },

        renderSinglePicker: function(year, month, datepickerObj) {
            var arr = this.fillArr(year, month),
                currentDate = this.getCurrentDate(),
                endDate = datepickerObj.getEndDate(),
                initDate = datepickerObj.initDate.getTime(),
                $tpl = this.renderPickerHead(year, month, datepickerObj);

            return $tpl.append(this.renderPickerBody(arr, currentDate, endDate, initDate));
        },

        renderPickerHead: function(year, month, datepickerObj) {
            var weeksMap = datepickerObj.i18n ? this.weeksi18n : this.weeks,
                ym = datepickerObj.i18n ? (this.monthsi18n[month] + ' ' + year) : (year + '年 ' + this.months[month]),
                prev = datepickerObj.singleFrame ? '<i id="prevBtn" class="prev-btn ' + (year == datepickerObj.getStartYear() && (month == datepickerObj.getStartMonth()) ? 'disable-btn' : '') + '">&lt;</i>' : '',
                next = datepickerObj.singleFrame ? '<i id="nextBtn" class="next-btn ' + (year == datepickerObj.getEndYear() && (month == datepickerObj.getEndMonth()) ? 'disable-btn' : '') + '">&gt;</i>' : '',
                hd =  prev + ym + next,
                $tpl = $('<div class="datepicker-table">' +
                    '<h2 id="dpHeader" class="datepicker-header">' + hd + '</h2>' +
                    (function() {
                        var th = '';

                        for (var i = 0; i < weeksMap.length; i++) {
                            th += '<span class="dp-th">' + weeksMap[i] + '</span>';
                        }
                        return th;
                    })() +
                '</div>');

            return $tpl;
        },

        renderPickerBody: function(arr, currentDate, endDate, initDate) {
            var tmp = '';

            for (var i = 0; i < arr.length; i++) {
                arr[i] == undefined ?
                (tmp += '<span></span>') :
                (function(i) {
                    var itemArr = arr[i].split('/'),
                        itemYear = parseInt(itemArr[0]),
                        itemMonth = parseInt(itemArr[1]) - 1,
                        itemDate = parseInt(itemArr[2]),
                        className = '';

                    // is out of date
                    className += (new Date(arr[i]) < currentDate || new Date(arr[i]) > endDate ) ? 'is-outdate ' : '';
                    // is today
                    className += (currentDate.getFullYear() == itemYear && parseInt(currentDate.getMonth()) == itemMonth && parseInt(currentDate.getDate()) == itemDate) ? 'is-today ' : '';
                    // is init selected
                    className += (className.indexOf('is-outdate') != -1) ? '' : (className.indexOf('is-today') != -1) ? '' : (new Date(arr[i]).getTime() == initDate) ? 'selected' : '';

                    if (i % 7 == 0 || i % 7 == 6) {
                        className += ' is-weekend';
                    }

                    tmp += '<span class="' + className + '" data-date="' + arr[i] + '"><i>' + itemDate + '</i></span>';
                })(i);
            }

            return tmp;
        },

        renderMutiplePicker: function(startYear, startMonth, endYear, endMonth, datepickerObj) {
            var yearDist = endYear - startYear,
                monthDist = yearDist * 12 + endMonth - startMonth,
                $tpl = $('<div/>');

            for (var i = 0; i <= monthDist; i++) {
                var month = (startMonth + i) % 12,
                    year = (startMonth + i) >= 12 ? startYear + 1 : startYear;

                $tpl.append(this.renderSinglePicker(year, month, datepickerObj));
            }

            return $tpl;
        }
    }

    return Datepicker;

});
