const sd = require("silly-datetime");
const http = require("http");
const WebSocketServer = require("websocket").server;

const httpServer = http.createServer((request, response) => {
    console.log("[" + new Date + "] Received request for " + request.url);
    response.writeHead(404);
    response.end();
});

const wsServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: true
});

wsServer.on("connect", (connection) => {
    connection.on("message", (message) => {
        if (message.type === "utf8") {
            console.log("服务器接收1：", message);
            const data = {
                "content": "服务器自动回复",
                "client": message.utf8Data,
                "date": sd.format(new Date(), "YYYY-MM-DD HH:mm:ss")
            };
            // 服务端发送文本数据
            connection.sendUTF(JSON.stringify(data));
        } else if (message.type === "binary") {
            const receivedMsg = message.binaryData.toString("utf8");
            console.log("服务器接收2：", receivedMsg);
            const data = {
                "content": "服务器自动回复",
                "client": receivedMsg,
                "date": sd.format(new Date(), "YYYY-MM-DD HH:mm:ss")
            };
            // 服务端发送二进制字符串
            const buffer = Buffer.from(JSON.stringify(data), "utf8");
            connection.sendBytes(buffer);
        }
    });
    // 连接的关闭监听
    connection.on("close", (reasonCode, description) => {
        console.log("[" + new Date() + "] Peer " + connection.remoteAddress + " disconnected.");
    });
    // 接收控制台的输入
    process.stdin.on("data", function (buffer) {
        const message = buffer.toString().trim();
        console.log("控制台接收：", message);
        const data = {"content": message, "date": sd.format(new Date(), "YYYY-MM-DD HH:mm:ss")};
        connection.sendUTF(JSON.stringify(data));
    });
});

httpServer.listen(3000, () => {
    console.log("服务器启动成功，地址： ws://127.0.0.1:3000");
});
