"use strict";
const debug = require('debug');
const log = debug('sse');
const {Curl} = require('node-libcurl');
const EventEmitter = require('events');

String.prototype.mySplit = function (char) {
    let arr = [];
    arr[0] = this.substring(0, this.indexOf(char));
    arr[1] = this.substring(this.indexOf(char) + 1);
    return arr;
};

module.exports = class sse_client {

    constructor(url) {
        this._EventEmitter = new EventEmitter();
        this._curl = new Curl();
        this._url = url;

        this._curl.setOpt('URL', this._url);
        log('new sse_client instance ' + this._url);
    }

    open() {
        this._curl.perform();
        this._curl.on('data', this.parseSSEData.bind(this));
        this._curl.on('end', function (statusCode, data, headers) {
            log('curl error');
            this._EventEmitter.emit('error', statusCode);

            this._curl.close();
        }.bind(this));
    }

    close() {
        this._curl.close();
    }

    parseSSEData(data, header) {
        let data_array = data.toString().split(/\r?\n/);
        let event = {};

        log('parsing new data');

        data_array.forEach((element) => {
            if (element === "") return;
            let splitted_element = element.mySplit(':');

            if (splitted_element.length === 2) {
                if (!event.type && splitted_element[0] === "event") {
                    event.type = splitted_element[1].trim();
                }
                if (!event.data && splitted_element[0] === "data") {
                    event.data = splitted_element[1].trim();
                }
            }

            if (event.type && event.data) {
                this._EventEmitter.emit('SSEEvent', event);
                event = {};
            }
        });
    }

    on(event, callback) {
        return this._EventEmitter.addListener(event, callback);
    }

    removeListener(event, callback) {
        return this._EventEmitter.removeListener(event, callback);
    }

    onSSEEvent(callback) {
        return this._EventEmitter.addListener('SSEEvent', callback);
    }

    onError(callback) {
        return this._EventEmitter.addListener('error', callback);
    }
};
