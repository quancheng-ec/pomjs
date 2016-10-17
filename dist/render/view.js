'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by joe on 16/9/24.
 */

var model = {

    layout: 'layout',
    data: {},
    title: '',
    desc: ''

};

var ViewModel = function ViewModel(data, title) {
    _classCallCheck(this, ViewModel);

    this.data = data;
    this.title = title;
    this.layout = 'default';
};

exports.default = ViewModel;