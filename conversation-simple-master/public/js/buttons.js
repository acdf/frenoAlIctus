var ButtonResponse = (function() {
  // Publicly accessible methods defined
  return {
    click: click
  };
  
  function click(text) {
      // <input class="messageCheckbox" type="checkbox" value="3" name="mailId[]">
      // <input class="messageCheckbox" type="checkbox" value="1" name="mailId[]">
      //
  	if(text == "ENVIAR1")
  	{
  	    text="";
  	    var textIncluded = false;
		var inputElements = document.getElementsByClassName('messageCheckbox1');
		for(var i=0; inputElements[i]; ++i){
      		if(inputElements[i].checked) {
                text = text + inputElements[i].value + " , ";
                textIncluded = true;
            }
            inputElements[i].disabled = true;
		}
		if(textIncluded){
		    text = text.substr(0,(text.length - 3)) ;
        }

  	}
      if(text == "ENVIAR2")
      {
          text="";
          var textIncluded = false;
          var inputElements = document.getElementsByClassName('messageCheckbox2');
          for(var i=0; inputElements[i]; ++i){
              if(inputElements[i].checked) {
                  text = text + inputElements[i].value + " , ";
                  textIncluded = true;
              }
              inputElements[i].disabled = true;
          }
          if(textIncluded){
              text = text.substr(0,(text.length - 3)) ;
          }

      }
      if(text == "ENVIAR3")
      {
          text="";
          var textIncluded = false;
          var inputElements = document.getElementsByClassName('messageCheckbox3');
          for(var i=0; inputElements[i]; ++i){
              if(inputElements[i].checked) {
                  text = text + inputElements[i].value + " , ";
                  textIncluded = true;
              }
              inputElements[i].disabled = true;
          }
          if(textIncluded){
              text = text.substr(0,(text.length - 3)) ;
          }

      }
    sendResponse(text);
    disableButtons();
  }

  function disableButtons() {
    // Get all the buttons with name buttonResponse
    var buttons = document.getElementsByName('buttonResponse');
    // All buttons with name buttonResponse are disabled
    for (var buttonIndex in buttons)
    buttons[buttonIndex].disabled = true;
  }

  function sendResponse(response) {
    // Retrieve the context from the previous server response
    var context;
    var latestResponse = Api.getResponsePayload();
    if (latestResponse)
    context = latestResponse.context;
    // Send the user message
    Api.sendRequest(response, context);
  }
}());
