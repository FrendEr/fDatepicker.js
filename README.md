# fDatepicker.js

移动端满屏日历插件，支持单个月份切换和多个月份平铺展示两种方式。使用多月份平铺展示时，支持初始化加载个数、分页加载。

## Initialize

```javascript

var datepicker = new Datepicker({
    container: '#container',
    startDate: '2015-07-03',
    endDate: '2016-07-03',
    initFrame: 4,
    loadFrames: 3,
    loadOffset: 20,
    i18n: true,
    selectCallback: function(date) {
        alert(date)
    }
});

```

## Example

demo：[http://frender.github.io/fDatepicker.js](http://frender.github.io/fDatepicker.js)

## Options

- **container** : 需要制定的展示日历的根元素 `@String`
- **startDate** : 日历的开始日期 `@String`
- **endDate** : 日历的结束日期 `@String`
- **singleFrame** : 使用单个月份模式，支持月份切换  `@Boolean`
- **initFrames** : 【多月份模式】初始化的个数  `@Number`
- **loadFrames** : 【多月份模式】分页加载每页的个数  `@Number`
- **loadOffset** : 【多月份模式】动态加载的偏移量`@Number`
- **i18n** : 开启国际化支持 `@Boolean`
- **selectCallback** : 选择日期回调函数 `@Function`

## Installation

```javascript

bower install fDatepicker.js [--save[-dev]]

```
or

```javascript

npm install fdatepicker.js [--save[-dev]]

```

## Version

- **1.0.0**


