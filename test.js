const axios = require('axios').default;
let categoriesT = [];
async function load(){
    const categories = await axios.get('https://onlinecourse-be.herokuapp.com/category/all');
    return categories;
}
load().then((data)=>console.log(data)).catch((err)=>console.log(err));

