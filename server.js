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
  response.end(data.toString());
}

function respondFile(response, status, data) {
  respond(response, status, data);
}

var files = Object.create(null);

//check to see if files.json exists. If it does, parse the file
// and load it into the files object

fs.stat("./public/files.json", function(error, stats) {
  if (error && error.code == "ENOENT") {
    console.log("files.json not initialized");
    fs.writeFile("./public/files.json", "", function(error) {
      if (error) {
        respond(response, 501, error.toString());
      }
    });
  } else {
    fs.readFile("./public/files.json", "utf-8", function(error, data) {
      files = JSON.parse(data);
      console.log(files);
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

// Takes the title of file, finds it in `files`, and if it exists,
// return the content of the file

router.add("GET", /^\/files\/([^\/]+)$/, function(request, response, title) {
  if (title in files) {
    respondFile(response, 200, "./public/files/" + title);
    /*fs.readFile("./public/files/" + title, function(error, data) {
      if (error) throw error;
      return data.toString();
    });*/
  } else {
    respond(response, 404, "No file '" + title + "' found.");
  }
});

router.add("DELETE", /^\/files\/([^\/]+)$/, function(request, response, title) {
  if (title in files) {
    var file = "./public/files/" + title;
    fs.unlink(file);
  }
  respond(response, 204, null);
});





