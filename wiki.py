#!/usr/bin/python

"""Small wiki that uses Markdown for the wiki markup

This handles user authentication, datastore and memcache of Google App Engine.
The page rendering is handled in JavaScript with Showdown.
"""

import hashlib
from datetime import datetime
from django.utils import simplejson
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class Permission:
    """This handles user permission
    
    This checks if the login user email is in the list.
    If there is no email in the list, all login users are allowed
    to access, manage the contents.
    """
    def __init__(self):
        """Initialization
        
        Define email addresses of user who has permission to manage contents.
        """
        self.accessible = []
    
    def get(self):
        """This returns if the user is permitted or not"""
        user = users.get_current_user()
        
        if user:
            if len(self.accessible) < 1:
                return True
        
            for email in self.accessible:
                if user.email() == email:
                    return True
        
        return False


class AddPage(webapp.RequestHandler):
    """This adds new page
    
    If user has permission, this adds new wiki page and clear pagelist cache.
    """
    def post(self):
        """This handles post method"""
        title      = self.request.get("new_pagename")
        keyname    = hashlib.sha256( title.encode("utf-8") + str(datetime.utcnow()) ).hexdigest()
        permission = Permission()
        
        if permission.get() and not WikiPage.get_by_key_name(keyname):
            
            page         = WikiPage(key_name=keyname)
            page.title   = title
            page.content = "edit this page."
            page.put()
            
            data = {"keyname":keyname, "title": page.title, "content": page.content}
            
            if memcache.get("pagelist"):
                memcache.delete("pagelist")
            
            self.response.headers['Content-Type'] = 'text/plain'
            self.response.out.write(simplejson.dumps(data))


class Auth(webapp.RequestHandler):
    """This handles user login"""
    
    def get(self):
        """This checks if a user is login or not
        
        If not, it shows link to login page.
        """
        url        = '/markdownwiki/wiki.html'
        permission = Permission()

        if permission.get():
            user = users.get_current_user()
            data = {"nickname": user.nickname(), "logoutUrl": users.create_logout_url(url)}
            
        else:
            data = {"loginUrl": users.create_login_url(url)}
        
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(simplejson.dumps(data))
    

class DeletePage(webapp.RequestHandler):
    """This handles delete page request"""
    
    def post(self):
        """This handles the request
        
        If the request is not for delete home page and the user has permission,
        this removes the page data from datastore.
        """
        keyname    = self.request.get("keyname")
        page       = ""
        data       = {}
        permission = Permission()
        
        if keyname != "4ea140588150773ce3aace786aeef7f4049ce100fa649c94fbbddb960f1da942":
            # user can not delete 'home' page
            page    = WikiPage.get_by_key_name(keyname)
        
        if permission.get() and page:
            page.delete()
            data = {"keyname":keyname, "message":"the page has been deleted"}
            
            if memcache.get(keyname):
                memcache.delete(keyname)
            if memcache.get("pagelist"):
                memcache.delete("pagelist")
            
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(simplejson.dumps(data))

   
class Page(webapp.RequestHandler):
    """This handles page contents"""
    
    def __init__(self):
        """Initialization"""
        self.permission = Permission()
        self.data       = {}
    
    def get(self, keyname):
        """This returns page contents in JSON
        
        Args:
            keyname: key_name of the requested page
        """
        if self.permission.get():
            data = memcache.get(keyname)
            if data is not None:
                self.data = data
            else:
                page = WikiPage.get_by_key_name(keyname)
                self.data = {"keyname":keyname, "title": page.title, "content": page.content}
                memcache.add(keyname, self.data, 3600)
            
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(simplejson.dumps(self.data))
    
    def post(self, keyname):
        """This updates page contents and then return the udpated contents in JSON
        
        Args:
            keyname: key_name of the requested page
        """
        if self.permission.get():
            page         = WikiPage(key_name=keyname)
            page.title   = self.request.get("title")
            page.content = self.request.get("content")
            page.put()
            
            self.data = {"keyname":keyname, "title": page.title, "content": page.content}
            
            if memcache.get(keyname):
                memcache.replace(keyname, self.data, 3600)
            
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(simplejson.dumps(self.data))


class PageList(webapp.RequestHandler):
    """This returns page list"""
    
    def get(self):
        """This returns page list in JSON"""
        permission = Permission()
        data       = []
        
        if permission.get():
            pagelist = memcache.get("pagelist")

            if pagelist is not None:
                data = pagelist
            else:
                query = WikiPage.all()
                query.order("title")
                
                for record in query:
                    data.append({"keyname":record.key().name(), "title": record.title })
                    
                memcache.add("pagelist", data, 3600)
            
        self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write(simplejson.dumps(data))


class WikiPage(db.Model):
    """Definition of data model"""
    title   = db.StringProperty()
    content = db.TextProperty()


application = webapp.WSGIApplication([
                                        ('/wiki/auth', Auth),
                                        ('/wiki/page/([^/]+)', Page),
                                        ('/wiki/add', AddPage),
                                        ('/wiki/delete', DeletePage),
                                        ('/wiki/list', PageList)
                                     ],
                                     debug=True)

def main():
    run_wsgi_app(application)
    
if __name__ == "__main__":
    main()
