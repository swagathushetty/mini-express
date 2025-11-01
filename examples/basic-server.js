const MiniExpress = require('../miniExpress');


const app = new MiniExpress();

app.listen(3000,()=>{
    console.log('Server is up and running on http://localhost:3000');
})