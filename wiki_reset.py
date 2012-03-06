#!/usr/bin/python

import hashlib
from google.appengine.ext import db
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class WikiPage(db.Model):
    """Definition of data model"""
    title   = db.StringProperty()
    content = db.TextProperty()


class WikiReset(webapp.RequestHandler):
    """This resets existing wiki data"""
    def get(self):
        """This removes wiki data and insert default data"""
        query = WikiPage.all()
            
        for record in query:
            record.delete()
        
        # set up default data
        homepage_text = "Currently this demo site is under testing.\n\nThis wiki is made for personal study for Google App Engine, especially to learn user api and datastore.\n\nAttention:\n\n- you can not delete home page, but it does not alert anything.\n- the page contents will be reset once a day"
        
        markdownpage_text = "> Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML).\n\n[Markdown](http://daringfireball.net/projects/markdown/)\n\nThis wiki renders its content with [Showdown](http://attacklab.net/showdown/) which is JavaScript port of Markdown."
        
        testpage_text = "Try to edit this page."
        
        page_content = WikiPage(key_name=hashlib.sha256("home").hexdigest(), title="home", content=homepage_text)
        page_content.put()
        page_content = WikiPage(key_name=hashlib.sha256("markdown").hexdigest(), title="markdown", content=markdownpage_text)
        page_content.put()
        page_content = WikiPage(key_name=hashlib.sha256("test page").hexdigest(), title="test page", content=testpage_text)
        page_content.put()
        
        self.response.out.write("finished to reset the datastore.")


application = webapp.WSGIApplication([('/wiki_reset', WikiReset)], debug=True)

def main():
    run_wsgi_app(application)
    
if __name__ == "__main__":
    main()

