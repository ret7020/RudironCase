#include <Arduino.h>
#include <Servo.h>
#include <Arduino_JSON.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include "typedef.h"
#include "memory_pool.h"
#include "map.h"


#define L1_PIN 5
#define L2_PIN 7
#define B1_PIN BUTTON_BUILTIN_1
#define B2_PIN BUTTON_BUILTIN_2
#define B3_PIN BUTTON_BUILTIN_3

#define BLK_DELAY         "delay"         // delay: <str> - time to wait
#define BLK_SET_VAR       "set_var"       // name: <str> - name of var,  val: <str> - number to assign
#define BLK_PINMODE       "pin_mode"      // pin: <str> - name of pin,  mode: <str> - "OUTPUT"/"INPUT"
#define BLK_DPIN_WRITE    "dpin_write"    // pin: <str> - name of pin,  val: <str> - var what to write to pin (cast if number)
#define BLK_DPIN_READ     "dpin_read"     // pin: <str> - name of pin,  var: <str> - var where to read from pin
#define BLK_APIN_WRITE    "apin_write"    // pin: <str> - name of pin,  val: <str> - var what to write to pin (cast if number)
#define BLK_APIN_READ     "apin_read"     // pin: <str> - name of pin,  var: <str> - var where to read from pin
#define BLK_SERIAL_PRINT  "serial_print"  // text: <str> - text to print,  var: <str> - var to print

#define BLK_BTN_READ      "btn_read"      // pin: <str> - what button to check,  var: <str> - var to read from button
#define BLK_LED_SET       "led_set"       // pin: <str> - what led to set,  val: <str> - 0/1
#define BLK_SERVO_WRITE   "servo_write"   // pin: <str> - name of pin,  angle: <str> - how much to rotate

#define BLK_RESET         "reset"         // name: <str> - "reset"
#define BLK_GET_VAR       "get_var"       // name: <str> - name of var

#define RET_PRINT         "print"
#define RET_STATUS        "status"
#define RET_VAR           "value"


MemoryPool GlobalMemoryPool;
Map Variables;
Map Servos;


// parse json
void parseJson(JSONVar *out_json){
    String json_string;
    char tmp[512];
    int curr_i = 0;
    while(1){
        tmp[curr_i] = Serial.read();
        curr_i++;
        bool available = (Serial.available() > 0);
        if(!available || curr_i == 511){
            tmp[curr_i] = 0;
            json_string.concat(tmp);
            curr_i = 0;
            if(!available){ break; }
        }
    }
    *out_json = JSON.parse(json_string.c_str());
}


int mode = 0;

void setup(){
    Serial.begin(115200);
    GlobalMemoryPool.initializePool();
}

