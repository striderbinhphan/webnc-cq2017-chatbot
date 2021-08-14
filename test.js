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

load()