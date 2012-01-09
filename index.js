/*globals jQuery */
   (function($) {
        var servers = null, serverList, updateLocalStorage;
        
        updateLocalStorage = function() {
            if (typeof(window.localStorage) === "undefined") {
            return;
        }
        if (typeof(serverList) !== "undefined") {
            var servers = serverList.arcGisServerList("getServerNames");
            if (servers) {
                window.localStorage.agsServers = serverList.arcGisServerList("getServerNames");
            } else {
                delete window.localStorage.agsServers;
            }
        }
    };
    
    if (typeof(window.localStorage) === "undefined") {
        // Add warning if browser does not support local storage.
        $("<p class='ui-state-error'>This browser does not support <em>local storage</em>.  Servers added during this session will not be saved.  Please use <a href='http://www.caniuse.com/#search=web storage'>a browser that supports local storage</a> (e.g., <a href='http://chrome.google.com'>Google Chrome</a>).</p>").prependTo('body');
    }
    else if (typeof(window.localStorage.agsServers) !== "undefined" && window.localStorage.agsServers) {
        servers = window.localStorage.agsServers.split(",");
    }
    serverList = $("#serverList").arcGisServerList({
        servers: servers,
        add: function(event, ui) {
            updateLocalStorage();
        }, 
        remove: function(event, ui) {
            updateLocalStorage();
        },
        sort: function(event, ui) {
            updateLocalStorage();
        }
    });
}(jQuery));