window.onload = () => {
  if (localStorage.getItem("admin") !== "loggedin") {
    window.location.replace("index.html");
  }
};

function logout() {
  localStorage.clear();
  window.location.replace("dashboard.html");
}

const peer = new Peer(`japancallteam1` + localStorage.getItem("adminusername"));

window.peer = peer;

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream; // A
      window.localAudio.srcObject = stream; // B
      window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.log("u got an error:" + err);
    });
}

getLocalStream();

peer.on("open", function () {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

const audioContainer = document.querySelector(".call-container");
/**
 * Displays the call button and peer ID
 * @returns{void}
 */

function showCallContent() {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
  audioContainer.hidden = true;
}

/**
 * Displays the audio controls and correct copy
 * @returns{void}
 */

function showConnectedContent() {
  window.caststatus.textContent = `You're connected`;
  callBtn.hidden = true;
  audioContainer.hidden = false;
}

let code;
function getStreamCode() {
  code = window.prompt("Please enter the sharing code");
}

let conn;
function connectPeers() {
  conn = peer.connect(code);
}

peer.on("connection", function (connection) {
  conn = connection;
});

const callBtn = document.querySelector(".call-btn");

callBtn.addEventListener("click", function () {
  getStreamCode();
  connectPeers();
  const call = peer.call(code, window.localStream); // A

  call.on("stream", function (stream) {
    // B
    window.remoteAudio.srcObject = stream; // C
    window.remoteAudio.autoplay = true; // D
    window.peerStream = stream; //E
    showConnectedContent(); //F    });
  });
});

peer.on("call", function (call) {
  document.getElementById("ring").play();

  swal({
    title: "Pick up call?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((pickcall) => {
    if (pickcall) {
      document.getElementById("ring").pause();
      ring.pause();
      call.answer(window.localStream); // A
      showConnectedContent(); // B
      call.on("stream", function (stream) {
        // C
        window.remoteAudio.srcObject = stream;
        window.remoteAudio.autoplay = true;
        window.peerStream = stream;
      });

      var data = {};
      data.adminid = localStorage.getItem("adminid");
      var json = JSON.stringify(data);

      var xhr = new XMLHttpRequest();
      xhr.open(
        "PUT",
        "https://japancallrouting.herokuapp.com/markoncall",
        true
      );
      xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
      xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == "200") {
          console.log("Success");
        } else {
          console.log("Error");
        }
      };
      xhr.send(json);
    } else {
      document.getElementById("ring").pause();
      console.log("call denied"); // D
    }
  });
});

const hangUpBtn = document.querySelector(".hangup-btn");
hangUpBtn.addEventListener("click", function () {
  conn.close();
  showCallContent();

  var data = {};
  data.adminid = localStorage.getItem("adminid");
  var json = JSON.stringify(data);

  var xhr = new XMLHttpRequest();
  xhr.open(
    "PUT",
    "https://japancallrouting.herokuapp.com/removefromcall",
    true
  );
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.onload = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      console.log("Success");
    } else {
      console.log("Error");
    }
  };
  xhr.send(json);
});

conn.on("close", function () {
  showCallContent();
});
