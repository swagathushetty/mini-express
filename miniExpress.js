const http = require('http');


class MiniExpress {
    constructor(){
        this.server = null
        this.routes = []
    }

    addRoute(method,path,handler){
        this.routes.push({
            method:method.toUpperCase(), //get -> GET
            path, // users/:id
            handler,
            pattern: this.pathToRegex(path) //patter example- { regex: /^\/users\/([^\/]+)$/, params: [ 'id' ] }
        })
        
    }

    //convert path pattern to regex
    pathToRegex(path){
        // Escape special regex characters except :
        let pattern = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const paramNames = [];

        //find paraemeters like /:id /:name etc
        pattern = pattern.replace(/:(\w+)/g, (match, paramName) => {
            //here if match is :id , then paramName is id

            paramNames.push(paramName);
            return '([^\\/]+)';  // Match anything except /
        });

        return {
            regex:new RegExp(`^${pattern}$`),
            params:paramNames
        }
    }
    matchRoute(method,url){
        const path = url.split('?')[0]; //remove query string if any

        for(const route of this.routes){
            if(route.method !== method){
                continue
            }
            const match = path.match(route.pattern.regex);
            if(match){
                const params = {}
                route.pattern.params.forEach((paramName,index)=>{
                    params[paramName] = match[index + 1]
                })

                return {handler:route.handler,params}
            }
        }
    }

    handleRequest(req,res){
        const match = this.matchRoute(req.method,req.url);

        if(match){
            req.params = match.params; 
            try{    
                match.handler(req,res)
            }catch(err){
                console.log('[Error',err)
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error\n');
            }
        }else{
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found\n');
        }
    }

    get(path, handler) {
        this.addRoute('GET', path, handler);
    }

    post(path, handler) {
        this.addRoute('POST', path, handler);
    }

    put(path, handler) {
        this.addRoute('PUT', path, handler);
    }

    delete(path, handler) {
        this.addRoute('DELETE', path, handler);
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