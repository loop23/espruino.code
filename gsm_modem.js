var cmd="";
var global_response=0;
var answer="OK";

//Function handles data coming in from Serial.
Serial3.on('data',function (data) {
//  console.log("Partial: " + data);
  if(cmd.indexOf(answer) > 0){
    console.log("Success: " + cmd);
    cmd="";
    global_response=1;
  } else if (cmd.indexOf('ERROR') > 0) {
    console.log("Failed: " + cmd);
    cmd="";
  } else {
    cmd+=data;
  }
});


//Function handles sending AT commands to GSM device.
function Send_Command(command,time,caller){
  var AT =  setInterval(function (f) { Serial3.write(command); }, time);
  var timey = setInterval(function(){
    if(global_response==1){
      clearInterval(AT);
      global_response=0;
      clearInterval(timey);
      caller();
    }
  },300);
}


//Start the GSM Module
function Start_Gsm() {
  answer="OK";
  console.log("GSM Starting..");
//  pinMode(C0,"output");
//  digitalPulse(C0,1,2000);
  Send_Command("AT\r\n",500,function(){GetQuality();
                                       });
}

function getQuality() {
  answer = "OK";
  console.log("Getting quality");
  Send_Command("AT+CSQ\r\n", 500);

}
function Stop_GSM() {
  pinMode(C0,"output");
  digitalPulse(C0,1,2000);
   console.log("GSM Stopped...");
}

//Set the SMS Mode
function Set_SMS_Mode() {
  answer="OK";
  console.log("Setting SMS Mode..");
  Send_Command("AT+CMGF=1\r\n",1000,function(){Set_SMS_Number();});
}


//Set the SMS number to send text message to
function Set_SMS_Number() {
  answer=">";
  console.log("Setting Phone Number.."); 
  Send_Command('AT+CMGS=\"+393458760331\"\r',1000,function(){Send_SMS();});
}


//Send the text message
function Send_SMS(){
  console.log("Send Message");
  answer="OK";
  Send_Command("testing\x1A\r",3000,function(){Stop_GSM();});
}

//Set up the Serial port for the GSM
Serial3.setup(19200);
Start_Gsm();
