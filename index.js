const express = require('express');
const serveStatic = require('serve-static');

const settings = require('./settings.json');



// create server
const app = express();
const serving = serveStatic(__dirname + '/web', { fallthrough: false });

function redirect(response, location, logging = '|- Redirect') {
  console.log(logging + ': ' + location);
  response.writeHead(302, {
    'Location': location,
  });
  response.end();
}

app.use(function serveLog(request, response, next) {
  console.log('Serve: ' + request.url);
  next();
});

// app.use('/test', function dynamicServe(request, response, next) {
//   console.log('|- Dynamic: ' + request.url);

//   response.setHeader('Content-Type', 'text/plain');
//   response.end('Dynamic root: ' + request.url);
// });

app.use(function serve(request, response, next) {
  console.log('|- Static: ' + request.url);
  serving(request, response, next);
});

app.use(function redirectHtmlFile(err, request, response, next) {
  console.log('|--- Static: Url is not static!');

  if (err.statusCode == 404 && !request.url.endsWith('.html')) {
    redirect(response, request.url + '.html', '|- Html Redirect');
  } else {
    next(err);
  }
});

app.use(function notFoundHandler(err, request, response, next) {
  if (err.statusCode == 404) {
    redirect(response, '/error/404.html');
  } else {
    next(err);
  }
});

app.use(function errorHandler(err, request, response, next) {
  console.error('|- Error (' + err.statusCode + '): ' + err);
});

// start server
app.listen(settings.server.port, function () {
  console.log();
  console.log('Server is available on: ');
  console.log('localhost:' + settings.server.port);
  console.log();
});
