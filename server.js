const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
var options = {
    key: fs.readFileSync('privateKey.key'),
    cert: fs.readFileSync('certificate.crt')
};

app.use(express.static(path.join(__dirname, 'public'))); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

var PORT = 443;
var config = require('./config.json');


//*************************************************************************** */
// var httpApp = require('http').createServer(app);
// RTCMultiConnectionServer.beforeHttpListen(httpApp, config);
// httpApp = httpApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function() {
//     RTCMultiConnectionServer.afterHttpListen(httpApp, config);
// });

// ioServer(httpApp).on('connection', function(socket) {
//     RTCMultiConnectionServer.addSocket(socket, config);


//******************************************************************** */
var httpsApp = require('https').createServer(options, app);
RTCMultiConnectionServer.beforeHttpListen(httpsApp, config);
httpsApp = httpsApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function() {
    RTCMultiConnectionServer.afterHttpListen(httpsApp, config);
});


ioServer(httpsApp).on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket, config);
//*************************************************************** */
    // ----------------------
    // below code is optional

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        var x                   = message.mouse.mouse_position.x;
        var y                   = message.mouse.mouse_position.y;
        var mousedownLeft       = message.mouse.mouse_click.mousedownLeft;
        var mousedownRight      = message.mouse.mouse_click.mousedownRight;
        let key                 = message.keyboard.key;
        if(key !== null){
            if(key === 'Backspace')
                robot.keyTap("backspace")
            else
                robot.keyTap(key)
            console.log(message.keyboard.key)
        }
        if(mousedownLeft){
            robot.mouseClick("left")
        }
        else if(mousedownRight){
            robot.mouseClick("right")
        }
        robot.moveMouse(x, y);
        //console.log(message.keyboard);
        socket.broadcast.emit(params.socketCustomEvent, message);
    });
});


  app.get('/videochat/:roomid', function(req, res){
    res.render('./videochat.html', {roomid:req.params.roomid})
  });