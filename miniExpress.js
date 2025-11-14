const http = require('http');
const url = require('url');


class MiniExpress {
    constructor(){
        this.server = null

        //why array ? ordering. the API which matches first handles it first
        // thats why 404 route(if handled) will sit at the bottom and not top
        this.routes = []
        this.middleware = []
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
        req = this.enhanceRequest(req);
        res = this.enhanceResponse(res);

        const match = this.matchRoute(req.method,req.url);

        if (match) {
            req.params = match.params;  
            this.runMiddleware(req, res, match.handler);
        } else {
            this.runMiddleware(req, res, (req, res) => {
                res.status(404).json({ error: 'Not Found' });
            });
        }
    }

    enhanceRequest(req) {
        // Parse URL
        const parsedUrl = url.parse(req.url, true);
        req.path = parsedUrl.pathname;
        req.query = parsedUrl.query;
        req.params = {};

        return req;
    } 

    enhanceResponse(res) {

        res.status = function(code) {
            res.statusCode = code;
            return res;
        };

        res.json = function(obj) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
        return res;
        };

        res.send = function(body) {
            if (typeof body === 'object') {
                return res.json(body);
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(body);
            return res;
        };

        return res;
    }

    use(path,handler){
        if(typeof path == 'function'){
            console.log('Middleware registered for all paths')
            this.middleware.push({
                path:'/',
                handler:path
            })
        }else{
            this.middleware.push({
                path,
                handler
            })
        }
    }

    runMiddleware(req,res,finalHandler){
        const middlewareStack = []
        const requestPath = req.url.split('?')[0];
        
        //this will also add the global middlwares eg- app.use(performAuth())
        //since for global middlewares we add a path as '/' as default
        this.middleware.forEach(mw=>{
            
            if(
                requestPath.startsWith(mw.path) 
                && mw.handler.length !== 4 // Skip error handlers (4 parameters) - they only run on errors
            ){
                middlewareStack.push(mw.handler) 
            }
        })

        // the actual route logic needs to run at the end
        middlewareStack.push(finalHandler)
        let currentIndex = 0;

        // the currentIndex and middwareStack is captured in closure
        const next = (err) =>{
            if(err){
                this.handleError(err,req,res)
                return
            }

            const currentMiddleware = middlewareStack[currentIndex]
            currentIndex++
            if(currentMiddleware){
                try{
                    currentMiddleware(req,res,next)
                }catch(err){
                    next(err)
                }
            }
        }

        next()
    }

    handleError(err, req, res) {
        // Look for error handling middleware
        // Error handlers have 4 parameters: (err, req, res, next)
        const errorHandler = this.middleware.find(
            mw => mw.handler.length === 4
        );
        console.log('error handler', errorHandler)
        if(errorHandler) {
            try {
                errorHandler.handler(err, req, res, () => {});
            } catch (e) {
                this.sendDefaultError(res, err);
            }
        }else {
            this.sendDefaultError(res, err);
        }
    }

    sendDefaultError(res, err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${err.message}`);
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