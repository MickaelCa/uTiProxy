const debug = require('debug');
const log = debug('sse_singletons');
const SSEClient = require('../lib/sse');

let Singleton = (() => {
    let instances = [];
    let lastAdsViewed = [];

    function createInstance(utip_id) {
        let sse_client = new SSEClient('https://utip.io/video-overlay/' + utip_id + '/stream?type=counter');
        sse_client.open();
        log('utip instance ' + utip_id + ' created');
        return sse_client;
    }

    return {
        getInstance: function (utip_id) {
            if (!instances[utip_id]) {
                instances[utip_id] = createInstance(utip_id);
            }
            log('singleton utip called');
            return instances[utip_id];
        },
        closeInstance: function (utip_id) {
            if (!instances[utip_id]) {
                return false;
            }
            log('closing instance ' + utip_id);
            instances[utip_id].close();
            instances[utip_id] = null;
            delete instances[utip_id];

            lastAdsViewed[utip_id] = null;
            delete lastAdsViewed[utip_id];
        },
        setLastAdsViewed: function (utip_id, ads_viewed) {
            lastAdsViewed[utip_id] = ads_viewed;
        },
        getLastAdsViewed: function (utip_id) {
            if (!lastAdsViewed[utip_id]) {
                return 0;
            }
            else {
                return lastAdsViewed[utip_id];
            }
        }
    };
})();

module.exports = Singleton;