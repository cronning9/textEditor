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
  respond(response, status, JSON.stringify(data), "application/json");;
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

function readStreamAsJSON(stream, callback) {
  var data = "";
  stream.on("data", function(chunk) {
    data += chunk;
  });
  stream.on("end", function() {
    var result, error;
    try { result = JSON.parse(data); }
    catch (e) { error = e; }
    callback(error, result);
  });
  stream.on("error", function(error) {
    callback(error);
  });
}

// Takes the title of file, finds it in `files`, and if it exists
// add its content to the files object and return that specific content
// as a string

router.add("GET", /^\/files\/([^\/]+)$/, function(request, response, title) {
  var splitted = title.split(".");
  var name = splitted[0];
  var extension = "." + splitted[1];
  if (name in files) {
    fs.readFile("./public/files/" + name + extension, "utf-8", function(error, data) {
      var obj = files[name];
      obj.content = data;
    });
    respond(response, 200, files[name].content);
    /*fs.readFile("./public/files/" + title, function(error, data) {
      if (error) throw error;
      return data.toString();
    });*/
  } else {
    respond(response, 404, "No file '" + title + "' found.");
  }
});

// Handles request to populate the file list with titles
router.add("GET", /^\/files$/, function(request, response) {
  respondJSON(response, 200, files);
});

router.add("POST", /^\/files\/([^\/]+)$/, function(request, response, title) {
  readStreamAsJSON(request, function(error, file) {
    if (error) {
      respond(response, 400, error.toString());
    } else if (!file ||
               typeof file.author != "string" ||
               typeof file.content != "string") {
      respond(response, 400, "Bad data");
    } else {
      files[title] = {title: title,
                      author: file.author};
      fs.writeFile("./public/files" + title + file.ext, file.content, function(error) {
        if (error) console.log(error);
      });
    }
  });
});

router.add("DELETE", /^\/files\/([^\/]+)$/, function(request, response, title) {
  if (title in files) {
    var file = "./public/files/" + title;
    fs.unlink(file);
  }
  respond(response, 204, null);
});





