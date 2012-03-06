/**
 * wiki_pagelist.js
 * this handles list of available wiki pages
 * @namespace mdwiki
 * @module mdwiki
 * @requires Page, YUI Connect, Dom, Event, JSON
 */
YAHOO.namespace("mdwiki");

/**
 * this handles list of available wiki pages
 * @class PageList
 */
YAHOO.mdwiki.PageList = function(){
    var Connect = YAHOO.util.Connect,
        Dom     = YAHOO.util.Dom,
        Event   = YAHOO.util.Event,
        JSON    = YAHOO.lang.JSON;
    
    var _oContainer = Dom.get("pagelist_container"),
        _oUl        = document.createElement("ul");
    
    _oUl.id = "pagelist";
    
    /**
     * this creates page list and display it
     * @method _create
     * @private
     * @param Response {object} response of async request
     * @see http://developer.yahoo.com/yui/connection/#success
     * @return {void}
     */
    var _create = function(oResponse){
        _oContainer.innerHTML = "<input type='text' id='new_pagename' name='new_pagename' />"
                              + "<button id='add_page'>Add Page</button>";
        
        var aPages = JSON.parse(oResponse.responseText);
        if (aPages instanceof Array) {
            for (var i=0, l=aPages.length; i<l; i++){
                var oLi   = document.createElement("li"),
                    oText = document.createTextNode(aPages[i]["title"]);
                oLi.id  = aPages[i]["keyname"];
                oLi.appendChild(oText);
                _oUl.appendChild(oLi);
            }
            _oContainer.appendChild(_oUl);
            Event.addListener("add_page", "click", _onClickAddPage);
            Event.addListener(_oUl, "click", _onClickPageList);
        }
    };
    
    /**
     * this creates new page
     * @method _onClickAddPage
     * @private
     * @param Event {object} Event object
     * @return {void}
     */
    var _onClickAddPage = function(oEvent){
        var oInput    = Dom.get("new_pagename"),
            sTitle    = oInput.value,
            sPostData = "new_pagename=" + encodeURIComponent(sTitle),
            oCallback = {
                success: function(oResponse){
                    var sKeyName = JSON.parse(oResponse.responseText)["keyname"];
                    YAHOO.mdwiki.Page.show(sKeyName);
                    Dom.get("pagelist").innerHTML = "";
                    YAHOO.mdwiki.PageList.init()
                }
            };
        
        if (YAHOO.lang.trim(sTitle).length > 0) {
            Connect.asyncRequest("POST", "/wiki/add", oCallback, sPostData);
            oInput.value = "";
        }
    };
    
    /**
     * this shows page content when a page item is clicked
     * @method _onClickPageList
     * @private
     * @param Event {object} Event object
     * @return {void}
     */
    var _onClickPageList = function(oEvent){
        var oSrcElement = oEvent.target || oEvent.srcElement;
        if (oSrcElement.tagName.toLowerCase() === "li") {
            YAHOO.mdwiki.Page.show(oSrcElement.id);
        }
    };
        
    return {
        /**
         * this initialize list of wiki pages
         * @method init
         * @return {void}
         */
        init: function(){
            var oCallback = {
                success: _create
            };
            Connect.asyncRequest("GET", "/wiki/list", oCallback);
        }
    };
}();