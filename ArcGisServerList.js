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
    
    var openLinkInNewWindow;
    
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
    
    openLinkInNewWindow = function() {
        /// <summary>Opens a link in a new window or tab.  This method is intended to be called from an a element's click event.</summary>
        window.open(this.href);
        return false;
    };
    
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
            /// <summary>Adds a new server to the list.</summary>
            var self = this;
            // TODO: Make sure that the server that is being added is not already in the list.
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
            self._serverList = $("<ul class='ui-ags-list'>").appendTo(this.element);
            inputDiv = $("<div>").appendTo(self.element);
            self._inputBox = $("<input type='text' class='ui-ags-url-box' placeholder='Enter server name'>").appendTo(inputDiv);
            self._addButton = $("<button type='button'>Add ArcGIS Server</button>").appendTo(inputDiv).button({
                icons: {
                    primary: "ui-icon-plus"
                }
            });
            // Add the sort button
            self._sortButton = $("<button type='button'>Sort</button>").appendTo(self.element).button({
                icons: {
                    primary: "ui-icon-shuffle"
                }
            });
            
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
            this._list = $("<ul class='ui-ags-link-list'>").appendTo(this.element).hide();
            $(this.element).hover(function(evt) {
                $(".ui-ags-link-list", this).show();
            }, function(evt) {
                $(".ui-ags-link-list", this).hide();
            });
            
            // Add the manager link.
            link = $("<a title='ArcGIS Server Manager'>Manager</a>").attr({
                href: [this._protocol + this._name, this._instance, "Manager"].join("/")
            }).click(openLinkInNewWindow);
            $("<li>").append(link).appendTo(this._list);
            
            // Add rest admin link.
            link = $("<a>REST admin.</a>").attr({
                href: [this._protocol + this._name, this._instance, "rest", "admin"].join("/")
            }).click(openLinkInNewWindow);
            $("<li>").append(link).appendTo(this._list);

            
            // Add the REST endpoint link.
            link = $("<a>REST endpoint</a>").attr({
                href: [this._protocol + this._name, this._instance, "rest", "services"].join("/")
            }).click(openLinkInNewWindow);
            $("<li>").append(link).appendTo(this._list);
            
            link = $("<a href='#' title='Remove this server from the list'>Remove</a>").click(removeAction);
            $("<li>").append(link).appendTo(this._list);
        }
    });

}(jQuery));