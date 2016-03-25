function request(options, callback) {
  var req = new XMLHttpRequest();
  req.open(options.method || "GET", options.pathname, true);
  req.addEventListener("load", function () {
    if (req.status < 400) {
      callback(null, req.responseText);
    } else {
      callback(new Error("Request failed: " + req.statusText()));
    }
  });
  req.addEventListener("error", function () {
    callback(new Error("Network error"));
  });
  req.send(options.body || null);
}

var filebox = document.querySelector("#filebox");

request({pathname: "files"}, function(error, response) {
  if (error) {
    console.log(error.toString());
  } else {
    response = JSON.parse(response);
    var option = null;
    for (name in response) {
      option = document.createElement("option");
      option.textContent = response[name].title;
      filebox.appendChild(option);
    }
  }
});