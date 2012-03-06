/**
 * wiki_auth.js
 * this handles authentication when the user accesses
 * @namespace mdwiki
 * @module mdwiki
 * @requires Page, PageList, YUI Connect, Dom, Event, JSON
 */
YAHOO.namespace("mdwiki");

/**
 * this handles authentication
 * @class Auth
 */
YAHOO.mdwiki.Auth = function(){
    var Connect = YAHOO.util.Connect,
        Dom     = YAHOO.util.Dom,
        Event   = YAHOO.util.Event,
        JSON    = YAHOO.lang.JSON;
        
    /**
     * display link to login page if the user is not login to Google account.
     * the response items are: tId, status, statusText, responseText, etc.
     * @method _handleAuth
     * @private
     * @param Response {object} response of async request
     * @see http://developer.yahoo.com/yui/connection/#success
     * @return {void}
     */
    var _handleAuth = function(oResponse){
        var oAuthInfo = JSON.parse(oResponse.responseText);
        
        if (typeof oAuthInfo === "object") {
            var oProfile   = Dom.get("profile");
            
            if (oAuthInfo.nickname) {
                // the user has been authenticated
                oProfile.innerHTML = "<a href='" + oAuthInfo.logoutUrl + "'>Logout</a>";
                YAHOO.mdwiki.Page.show();
                YAHOO.mdwiki.PageList.init();
            } else {
                // the user has not been authenticated
                oProfile.innerHTML = "<a href='" + oAuthInfo.loginUrl + "'>Login</a>";
            }
        }
    };
    
    Event.onDOMReady(function(){
        var oCallback = {
            success: _handleAuth
        };
        Connect.asyncRequest("GET", "/wiki/auth", oCallback);
    });
}();