void loop(){
    while(Serial.available() == 0){ delay(100); }

    // parse json and create status_json preset
    JSONVar op_block;
    parseJson(&op_block);
    JSONVar status_json;
    status_json[RET_STATUS] = String(0);

    String action = op_block["action"];
    // reset
    if(action == BLK_RESET){
        Variables.deleteAll();
        Servos.freeServos();
        Servos.deleteAll();
        GlobalMemoryPool.finalizePool();
        GlobalMemoryPool.initializePool();
    }

    // get variable
    else if(action == BLK_GET_VAR){
        String name = op_block["name"];
        JSONVar value_json;
        if(Variables.find(name)){ value_json[name] = String((DWORD)Variables[name]); }
        else{ value_json[name] = String(0); status_json[RET_STATUS] = String(1); }
        Serial.println(JSON.stringify(value_json));
    }

    // delay
    else if(action == BLK_DELAY){
        String duration = op_block["delay"];
        delay(duration.toInt());
    }

    // set variable
    else if(action == BLK_SET_VAR){
        String name = op_block["name"];
        String value = op_block["val"];
        Variables[name] = value.toInt();
    }

    // pin mode
    else if(action == BLK_PINMODE){
        String pin = op_block["pin"];
        String mode = op_block["mode"];

        int pin_i = 0;
        if(pin[0] == 'A'){ pin_i = 21 + ((int)op_block["pin"][1] - 0x30); }
        else{ pin_i = pin.toInt(); }

        int mode_i = 0;
        if(mode == "INPUT"){ mode_i = 0; }
        else if(mode == "OUTPUT"){ mode_i = 1; }
        else if(mode == "PULL"){ mode_i = INPUT_PULLDOWN; }
        pinMode(pin.toInt(), mode_i);
    }

    // digital pin write
    else if(action == BLK_DPIN_WRITE){
        String pin = op_block["pin"];
        if(Variables.find(op_block["val"])){
            digitalWrite(pin.toInt(), (DWORD)Variables[op_block["val"]]);
        }else{
            String value = op_block["val"];
            digitalWrite(pin.toInt(), value.toInt()); 
        }
    }

    // digital pin read
    else if(action == BLK_DPIN_READ){
        String pin = op_block["pin"];
        String name = op_block["var"];
        Variables[name] = digitalRead(pin.toInt());
    }

    // analog pin write
    else if(action == BLK_APIN_WRITE){
        String pin = op_block["pin"];
        if(pin[0] == 'A'){
            int pin_i = 21 + (int)pin[1] - 0x30;
            if(Variables.find(op_block["val"])){
                analogWrite(pin_i, (int)Variables[op_block["val"]]);
            }else{
                String value = op_block["val"];
                analogWrite(pin_i, value.toInt()); 
            }
        }else{
            status_json[RET_STATUS] = String(1);
        }
    }

    // analog pin read
    else if(action == BLK_APIN_READ){
        String pin = op_block["pin"];
        if(pin[0] == 'A'){
            String name = op_block["var"];
            int pin_i = 21 + (int)pin[1] - 0x30;
            Variables[name] = analogRead(pin_i);
        }else{
            status_json[RET_STATUS] = String(1);
        }
    }

    // serial print
    else if(action == BLK_SERIAL_PRINT){
        JSONVar print_json;
        String text = op_block["text"];
        String name = op_block["var"];
        if(name != ""){
            print_json[RET_PRINT] = String((DWORD)Variables[name]);
        }else{
            print_json[RET_PRINT] = text;
        }
        Serial.println(JSON.stringify(print_json));
    }

    // button read
    else if(action == BLK_BTN_READ){
        String pin_raw = op_block["pin"];
        String name = op_block["var"];
        int pin = 0;
        switch(pin_raw[1]){
            case '1': pin = B1_PIN; break;
            case '2': pin = B2_PIN; break;
            case '3': pin = B3_PIN; break;
        }
        pinMode(pin, INPUT_PULLDOWN);
        Variables[name] = digitalRead(pin);
    }

    // set led
    else if(action == BLK_LED_SET){
        String pin_raw = op_block["pin"];
        String value = op_block["val"];
        int pin = 0;
        switch(pin_raw[1]){
            case '1': pin = L1_PIN; break;
            case '2': pin = L2_PIN; break;
        }
        pinMode(pin, OUTPUT);
        digitalWrite(pin, value.toInt());
    }

    // set servo rotation
    else if(action == BLK_SERVO_WRITE){
        String pin = op_block["pin"];
        String angle = op_block["angle"];

        Servo *servo;
        if(!Servos.find(pin)){
            servo = (Servo*)GlobalMemoryPool.allocate(sizeof(Servo));
            Servos[pin] = reinterpret_cast<DWORD>(servo);
        }else{
            servo = reinterpret_cast<Servo*>(Servos[pin]);
        }
        servo->attach(pin.toInt(), 470, 2500);
        servo->write(angle.toInt());
    }

    else{
        status_json[RET_STATUS] = String(1);
    }

    // print status_json
    Serial.flush();
    Serial.println(JSON.stringify(status_json));
}


// {"action":"set_var","name":"asd","val":5}
// {"action":"get_var","name":"asd"}

// arduino-cli compile ./rudiron.ino --fqbn Rudiron:MDR32F9Qx:buterbrodR916 --port "COM7" --upload --verbose
// arduino-cli monitor -p "COM7" -c 115200