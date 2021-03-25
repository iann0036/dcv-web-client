import "./dcvjs/dcv.js"

let auth,
    connection,
    serverUrl,
    username,
    password;

console.log("Using NICE DCV Web Client SDK version " + dcv.version.versionStr);
//document.addEventListener('DOMContentLoaded', main);

function main () {
    console.log("Setting log level to INFO");
    dcv.setLogLevel(dcv.LogLevel.INFO);

    //serverUrl = "https://your-dcv-server-url:port/";

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
        auth.sendCredentials({username: username, password: password})
    } else {
        // Challenge is requesting something else...
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
