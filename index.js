const webSocketsServerPort=8000;
const webSocketServer = require('websocket').server;
const http = require('http');
const { client } = require('websocket');

//spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
console.log("listen on port 8000");

const wsServer = new webSocketServer({
    httpServer: server
});

const clients = {};

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' +s4();
};

wsServer.on('request', function(request) {
    var userID = getUniqueID();
    console.log((new Date()) + ` Received a new connection from origin ` + request.origin + '.');

    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

    connection.on('message', function(message) {
        if(message.type === 'utf8') {
            console.log('Received Message: ', message.utf8Data);
            const data = JSON.parse(message.utf8Data);
            if(data.type == "setUserId"){
                clients[data.userId] = clients[userID];
            }
            if(data.type == "noti"){
                for(key in clients) {
                    console.log(key);
                    if(key == data.assignedId){
                    clients[key].sendUTF(message.utf8Data);
                    console.log('sent Message to: ', clients[key]);
                    }
                }
            }
            for(key in clients) {
                console.log(key);
                if(key == data.userId){
                clients[key].sendUTF(message.utf8Data);
                console.log('sent Message to: ', clients[key]);
                }
            }
        }
    })
});