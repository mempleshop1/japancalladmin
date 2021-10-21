window.onload = () => {
    if (localStorage.getItem("admin") === "loggedin") {
        window.location.replace("dashboard.html");
    }
};

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    var data = {};
    data.username = username;
    data.password = password;
    var json = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://japancallrouting.herokuapp.com/adminlogin", true);
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == "200") {
            const user = JSON.parse(xhr.response).user[0];
            localStorage.setItem("admin", "loggedin");
            localStorage.setItem("adminusername", user.username);
            localStorage.setItem("adminid", user._id);
            localStorage.setItem("admincallstatus", user.callactive);
            window.location.replace("dashboard.html");
        } else {
            alert("Username or password incorrect !");
            console.log("Error");
        }
    };
    xhr.send(json);
}
