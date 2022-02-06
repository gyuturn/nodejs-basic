var http = require('http');
var fs = require('fs');
const path = require('path/posix');
var qs= require('querystring');

var app = http.createServer(function(request, response) {

var varUrl = request.url; // ?id=HTML
var myURL = new URL('http://localhost:3000' + varUrl); // http://localhost......TML
var pathname= myURL.pathname;
var queryData = myURL.searchParams.get('id'); // HTML
var template=require('./lib/template.js');
var path=require('path');
var sanitizeHtml= require('sanitize-html');

function templateHTML(title,list,body,control){
  return `
    <!doctype html>
    <html>
    <head>
      <title>WEB3 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
      </p>
    </body>
    </html>
    `;
}

function templateList(filelist){
  var list=`<ul>`;
      var i=0;
      while(i<filelist.length){
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i=i+1;
      }
      list = list+'</ul>';
      return list;
}

if(pathname === '/'){
  if(queryData===null){
    fs.readdir('data',function(err,filelist){
      var title= "Welcome";
      var description ="hello node.js";

        var list= template.list(filelist);
      var html = template.html(title,list,
        `<h2>${title}</h2><p>${description}`,
        `<a href="/create">create</a> `);
        response.writeHead(200);
        response.end(html);
    })
    
  }
  else{
    fs.readdir('data',function(err,filelist){
      var filteredId=path.parse(queryData).base;
      fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
        var title=queryData;
        var sanitizedTitle=sanitizeHtml(title);
        var sanitizedDescription=sanitizeHtml(description,{
          allowedTags:['h1']
        });
        var list= templateList(filelist);
        var template =  templateHTML(sanitizedTitle,list,
          `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}`,
          `<a href="/create">create</a> 
          <a href="/update?id=${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post" >
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
          </form>
          `);
          response.writeHead(200);
          response.end(template);
      });
    })
  }
}
else if(pathname=== '/create'){
  fs.readdir('data',function(err,filelist){
    var title= "WEB - create";
    var list= templateList(filelist);
    var template = templateHTML(title,list,`
      <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
          <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
          <input type="submit">
      </p>
      </form>
    `,'');
      response.writeHead(200);
      response.end(template);
  });
}
else if(pathname=== '/create_process'){
  var body= '';
  request.on('data', function(data){
      body += data;
  });
  request.on('end',function(){
      var post= qs.parse(body);
      var title=post.title;
      var description= post.description;
      fs.writeFile(`data/${title}`, description,'utf-8', function(err){
        response.writeHead(302,{Location: `/?id=${title}`});
        response.end();
      });
  });
  
}
else if(pathname==='/update'){
  fs.readdir('data',function(err,filelist){
    var filteredId=path.parse(queryData).base;
    fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
      var title=queryData;
      var list= templateList(filelist);
      var template =  templateHTML(title,list,
        `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
      <p><input type="text" name="title" placeholder="title" value="${title}"></p>
      <p>
          <textarea name="description" placeholder="description" >${description}</textarea>
      </p>
      <p>
          <input type="submit">
      </p>
      </form>

        `,
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        response.writeHead(200);
        response.end(template);
    });
  })
}
else if( pathname=='/update_process'){
  var body= '';
  request.on('data', function(data){
      body += data;
  });
  request.on('end',function(){
      var post= qs.parse(body);
      var id=post.id;
      var title=post.title;
      var description= post.description;
      fs.rename(`data/${id}`,`data/${title}`,function(err){
        fs.writeFile(`data/${title}`, description,'utf-8', function(err){
          response.writeHead(302,{Location: `/?id=${title}`});
          response.end();
        });
      })
      
  });
}
else if( pathname=='/delete_process'){
  var body= '';
  request.on('data', function(data){
      body += data;
  });
  request.on('end',function(){
      var post= qs.parse(body);
      var id=post.id;
      var filteredId=path.parse(id).base;
      fs.unlink(`data/${filteredId}`,function(err){

      });
      response.writeHead(302,{Location: `/`});
      response.end();
  });
}
else{
  response.writeHead(404);
      response.end("not found");
  }
});
app.listen(3000);