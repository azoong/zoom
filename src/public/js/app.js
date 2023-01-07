const socket = io(); //프론트에서 소켓io 연결

const welcome = document.getElementById('welcome')
const form = welcome.querySelector("form")
const room = document.getElementById("room")

room.hidden = true
let roomName; //룸네임 처음에 비어있음.

function addMessage(message) {  //메시지 추가하는 함수
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message
  ul.appendChild(li)
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  // const value = input.value;
  socket.emit("nickname", input.value)
  input.value = ""
}


function showRoom() {
  welcome.hidden = true  // 입장하면 숨기고
  room.hidden = false  // 룸은 보이게
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomName}`
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit) //버튼누르면 이벤트발생 
  nameForm.addEventListener("submit", handleNicknameSubmit)
}


function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input")
  //emit 마지막 인자에 함수를 넣어서 서버에서 실행하여 프론트엔드로 내려줄수 잇음.
  socket.emit("enter_room", input.value, showRoom)
  roomName = input.value; //룸네임 값 을줌.
  input.value = ""
}

form.addEventListener("submit", handleRoomSubmit) //이벤트 발생시 handleRoomSubmit실행


socket.on("welcome", (user, newCount) => { //방 입장시 방인원에게 메시지 날리는 코드
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomName} (${newCount})`
  addMessage(`${user} joined`)
})

socket.on("bye", (user, newCount) => { //방 퇴장시 방인원에게 메시지 날리는 코드
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomName} (${newCount})`
  addMessage(`${user} left`)
})

socket.on("new_message", (msg) => { addMessage(msg) })

// socket.on("room_change", console.log)
// 위함수는 이거와 같음 socket.on("room_change", (msg) => console.log(msg))


socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul")
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return
  }
  rooms.forEach(room => {
    const li = document.createElement("li")
    li.innerText = room
    roomList.append(li)
  })

})


