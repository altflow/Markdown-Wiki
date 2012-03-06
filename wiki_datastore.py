# datastore.py

import hashlib
from google.appengine.ext import db

# defition of model
class WikiPage(db.Model):
    title   = db.StringProperty()
    content = db.TextProperty()
    
# default data
homepage_text = "Currently this site is under testing.\n\nThis wiki is made for personal study for Google App Engine, especially to learn user api and datastore.\n\nAttention (in other words, to-do list):\n\n- you can not delete home page, but it does not alert anything (this should also be implemented later.)"

markdownpage_text = "> Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML).\n\n[Markdown](http://daringfireball.net/projects/markdown/)\n\nThis wiki renders its content with [Showdown](http://attacklab.net/showdown/) which is JavaScript port of Markdown."

testpage_text = "Try to edit this page."

page_content = WikiPage(key_name=hashlib.sha256("home").hexdigest(), title="home", content=homepage_text)
page_content.put()
page_content = WikiPage(key_name=hashlib.sha256("markdown").hexdigest(), title="markdown", content=markdownpage_text)
page_content.put()
page_content = WikiPage(key_name=hashlib.sha256("test page").hexdigest(), title="test page", content=testpage_text)
page_content.put()

