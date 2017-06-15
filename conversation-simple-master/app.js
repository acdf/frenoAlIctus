/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var cloudant = require('./cloudant.js'); // acdf
var first = true;

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-10-21',
  version: 'v1'
});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    // ask for both array positions as the last time LISTKEYWORD is saved in the second position
    if (data.output.text[0]=="\/\/LISTKEYWORD" || data.output.text[1]=="\/\/LISTKEYWORD") {
        cloudant.logs.insert(data.context);
        
        if (data.context.buttons_list.length == 0){
            data.output.text = "Muchas gracias por participar en esta encuesta, tus respuestas nos serán de mucha utilidad y entre todos conseguiremos mejorar la situación del ictus en España. Este proyecto ha sido desarrollado con la colaboración de la <a target=\"_blank\" href=\"http://www.sen.es/\">Sociedad Española de Neurología(SEN)</a>, la asociación <a target=\"_blank\" href=\"http://www.frenoalictus.org/\">Freno al Ictus</a> e <a href=\"#\" onclick=\"window.open('https://www.ibm.com/cloud-computing/bluemix/es'); window.open('http://www-05.ibm.com/es/rsc/');\">IBM - Responsabilidad Social Corporativa</a>.Te dejo información útil sobre el ictus, ¡no olvides compartirla con tu entorno!<br/><br/><a target=\"_blank\" href=\"flyer.jpg\"><img src=\"flyer.jpg\" height=\"70%\" width=\"100%\"/></a>";
            return res.json(updateMessage(payload, data));
        }

        else if(data.context.buttons_list.length == 1){
              if (data.context.buttons_list[0] == "cm") {
                  payload.input.text ="controles médicos";
              }
              else if (data.context.buttons_list[0] == "h") {
                  payload.input.text ="hábitos de vida";
              }
              else if (data.context.buttons_list[0] == "pc") {
                  payload.input.text ="problemas de circulación";
              }
              else if (data.context.buttons_list[0] == "c") {
                  payload.input.text ="conocimiento sobre el ictus";
              }
              data.context.buttons_list.splice(0, 1);
              payload.context = data.context;
              conversation.message(payload, function(err2, data2) {
                  if (err2) {
                      return res.status(err2.code || 500).json(err2);
                  }
                  data2.output.text = "Ahora hablaremos de " + payload.input.text + ". " + data2.output.text;
                  return res.json(updateMessage(payload, data2));
              });
        }

        else {
              data.output.text = "Ahora de que quieres hablar? <br/> ";
              for (var i = 0; i < data.context.buttons_list.length; i++) {
                  if (data.context.buttons_list[i] == "cm") {
                      data.output.text = data.output.text + "<button name='buttonResponse' onclick='ButtonResponse.click(\"controles médicos\")'>Controles médicos</button>"
                  }
                  else if (data.context.buttons_list[i] == "h") {
                      data.output.text = data.output.text + "<button name='buttonResponse' onclick='ButtonResponse.click(\"hábitos de vida\")'>Hábitos de vida</button>"
                  }
                  else if (data.context.buttons_list[i] == "pc") {
                      data.output.text = data.output.text + "<button name='buttonResponse' onclick='ButtonResponse.click(\"problemas de circulación\")'>Problemas de circulación</button>"
                  }
                  else if (data.context.buttons_list[i] == "c") {
                      data.output.text = data.output.text + "<button name='buttonResponse' onclick='ButtonResponse.click(\"conocimiento sobre el ictus\")'>Conocimiento sobre el Ictus</button>"
                  }
              }
              return res.json(updateMessage(payload, data));
        }
    }

    else{
        return res.json(updateMessage(payload, data));
    }

  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {

  if (input.input.text == "controles médicos"){
        var index = response.context.buttons_list.indexOf("cm");
        if (index > -1) {
            response.context.buttons_list.splice(index, 1);
        }
        //console.log('elimino buttons_list = ' + response.context.buttons_list);
    }
    if (input.input.text == "hábitos de vida"){
        var index = response.context.buttons_list.indexOf("h");
        if (index > -1) {
            response.context.buttons_list.splice(index, 1);
        }
        //console.log('elimino buttons_list = ' + response.context.buttons_list);
    }
    if (input.input.text == "problemas de circulación"){
        var index = response.context.buttons_list.indexOf("pc");
        if (index > -1) {
            response.context.buttons_list.splice(index, 1);
        }
        //console.log('elimino buttons_list = ' + response.context.buttons_list);
    }
    if (input.input.text == "conocimiento sobre el ictus"){
        var index = response.context.buttons_list.indexOf("c");
        if (index > -1) {
            response.context.buttons_list.splice(index, 1);
        }
        //console.log('elimino buttons_list = ' + response.context.buttons_list);
    }
  if (!response.output) {
    response.output = {};
    response.output.text = "";
    return response;
  }
  else {
    return response;
  }
}

module.exports = app;
