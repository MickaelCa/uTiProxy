"use strict";
const express = require('express');
const app = express();
const wsInstance = require('express-ws')(app);
const utip_sse_clients = require('./lib/utip_sse_client');
const debug = require('debug');
const log = debug('main');

app.set('view engine', 'pug');

app.get('/', function (req, res) {
    res.render('index', {title: 'UtiProxy', message: 'yes'});
});

app.get('/utip/:id', function (req, res) {
    let utip_id = req.params.id;
    res.render('index', {title: 'UtiProxy - ' + utip_id, utip_id: utip_id, client_id: wsInstance.getWss().clients.size + 1});
});

app.ws('/ws/:utip_id/:client_id', function (ws, req) {
    let utip_id = req.params.utip_id;
    let client_id = req.params.client_id;

    let timeout = function () {
        log('ws lost, terminating');
        onClose();
        ws.terminate();
    };

    let pingTimeout = setTimeout(timeout,3000 + 4000);

    ws.on('message', function incoming(data) {
        if (data === "ping") {
            log('ws ping');
            clearTimeout(pingTimeout);
            pingTimeout = setTimeout(timeout,3000 + 4000);
        }
    });




    log('websocket called with utip id ' + utip_id);
    let utip_sse_client = utip_sse_clients.getInstance(utip_id);

    let onSSEEvent = function (data) {
        try {
            if (data.type === 'adsViewed') {
                utip_sse_clients.setLastAdsViewed(utip_id, data.data);
            }
            ws.send(JSON.stringify(data));
        } catch (e) {
            console.error(e);
        }
    };

    utip_sse_client.on('SSEEvent', onSSEEvent);

    log("WS clients : " + wsInstance.getWss().clients.size);
    if (wsInstance.getWss().clients.size > 1) {
        ws.send(JSON.stringify({
            "type": "adsViewed",
            "data": utip_sse_clients.getLastAdsViewed(utip_id)
        }));
    }

    let onerror = function (data) {
        try {
            ws.send('error');
        } catch (e) {
            console.error(e);
        }
    };

    utip_sse_client.on('error', onerror);

    let onClose = function () {
        utip_sse_client.removeListener('SSEEvent', onSSEEvent);
        utip_sse_client.removeListener('error', onerror);
        if (wsInstance.getWss().clients.size === 0) {
            log('Closing curl...');
            utip_sse_clients.closeInstance(utip_id);
        }
        log('Websocket connection closed.');
    };

    ws.on('close', onClose);

});

app.listen(3000);