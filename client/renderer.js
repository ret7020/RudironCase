var CONFIG_BAUD = 115200;
var port, textEncoder, writableStreamClosed, writer, historyIndex = -1;
var textDecoder, readableStreamClosed, reader;

async function uartConnect() {
    console.log("Initing serial connection");
    port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x10C4 }, { usbVendorId: 0x1A86 }] })
    console.log(port);
    const portInfo = port.getInfo()
    console.log(portInfo);
    await port.open({ baudRate: CONFIG_BAUD });

    // Writer setup
    textEncoder = new TextEncoderStream();
    writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();


    // Reader setup
    textDecoder = new TextDecoderStream();
    readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    // await listenToPort();

}

async function listenToPort() {
    let res = "";
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            reader.releaseLock();
            break;
        }
        res += value;
        console.log("listenToPort", value, res);
        if (value == "}" || res == "{}" || value == "{}" || res.indexOf("}") !== -1) {
            console.log("END loc");
            // document.getElementById("serial_logs").innerText += res;
            return res;
        }
    }
}

async function sendCommand(payload) {
    await writer.write(payload);
}

async function sendCommandAndWait(payload) {
    console.log("Payload", payload)
    await writer.write(payload);
    const res = await listenToPort();
    return res;
}

async function flashWithCCode() {
    source = runToC();
    console.log("[READY SOURCE]", source);
    await window.electron.compile();
}

async function loadFile() {
    await window.electron.select_file().then(function (res) {
        console.log(res);
    });

}



const loadFileButton = document.getElementById('loadFile');
const sourceZone = document.getElementById("code-contents");

loadFileButton.addEventListener('click', async () => {
    const fileContent = await window.electron.select_file();
    if (fileContent) {
        // fileContentDiv.textContent = fileContent;
        sourceZone.innerHTML = fileContent;
    } else {
        console.log("Err")
    }
});


document.getElementById('connectToBoard').addEventListener('click', uartConnect);
// document.getElementById('flash').addEventListener('click', flashWithCCode);
