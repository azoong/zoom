// import express from "express";
const express = require("express");
const http = require("http");
const SocketIo = require("socket.io")
// const WebSocket = require("ws")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res) => res.render("home"))
app.get("/*", (req, res) => res.render("home"))






const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer) //소켓 io 서버 

function publicRooms(){ //퍼블릭 룸을 찾는 함수
    const sids = wsServer.sockets.adapter.sids
    const rooms = wsServer.sockets.adapter.rooms
    const publicRooms = [];
    rooms.forEach((_,key) =>{
        if (sids.get(key) === undefined){
            publicRooms.push(key)
        }
    });
    return publicRooms
}

function countRoom(roomName){ //방에 인원을 확인하는 함수
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}


wsServer.on("connection", socket => {
    console.log("Connected to Browser ✅")
    socket["nickname"] = "Anonymous" //첫 연결되었을시 닉네임 익명으로 지정
    socket.onAny((event) => {
        console.log(`Socket EventL ${event}`)
        // console.log(wsServer.sockets.adapter)
    })
    socket.on("enter_room", (roomName, done) => { //방입장시 이벤트 발생
        socket.join(roomName) //룸 입장
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //방인원에게 메시지 전송
        // setTimeout(()=> {
        //     done("hello from the backend")
        // }, 10000)
        wsServer.sockets.emit("room_change", publicRooms()); //소켓 서버 전체에게 방정보 전송
    })
    socket.on("disconnecting", () => {  //연결이 끊어지기 직전  메시지 전송
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1))
        
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms())
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        console.log(room)
        // done();
    })
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

})


/* ws소켓 
const wss = new WebSocket.Server({ server })
const sockets = []

// function handleConnection(socket){  //함수를 넣는 방식
//     console.log(socket)
// }
// wss.on("connection", handleConnection)

wss.on("connection", (socket) =>{
    sockets.push(socket) //소켓리스트에 푸쉬...
    socket["nickname"] = "Anonymous" //소켓연결시 맨처음 닉네임을 익명으로 생성
    console.log("Connected to Browser ✅")
    socket.on("close", () => console.log("Disconnected from the Browser"))
    socket.on("message", (msg) => {
        const message = JSON.parse(msg) //프론트에서 받은 데이터를 제이슨 형식으로 변환
        // socket.send(message.toString('utf8'))
        switch (message.type){  //스위치문 if문이랑 같지만 사용방식만 다름.
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`)) //제이슨에서 페이로드 값만 추출해서 전송
                break
            case "nickname":  //소켓에 닉네임을 지정해주는 코드
                socket["nickname"] = message.payload; 
                break
        }
        

    })
    // socket.send("hello") //백엔드에서 프론트로 메시지 전송
})
*/




httpServer.listen(3000, () => {
    console.log("서버가 요청을 받을 준비가 됐어요");
});

