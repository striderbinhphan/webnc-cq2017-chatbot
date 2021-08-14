const axios = require('axios');
async function load(){
    const categories = await axios.get('https://webncchatbotbct.herokuapp.com/category/all');
    return categories;
}
load().then((data)=>console.log(data)).catch((err)=>console.log(err));