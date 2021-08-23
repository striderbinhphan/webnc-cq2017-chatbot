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
async function handleMessage(senderPsid, receivedMessage) {
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
    if(receivedMessage.text.includes('timkiem_')&&"timkiem_".length < receivedMessage.text.length) {
      const myArr = receivedMessage.text.split("_");
      const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/courses/query?search=${myArr[myArr.length-1]}`);
      console.log(` data`,res.data);
      if(res.data.result.length!==0){
        response = {
          'attachment': {
            'type': 'template',
            'payload': {
              'template_type': 'generic',
              'elements': res.data.result.map(course=>(
                {
                'title': `${course.course_name}`,
                'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/images/${course.course_image}`,
                'buttons': [
                  {
                    'type': 'postback',
                    'title': 'Xem khóa học',
                    'payload': `course_id_${course.course_id}`,
                  }]
                }))
            }
          }
        }//end response
        console.log("response dta", response);
      }else{
        response = { 'text': 'No search found' };
      }
      //https://bct-onlinecourses-be.herokuapp.com/courses/query?search=
      //const myArr = str.split("_");
      // document.getElementById("demo").innerHTML = myArr[myArr.length-1]; 
      
    }//endif timkiem

    if(receivedMessage.quick_reply){
      // Get the payload for the postback
        let payload = receivedMessage.quick_reply.payload;
        console.log(payload)
        if(payload.includes("category_id_") && "category_id_".length<payload.length){
          const myArr = payload.split("_");
          const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/courses/category/${myArr[myArr.length-1]}`);
          console.log(`category id = ${myArr[myArr.length-1]} data`,res.data);
          response = {
            'attachment': {
              'type': 'template',
              'payload': {
                'template_type': 'generic',
                'elements': res.data.map(course=>(
                  {
                  'title': `${course.course_name}`,
                  'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/images/${course.course_image}`,
                  'buttons': [
                    {
                      'type': 'postback',
                      'title': 'Xem khóa học',
                      'payload': `course_id_${course.course_id}`,
                    }]
                  }))
              }
            }
          }//end response
          console.log("response dta", response);

        }
        



    }
    //endquickreply if


  
  


    // response = {
    //   'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
    // };
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
    const res = await axios.get('https://bct-onlinecourses-be.herokuapp.com/category/all');
    response = {
      "text": "Chọn danh mục:",
      "quick_replies": res.data.map(c=>({
          "content_type":"text",
          "title":`${c.category_name}`,
          "payload":`category_id_${c.category_id}`,
        })
      )
    }
  }
  //show course detail
  if(payload.includes("course_id_")){
    const myArr = payload.split("_");
    const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/courses/${myArr[myArr.length-1]}`);
    const getLecturerRes = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/users/lecturer/${res.data.user_id}`);
    console.log(`courses id = ${myArr[myArr.length-1]} data`,res.data);
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': `${res.data.course_name}
            Price:${res.data.price},SaleOff:${res.data.saleoff}`,
            'subtitle': `${res.data.course_shortdescription}`,
            'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/images/${res.data.course_image}`,
          },
          {
            'title': 'Course description',
            'subtitle': `${res.data.course_description}`,
          },
          {
            'title': `This course has ${res.data.sections.length} sections`,
            'subtitle': 'Tap a button to view this course sections.',
            'buttons': [
              {
                'type': 'postback',
                'title': 'View all sections',
                'payload': `viewsections_course_id_${res.data.course_id}`,
              }
            ],
          },
          {
            'title': `Created by ${getLecturerRes.data.username} is ${getLecturerRes.data.description}`,
            'subtitle': `${getLecturerRes.data.organization}`,
            'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/profile/${getLecturerRes.data.image?getLecturerRes.data.image:"profile.png"}`,
          },
          {
            'title': `Has ${res.data.totalReview} reviews`,
            'subtitle': `with rating ${res.data.averageRating}`,
            'buttons': [
              {
                'type': 'postback',
                'title': 'View feedback',
                'payload': `viewcomments_course_id_${res.data.course_id}`,
              }
            ],
          }]
        }
      }
    };//end response
    console.log("response dta", response);

  }//end if course id view

  //show all sections detail
  if(payload.includes("viewsections_course_id_" )){
    const myArr = payload.split("_");
    //courseId = payload[payload.length-1]
    const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/courses/${myArr[myArr.length-1]}`);
    console.log(`courses id = ${myArr[myArr.length-1]} data`,res.data);
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': `Course content of ${res.data.course_name}`,
            'subtitle': `Has ${res.data.sections.length} sections`,
            'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/images/${res.data.course_image}`,
          },...res.data.sections.map(s=>({
            'title': `This course has ${s.section_title} sections`,
            'subtitle': `Has ${s.videos.length} videos. Tap to see!!!`,
            'buttons': [
              {
                'type': 'postback',
                'title': 'This section videos',
                'payload': `viewvideos_section_id_${s.section_id}`,
              }
            ],
          }))
          ]//end elements
        }
      }
    };//end response
    console.log("response dta", response);

  }//end if viewsection_course_id_

  //show all videos of sectionid detail
  if(payload.includes("viewvideos_section_id_" )){
    const myArr = payload.split("_");
    //sectionId = payload[payload.length-1]
    const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/videos/section/${myArr[myArr.length-1]}`);
    console.log(`viewvideos_section_id_ id = ${payload[payload.length-1]} data`,res.data);
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': res.data.map(v=>({
            'title': `${v.video_title}`,
            'subtitle':`Preview Status:${v.preview_status===1?"True":"False"}`,
            'buttons': [
              {
                'type': 'postback',
                'title': 'View this video',
                'payload': `viewvideo_video_id_${v.video_id}`,
              }
            ],
          }))//end map
        }
      }
    };//end response
    console.log("response dta", response);

  }//end if viewvideo_course_id_

  //show all videos of sectionid detail
  if(payload.includes("viewvideo_video_id_" )){
    const myArr = payload.split("_");
    //videoId = payload[payload.length-1]
    const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/videos/${myArr[myArr.length-1]}`);
    console.log(`viewvideos_section_id_ id = ${myArr[myArr.length-1]} data`,res.data);
    response = {
      "type": "template",
      "payload": {
         "template_type": "media",
         "elements": [
            {
               "media_type": "video",
               "url": `https://bct-onlinecourses-be.herokuapp.com/uploads/videos/${res.data.video_path}`
            }
         ]
      }
    }//end response
    console.log("response dta", response);

  }//end if viewvideo_course_id_
  
  //show all feedback by courseId
  if(payload.includes("viewcomments_course_id_" )){
    const myArr = payload.split("_");
    //courseId = payload[payload.length-1]
    const res = await  axios.get(`https://bct-onlinecourses-be.herokuapp.com/reviews/${myArr[myArr.length-1]}`);
    console.log(`courses id = ${myArr[myArr.length-1]} data`,res.data);
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': res.data.map(r=>({
            'title': `User: ${r.userFullName}`,
            'subtitle': `Feedback: ${r.review_feedback} Rating: ${r.review_rating} `,
            'image_url': `https://bct-onlinecourses-be.herokuapp.com/uploads/profile/${r.userImage?r.userImage:"profile.png"}`,
          }))
        }
      }
    };//end response
    console.log("response dta", response);

  }//end if viewsection_course_id_
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
