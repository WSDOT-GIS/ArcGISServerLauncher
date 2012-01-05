/*globals jQuery */
(function ($) {
    "use strict";
    
    // A regex that matches an ArcGIS Server REST endpoint.  Capture 1 is the protocol, 2 is the server name, capture 3 is the instance name (usually "ArcGIS").
    var restEndpointRe = /(https?\:\/\/)(.+)\/(\w+)\/rest(?:\/services)?/i;
    
    $.widget("ui.arcGisServerList", {
        options: {
            servers: null
        },
        _serverList: null,
        _inputBox: null,
        _addButton: null,
        _addServer: function(server) {
            var self = this;
            $("<li>").attr({
                "data-server": server
            }).appendTo(this._serverList).arcGisServerListItem({
                server: server,
                remove: function(event, ui) {
                    $("[data-server='" + ui.server + "']").remove();
                    self._trigger("remove", self, {server: server});
                }
            });
            this._trigger("add", self, {server: server});
        },
        getServerNames: function() {
            var i, l, serverItems = $("[data-server]", this.element), servers = null;
            for (i=0, l=serverItems.length; i < l; i++) {
                if (!servers) {
                    servers = [];
                }
                servers.push($(serverItems[i]).data("server"));
            }
            return servers;
        },
        _create: function() {
            var self = this, addServer, removeServer, i, l;
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
    
    
    /**
     * This represents one of the individual items in the arcGisServerList
     */
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
            var self = this, match, link, removeAction;
            
            removeAction = function() {
                self._trigger("remove", self, {"server": self.options.server});
                return false;
            };
            
            if (this.options.server === null) {
                throw new Error("Server name not provided.");
            }
            match = restEndpointRe.exec(this.options.server);
            // Check the server parameter to see if it is a full URL or just the server name.
            if (match) {
                this._protocol = match[1];
                this._name = match[2];
                this._instance = match[3];
            } else {
                this._name = this.options.server;
            }
            
            // Create the list of links.
            $(this.element).text(this._name);
            this._list = $("<ul>").appendTo(this.element);
            
            // Add the manager link.
            link = $("<a>ArcGIS Server Manager</a>").attr({
                href: [this._protocol + this._name, this._instance, "Manager"].join("/")
            });
            $("<li>").append(link).appendTo(this._list);
            
            // Add rest admin link.
            link = $("<a>REST administration</a>").attr({
                href: [this._protocol + this._name, this._instance, "rest", "admin"].join("/")
            });
            $("<li>").append(link).appendTo(this._list);

            
            // Add the REST endpoint link.
            link = $("<a>REST endpoint</a>").attr({
                href: [this._protocol + this._name, this._instance, "rest"].join("/")
            });
            $("<li>").append(link).appendTo(this._list);
            
            link = $("<a href='#'>Remove this server from the list</a>").click(removeAction);
            $("<li>").append(link).appendTo(this._list);
        }
    });

}(jQuery));