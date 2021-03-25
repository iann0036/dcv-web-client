import "./dcvjs/dcv.js"

let auth,
    connection,
    serverUrl,
    username,
    password;

console.log("Using NICE DCV Web Client SDK version " + dcv.version.versionStr);
document.addEventListener('DOMContentLoaded', main);

function main () {
    console.log("Setting log level to INFO");
    dcv.setLogLevel(dcv.LogLevel.INFO);

    serverUrl = localStorage.getItem('url');

    console.log("Starting authentication with", serverUrl);
    
    auth = dcv.authenticate(
        serverUrl,
        {
            promptCredentials: onPromptCredentials,
            error: onError,
            success: onSuccess
        }
    );
}

function onPromptCredentials(auth, challenge) {
    // Let's check if in challege we have a username and password request
    if (challengeHasField(challenge, "username") && challengeHasField(challenge, "password")) {
        auth.sendCredentials({username: localStorage.getItem('username'), password: localStorage.getItem('password')})
    } else {
        console.warn("Challenge requires:");
        console.log(challenge);
    }
}

function challengeHasField(challenge, field) {
    return challenge.requiredCredentials.some(credential => credential.name === field);
}

function onError(auth, error) {
    console.log("Error during the authentication: ", error.message);
}

// We connect to the first session returned
function onSuccess(auth, result) {
    let {sessionId, authToken} = {...result[0]};

    connect(sessionId, authToken);
}

function connect (sessionId, authToken) {
    console.log(sessionId, authToken);
    
    dcv.connect({
        url: serverUrl,
        sessionId: sessionId,
        authToken: authToken,
        divId: "dcv-display",
        callbacks: {
            firstFrame: () => console.log("First frame received")
        }
    }).then(function (conn) {
        console.log("Connection established!");
        connection= conn;
    }).catch(function (error) {
        console.log("Connection failed with error " + error.message);
    });
}

// Recorder

var isRecording = false;
var events = [];

function popEvent() {
    let eventitem = events.shift();

    let ev = new Event(eventitem["type"], eventitem["event"]);

    document.querySelector('#dcv-display').dispatchEvent(ev);

    if (events.length) {
        setTimeout(popEvent, events[0]["time"].getUTCMilliseconds() - eventitem["time"].getUTCMilliseconds());
    } else {
        document.querySelector('#replay-button').innerHTML = "Play";
    }
}

document.querySelector('#record-button').addEventListener('click', e => {
    if (isRecording) {
        isRecording = false;
        e.target.innerHTML = "Record";

        document.querySelector('#steps').innerHTML = JSON.stringify(events);
    } else {
        isRecording = true;
        e.target.innerHTML = "Recording...";
    }
});

document.querySelector('#replay-button').addEventListener('click', e => {
    if (events.length) {
        e.target.innerHTML = "Playing...";

        popEvent();
    }
});

for (var eventtype of ['mousemove', 'mousedown', 'mouseup', 'keydown', 'keyup']) {
    document.querySelector('#dcv-display').addEventListener(eventtype, e => {
        if (isRecording) {
            events.push({
                'type': eventtype,
                'event': e,
                'time': new Date()
            });
        }
    });
}
