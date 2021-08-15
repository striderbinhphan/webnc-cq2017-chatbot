/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `yarn install`
 * 3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
 */

'use strict';

// Use dotenv to read .env vars into Node
require('dotenv').config();

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  axios = require('axios'),
  { urlencoded, json } = require('body-parser'),
  app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get('/', function (_req, res) {
  res.send('Hello !!');
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post('/webhook', (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } 
      // else if (webhookEvent.quick_reply) {
      //   handleQuickReply(sendPsid, webhookEvent.quick_reply);
      // }
      else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback); 
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {

    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handles messages events
function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send
    if(receivedMessage.text === 'hello') {
        response = {
          'attachment': {
            'type': 'template',
            'payload': {
              'template_type': 'generic',
              'elements': [{
                'title': 'Chọn tính năng',
                'subtitle': 'Tap a button to answer.',
                'buttons': [
                  {
                    'type': 'postback',
                    'title': 'Tìm kiếm khóa học',
                    'payload': 'timkiem',
                  },
                  {
                    'type': 'postback',
                    'title': 'Xem danh mục khóa học',
                    'payload': 'Xem danh mục khóa học',
                  }
                ],
              }]
            }
          }
        };   
    }
    // Get the payload for the postback
  let payload = receivedMessage.quick_reply.payload;

  if (payload === 'mobilecourses') {
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': 'course1',
             'image_url': "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQqzR8_zcLO54mYQnQWtWuvFIztdFs75A_sg&usqp=CAU",
            'buttons': [
              {
                'type': 'postback',
                'title': 'xem chi tiết',
                'payload': 'courseId1',
              }
            ],
          },
          {
            'title': 'course 2',
             'image_url': "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQqzR8_zcLO54mYQnQWtWuvFIztdFs75A_sg&usqp=CAU",
            'buttons': [
              {
                'type': 'postback',
                'title': 'xem chi tiết!',

                'payload': 'courseId2',
              }
            ],
          },
          {
            'title': 'course 3',
            'image_url': "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQqzR8_zcLO54mYQnQWtWuvFIztdFs75A_sg&usqp=CAU",
            'buttons': [
              {
                'type': 'postback',
                'title': 'xem chi tiết!',

                'payload': 'courseId2',
              }
            ],
          }
        ]
        }
      }
    };
  }
  if (payload === 'webcourses') {
    response = {
      "attachments": [
        {
          "type": "template",
          "payload": {
            "product":{
             "elements":[ // multiple elements for Hscroll
               {
                 "id":"2",
                 "retailer_id":"<EXTERNAL_ID>",
                //  "image_url":"https://fb.cdn.com/sdsd",
                 "title":"Some product title",
                 "subtitle": "$40",
               },
               {
                "id":"1",
                "retailer_id":"<EXTERNAL_ID>",
                // "image_url":"https://fb.cdn.com/sdsd",
                "title":"Some product title",
                "subtitle": "$40",
               }
             ]
          }
        }
      }]
    }
  }


    // response = {
    //   'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
    // };
  } else if (receivedMessage.attachments) {

    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': 'Is this the right picture?',
            'subtitle': 'Tap a button to answer.',
            'image_url': attachmentUrl,
            'buttons': [
              {
                'type': 'postback',
                'title': 'Yes!',
                'payload': 'yes',
              },
              {
                'type': 'postback',
                'title': 'No!',
                'payload': 'no',
              }
            ],
          }]
        }
      }
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
async function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload

  if (payload === 'timkiem') {
    response = { 'text' : 'Vui lòng nhập theo cú pháp: timkiem_tên khóa học:' };  
  }

  if (payload === 'Xem danh mục khóa học') {
    const res = await axios.get('https://onlinecourse-be.herokuapp.com/category/all');
    response = {
      "text": "Chọn danh mục:",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Mobile courses",
          "payload":"mobilecourses",
        },{
          "content_type":"text",
          "title":"Web courses",
          "payload":"webcourses",
        }
      ]
    }
  }

  if (payload === '') {
    response = { 'text': 'Thanks!' };
  } else if (payload === 'no') {
    response = { 'text': 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(senderPsid, response);
}


// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {

  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construct the message body
  let requestBody = {
    'recipient': {
      'id': senderPsid
    },
    'message': JSON.stringify(response)
  };

  // Send the HTTP request to the Messenger Platform
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  }, (err, _res, _body) => {
    if (!err) {
      console.log('Message sent!');
      console.log (requestBody);
    } else {
      console.error('Unable to send message:' + err);
    }
  });
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
