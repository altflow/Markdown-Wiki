/**
 * wiki_page.js
 * this handle page contents.
 * @namespace mdwiki
 * @module mdwiki
 * @requires YUI Connect, Dom, Event, JSON, Showdown
 */
YAHOO.namespace("mdwiki");

/**
 * this handles page contents
 * @class Page
 */
YAHOO.mdwiki.Page = function(){
    var Connect = YAHOO.util.Connect,
        Dom     = YAHOO.util.Dom,
        Event   = YAHOO.util.Event
        JSON    = YAHOO.lang.JSON;
    
    var SDConverter = new Showdown.converter();
    
    var _sRequestUrl       = "/wiki/page/",
        _sDeleteUrl        = "/wiki/delete",
        _sHomeKeyname      = "4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942",
        _sCurrentPageText  = "",
        _sDelConfirmMsg    = "Are you sure you want to delete this page?", 
        _sContentTemplate  = "<div id='page_action'>"
                           + "<span id='edit' class='action'>edit</span>"
                           + "<span id='delete' class='action'>delete</span>"
                           + "</div>"
                           + "<div id='content_container'>"
                           + "<h1 id='title'>{title}</h1>"
                           + "{content}"
                           + "</div>"
                           + "<input type='hidden' name='keyname' id='keyname' value='{keyname}' />",
        _sEditFormTemplate = "<div id='page_editor'>"
                           + "Title: <input type='text' name='title' id='title' value='{title}' /><br />"
                           + "Contents: <br /><textarea id='content'>{content}</textarea><br/>"
                           + "<button id='update'>Update</button> <span id='cancel' class='action'>cancel</span>"
                           + "<input type='hidden' name='keyname' id='keyname' value='{keyname}'>"
                           + "</div>";
    
    /**
     * this deletes the page after the user confirmed
     * @method _onClickDelete
     * @private
     * @return {void}
     */
    var _onClickDelete = function(){
        if (window.confirm(_sDelConfirmMsg)) {
            var sPostData = "keyname=" + Dom.get("keyname").value,
                oCallback = {
                    success: function(oData){
                        Dom.get("pagelist").innerHTML = "";
                        YAHOO.mdwiki.PageList.init();
                        YAHOO.mdwiki.Page.show();
                    }
                };
            Connect.asyncRequest("POST", _sDeleteUrl, oCallback, sPostData);
        }
    };
    
    /**
     * this shows edit form when a user clicks edit link
     * @method _onClickEdit
     * @private
     * @return {void}
     */
    var _onClickEdit = function(){
        var oData    = {
                "keyname": Dom.get("keyname").value,
                "title": Dom.get("title").innerHTML,
                "content": _sCurrentPageText
            },
            sContent = _supplant(_sEditFormTemplate, oData);
        
        Dom.get("container").innerHTML = sContent;
        
        Event.addListener("update", "click", _onClickUpdate);
        Event.addListener("cancel", "click", function(ev){
            _renderPage({"responseText": JSON.stringify(oData)});
        });
    };
    
    /**
     * post page content
     * @method _onClickUpdate
     * @private
     * @param Event {object}
     * @param Data {object} Page content data
     * @return {void}
     */
    var _onClickUpdate = function(oEvent){
        
        var sKeyName  = Dom.get("keyname").value,
            sTitle    = Dom.get("title").value,
            sPostData = "title=" + encodeURIComponent(sTitle)
                      + "&content=" + encodeURIComponent( Dom.get("content").value ),
            oCallback = {
                success: _renderPage
            };
        Connect.asyncRequest("POST", _sRequestUrl + sKeyName, oCallback, sPostData);
        Dom.get(sKeyName).innerHTML = sTitle;
    };
    
    /**
     * render page contents
     * the response items are: tId, status, statusText, responseText, etc.
     * @method _renderPage
     * @private
     * @param Response {object} response of async request
     * @see http://developer.yahoo.com/yui/connection/#success
     * @return {void}
     */
    var _renderPage = function(oResponse){
        var oData    = JSON.parse(oResponse.responseText),
            sContent = "";
        
        _sCurrentPageText = oData.content;
        oData.content     = SDConverter.makeHtml(oData.content);
        sContent          = _supplant(_sContentTemplate, oData)
        
        Dom.get("container").innerHTML = sContent;
        Event.addListener("edit", "click", _onClickEdit);
        Event.addListener("delete", "click", _onClickDelete);
    };

    /**
     * replace placeholders with the data
     * @method _supplant
     * @param Template {string}
     * @param Data {object}
     * @return {string} replaced string
     */
    var _supplant = function(sTemplate, oData){
        return sTemplate.replace(/{([^{}]*)}/g, function(a, b){
                    var r = oData[b];
                    return typeof r === "string" ? r : "";
               });
    };
    
    return {
        /**
         * show page contents
         * @method show
         * @param KeyName {string} key_name of the page
         * @return {void}
         */
        show: function(sKeyName){
            sKeyName = sKeyName || _sHomeKeyname;
            var oCallback = {
                success: _renderPage
            };
            Connect.asyncRequest("GET", _sRequestUrl + sKeyName, oCallback);
        }
    };
}();