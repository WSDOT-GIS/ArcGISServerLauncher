/*globals jQuery */
(function ($) {
    "use strict";
    
    // A regex that matches an ArcGIS Server REST endpoint.  Capture 1 is the protocol, 2 is the server name, capture 3 is the instance name (usually "ArcGIS").
    var restEndpointRe = /(https?\:\/\/)(.+)\/(\w+)\/rest(?:\/services)?/i;
        
    // /**
    // Creates an ArcGIS Server rest endpoint URI using the name of the server.
    // */
    // function getRestLink(server, text) {
        // if (!text) {
            // text = server.Name;
        // }
        // return "<a href='http://" + server.Name + "/arcgis/rest/services'>" + text + "</a>";
    // }
    // 
    // function getRestAdminLink(server, text) {
        // if (!text) {
            // text = server.Name;
        // }
        // return "<a href='http://" + server.Name + "/arcgis/rest/admin'>" + text + "</a>";
    // }
    // 
    // function getManagerLink(server, text) {
        // if (!text) {
            // text = server.Name;
        // }
        // var link = $("<a>").attr("href", "http://" + server.Name + "/arcgis/manager").text(text);
        // return link[0];
    // }
    
    
    $.widget("ui.arcGisServerList", {
        options: {
            servers: null
        },
        _serverList: null,
        _inputBox: null,
        _addButton: null,
        _addServer: function(server) {
            $("<li>").appendTo(this._serverList).arcGisServerListItem({
                server: server
            });
        },
        _removeServer: function(restUrl) {
            throw new Error("Not implemented");
        },
        _create: function() {
            var self = this, i, l;
            self._inputBox = $("<input type='url' class='ui-ags-url-box' placeholder='http://example.com/ArcGIS/rest/services'>").appendTo(this.element);
            self._addButton = $("<button type='button'>Add ArcGIS Server</button>").appendTo(this.element);
            self._serverList = $("<ul class='ui-ags-list'>").appendTo(this.element);
            
            // If any servers were defined in the options, add them now.
            if (self.options.servers !== null) {
                for (i=0, l=self.options.servers.length; i < l; i++) {
                    self._addServer(self.options.servers[i]);
                }
            }
            
            self._addButton.click(function() {
                self._addServer(self._inputBox.val());
            });
        }
    });
    
    $.widget("ui.arcGisServerListItem", {
        options: {
            server: null
        },
        // _url: null,
        _protocol: "http://",
        _name: null,
        _instance: "ArcGIS",
        _list: null,
        _create: function() {
            var match, link;
            
            if (this.options.server === null) {
                throw new Error("Server name not provided.");
            }
            match = restEndpointRe.exec(this.options.server);
            // Check the server parameter to see if it is a full URL or just the server name.
            if (match) {
                this._protocol = match[1];
                this._name = match[2];
                this._instance = match[3];
                // this._url = match[1] + "/" + match[2] + "/" + match[3] + "/rest";
            } else {
                // this._url = "http://" + this.options.name + "/ArcGIS/rest";
                this._name = this.options.server;
            }
            
            // Create the list of links.
            $(this.element).text(this._name);
            this._list = $("<ul>").appendTo(this.element);
            link = $("<a>REST endpoint</a>").attr({
                href: [this._protocol + this._name, this._instance, "rest"].join("/")
            });
            $("<li>").append(link).appendTo(this._list);
        }
    });

}(jQuery));