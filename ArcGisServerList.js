/*globals jQuery */

/*
* Copyright (c) 2012 Washington State Department of Transportation
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>
*
*/

(function ($) {
    "use strict";
    
    function compareListItems(a, b) {
        var lia, lib;
        lia = $(a).data("arcGisServerListItem");
        lib = $(b).data("arcGisServerListItem");
        if (lia._name > lib._name) {
            return 1;
        } else if (lia._name < lib._name) {
            return -1;
        } else {
            return 0;
        }
    }
    
    // A regex that matches an ArcGIS Server REST endpoint.  Capture 1 is the protocol, 2 is the server name, capture 3 is the instance name (usually "ArcGIS").
    var restEndpointRe = /(https?\:\/\/)(.+)\/(\w+)\/rest(?:\/services)?/i;
    
    $.widget("ui.arcGisServerList", {
        options: {
            servers: null
        },
        _serverList: null,
        _inputBox: null,
        _addButton: null,
        _sortButton: null,
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
        sort: function() {
            // <summary>Sorts items in the list by the server name.</summary>
            var list = $(".ui-ags-list", this.element)[0];
            $("> li", list).sort(compareListItems).appendTo(list);
            // Trigger the "sort" event.
            this._trigger("sort", this, {});
            return this;
        },
        _create: function() {
            var self = this, addServer, removeServer, i, l, inputDiv;
            $(self.element).addClass('ui-widget');
            inputDiv = $("<div>").appendTo(self.element);
            self._inputBox = $("<input type='url' class='ui-ags-url-box' placeholder='Enter server name'>").appendTo(inputDiv);
            self._addButton = $("<button type='button'>Add ArcGIS Server</button>").appendTo(inputDiv).button({
                icons: {
                    primary: "ui-icon-plusthick"
                }
            });
            // Add the sort button
            self._sortButton = $("<button type='button'>Sort</button>").appendTo(self.element).button({
                icons: {
                    primary: "ui-icon-shuffle"
                }
            });
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
            self._sortButton.click(function() {
                self.sort();
            });
            return this;
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