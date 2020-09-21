function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}
var protocol;

if (location.protocol === 'https:') {
    protocol = "wss";
} else {
    protocol = "ws";
}

var ws_url = protocol + "://" + location.hostname+(location.port ? ':'+location.port: '') + "/ws/" + utip_id + "/" + client_id;
var ws = new WebSocket(ws_url);
ws.onopen = function(event) {
    console.log("websocket open");
    setInterval(function () {
        ws.send("ping");
    }, 3000);
};
ws.onmessage = function (event) {
    if (isJSON(event.data)) {
        var data = JSON.parse(event.data);
        if (data.type === "adsViewed") {
            document.write("<h1>" + data.data + "</h1>");
        }
    }
};

