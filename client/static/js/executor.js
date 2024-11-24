function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


async function executeBlock(block) {
    if (block.action == "while") {
        if (block.var == "1") { // While True
            while (1) {
                await executeSeq(block.blocks);
            }
        } else if (!isNumeric(block.var)){
            var res0 = 1;
            while (res0){
                res0 = await sendCommandAndWait(JSON.stringify({"action": "get_var", "name": block.var}));
                res0 = parseInt(JSON.parse(res0.slice(res0.indexOf("{"), res0.indexOf("}") + 1))["var"]);
                if (isNaN(res0)) res0 = 1;
                console.log("VAR", res0);
                await executeSeq(block.blocks);
            }
            
        }

    } else if (block.action == "repeat") {
        if (isNumeric(block.times)){
            for (var i = 0; i < block.times; i++) await executeSeq(block.blocks);
        } else { // By var
            // request var
            var res0 = await sendCommandAndWait(JSON.stringify({"action": "get_var", "name": block.times}));
            res0 = parseInt(JSON.parse(res0.slice(res0.indexOf("{"), res0.indexOf("}") + 1))["var"]);
            for (var i = 0; i < res0; i++) await executeSeq(block.blocks);
        }
    } else if (block.action == "serial_print"){ 
        var res0 = await sendCommandAndWait(JSON.stringify({ "action": "serial_print", "text": block.text, "var": block.var }));
        res0 = JSON.parse(res0.slice(res0.indexOf("{"), res0.indexOf("}") + 1));
        document.getElementById("serialLogs").innerHTML += res0["print"] + "\n";
        console.log("Resp", res0);

    } else if (block.action == "if") {
        if (isNumeric(block.var)) {
            if (parseInt(block.var)){
                await executeSeq(block.true_blocks);
            } else {
                await executeSeq(block.false_blocks);
            }
            
        } else {
            // Req  var
            var res0 = await sendCommandAndWait(JSON.stringify({"action": "get_var", "name": block.var}));
            res0 = parseInt(JSON.parse(res0.slice(res0.indexOf("{"), res0.indexOf("}") + 1))["var"]);
            if (res0){
                await executeSeq(block.true_blocks);
            } else {
                await executeSeq(block.false_blocks);
            }
        }
    } else if (block.action == "led_set") {
        console.log("Genric block -> no postprocessing", block);
        var pinId;
        if (block.pin == "L1") pinId = 5;
        else pinId = 7;
        
        if (block.var == "Вкл") var vv = 1;
        else var vv = 0;
        const res0 = await sendCommandAndWait(JSON.stringify({ "action": "pin_mode", "pin": `${pinId}`, "mode": "OUTPUT" }));
        const res = await sendCommandAndWait(JSON.stringify({ "action": "dpin_write", "pin": `${pinId}`, "val": `${vv}` }));

        console.log("[EXEC BLOCK]", res);
    } else if (block.action == "btn_read") {
        const res0 = await sendCommandAndWait(JSON.stringify({ "action": "btn_read", "pin": `${block.pin}`, "var": block.var }));

    } else {
        // if (block.action == "delay") block.delay = parseInt(block.delay);
        // JUST send 
        console.log("Genric block -> no postprocessing");
        console.log("[UART]", JSON.stringify(block).replace("чтение", "INPUT").replace("запись", "OUTPUT").replace("подтяжка", "PULL"));
        const res = await sendCommandAndWait(JSON.stringify(block).replace("чтение", "INPUT").replace("запись", "OUTPUT").replace("подтяжка", "PULL"));
        console.log("[EXEC BLOCK]", res);
        // const res = listenToPort();

    }
}

async function executeSeq(processed) {
    console.log("Starting execution on board")
    console.log(processed);
    for (var block_ind = 0; block_ind < processed.length; block_ind++) {
        await executeBlock(processed[block_ind]);
    }
    console.log("Execution finished")
}

function singleBlockToC(block) {
    if (block.action == "pin_mode") {
        return `pinMode(${parseInt(block.pin)}, ${block.mode.replace("чтение", "INPUT").replace("запись", "OUTPUT")});`;
    } else if (block.action == "dpin_write") {
        return `digitalWrite(${parseInt(block.pin)}, ${parseInt(block.val)});`;
    } else if (block.action == "dpin_read") {
        return `${block.var} = digitalRead(${parseInt(block.pin)});`;


    } else if (block.action == "apin_write") {
        return `analogWrite(${parseInt(block.pin)}, ${parseInt(block.val)});`;
    } else if (block.action == "apin_read") {
        return `${block.var} = analogRead(${parseInt(block.pin)});`;
    } else if (block.action == "delay") {
        return `delay(${block.delay});`;
    }

}

function translateToC(processed) {
    console.log(processed);
    var source = "";
    for (var block_ind = 0; block_ind < processed.length; block_ind++) {
        var block = processed[block_ind];
        if (block.action == "void_setup") {
            source += "void setup(){"
            for (var local_iter_i = 0; local_iter_i < block.blocks.length; local_iter_i++) {
                source += singleBlockToC(block.blocks[local_iter_i]);
            }
            source += "}";
        }
        if (block.action == "void_loop") {
            console.log(block);
            source += "void loop(){"
            for (var local_iter_i = 0; local_iter_i < block.blocks.length; local_iter_i++) {
                source += singleBlockToC(block.blocks[local_iter_i]);
            }
            source += "}";
        }
        else if (0) { }
        // else {
        //     source += singleBlockToC(block);
        // }
        source += "\n";
    }
    return source;
}