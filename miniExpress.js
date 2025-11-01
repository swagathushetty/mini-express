const http = require('http');


class MiniExpress {
    constructor(){
        this.server = null
    }

    handleRequest(req,res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello from MiniExpres!\n');
    }

    listen(port,callback){
        this.server = http.createServer((req,res)=>{
            this.handleRequest(req,res)
        })

        this.server.listen(port,()=>{
            console.log(`MiniExpres server is listening on port ${port}`);
            if(callback) callback()
        })

        return this.server
    }
}

module.exports = MiniExpress;