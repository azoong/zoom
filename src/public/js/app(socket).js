const messageList = document.querySelector("ul")
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){  //메시지 구분을 위해 제이슨형식으로 변환
    const msg = {type, payload}  //메시지 타입을 정해주고 페이로드의 인풋값을 담음
    return JSON.stringify(msg);

}


socket.addEventListener("open", () =>{  //소켓 연결시
    console.log("Connected to Server ✅")
})

socket.addEventListener("message", (message) =>{  
    // console.log("New message : ", message.data)
    const li = document.createElement("li") // 콘솔로그가 아닌 페이지에 글자 출력
    li.innerText = message.data; 
    messageList.append(li)
})


socket.addEventListener("close", ()  => { //소켓 연결 끊어질시
    console.log("Disconnected from Server ❌")
})

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input")
    socket.send(makeMessage("new_message", input.value))  // 서버로 메시지 전송
    const li = document.createElement("li") // 콘솔로그가 아닌 페이지에 글자 출력
    li.innerText = `You: ${input.value}`; 
    messageList.append(li)
    input.value= "";  //한번 보내고 바로 칸이 비워지는 작업
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input")
    socket.send(makeMessage("nickname", input.value))
    input.value= "";
}


messageForm.addEventListener("submit", handleSubmit)
nickForm.addEventListener("submit", handleNickSubmit)

// setTimeout(() =>{
//     socket.send("hello from the browser!"); //프론트에서 백엔드로 메시지 전송
// }, 10000);