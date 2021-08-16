const axios = require('axios').default;
let categoriesT = [];
async function load(){
    const res = await axios.get('https://onlinecourse-be.herokuapp.com/category/all');
    
    if(res.data){
        d = res.data.map(c=>({ 
            'type': 'postback',
            'title': `${c.category_name}`,
            'payload': `${c.category_name}`,
          }));
          console.log(d)    ;
    }

}

// load()

async function load2(){
    const res = await  axios.get(`https://onlinecourse-be.herokuapp.com/courses/category/1`);
      response = {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'generic',
            'elements': res.data.map(course=>(
              {
              'title': `${course.course_name}`,
              'image_url': `${course.course_image}`,
              'buttons': [
                {
                  'type': 'postback',
                  'title': 'xem chi tiết',
                  'payload': `${course.course_name}`,
                }]
              }))
          }
       }
      }
      console.log(res.data);
    console.log(response.attachment.payload.elements[0].buttons)

}
load2()