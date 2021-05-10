const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const logger = require("morgan");
const cors = require("cors");
const serveIndex = require("serve-index");
// const open = require("open");
const liveServer = require("live-server");
const http = require("http");
const server = http.createServer(app);
// const http2 = require("http2");
// const server = http2.createSecureServer(
//   {
//     key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//     cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
//   },
//   app
// );
const { Server } = require("socket.io");
const io = new Server(server);
const uploadStorage = require("./uploadStorage");
const { getLocalIp } = require("./getAddresses");
const encrypt = require("./encrypt");

const log = console.log;

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.resolve(__dirname, "public")));
app.use("/public", serveIndex(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/files", (req, res) => {
  uploadStorage.single("myFile")(req, res, function (err) {
    if (err) {
      log(err);
      return res.status(500).json({
        error: "Error uploading file.",
      });
    } else {
      log("Body: ", req.body.password);
      log("Req: ", req.file);
      encrypt(path.resolve(__dirname, req.file.path), req.body.password);
      fs.unlinkSync(path.resolve(__dirname, req.file.path));
      return res.redirect("/public");
    }
  });
});

app.set("PORT", process.env.PORT || 3005);

(async () => {
  log("Opening app running at: ");
  var params = {
    port: app.get("PORT"),
    host: getLocalIp(),
    root: "./",
    open: true,
    file: "index.html",
    logLevel: 2,
  };
  await liveServer.start(params);
})();

io.on("connection", (socket) => {
  log("A user connected :)");
  socket.on("message", (evt) => {
    socket.broadcast.emit("message", evt);
  });
  socket.on("disconnect", () => {
    log("A user disconnected");
  });
});

server.listen(app.get("PORT"), () => {
  log(`http://${getLocalIp()}:${app.get("PORT")}`);
});
