var http = require("http");
var Router = require("./router");
var ecstatic = require("ecstatic");
var fs = require("fs");

var fileServer = ecstatic({root: "./public"});
var router = new Router;

http.createServer(function(request, response) {
  if (!router.resolve(request, response)) {
    fileServer(request, response);
  }
}).listen(8000);

function respond(response, status, data, type) {
  response.writeHead(status, {
    "Content-Type": type || "text/plain"
  });
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data), "application/json");
}

var files = Object.create(null);

//check to see if files.json exists. If it does, parse the file
// and load it into the files object

fs.stat("./public/files.json", function(error, stats) {
  if (error && error.code == "ENOENT") {
    console.log("files.json not initialized");
  } else {
    fs.readFile("./public/files.json", "utf-8", function(error, data) {
      files = JSON.parse(data);
      //console.log(files);
    });
  }
});

// helper function -- write contents of the files object into files.json
function writeToJSON() {
  fs.writeFile("./public/files.json", JSON.stringify(files), function(error) {
    if (error) {
      respond(response, 400, error.toString());
    }
  });
}

function writeToFile(name, data) {
  fs.writeFile("./public/files/" + name, data, function(error) {
    if (error) {
      respond(response, 400, error.toString());
    }
  });
}

router.add("GET", /^\/files\/([^\/]+)$/, function(request, response, title) {

});