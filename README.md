## express-folder-routing
This is a minimalist package for express to add folder based routing in it.

## Installation
```bash
npm install express-folder-router
```

## usage
```js
import express from "express"
import {configureFolderRouter} from "express-folder-router"

const app = express()

// the second parameter is optional
configureFolderRouter(app, {
  routeDir: "routes", // specify the root route directory. default is "routes" directory . nested directory like src/routes can be used.
  extraMethods:["WS"], // specify if you have any extra methods . WS for express-ws.
});

app.listen(3000, () => {
  console.log("listening to port 3000");
});
```

your index files in the specified routeDir will be Api endpoint.

## create an api endpoint
```js
// src/routes/hello/index.js 
// endpoint: localhost:3000/hello

export function GET(req,res){
  res.send("this is a get request")
}

export function DELETE(req,res){
  res.send("this is a delete request")
}

export function POST(req,res){
  res.send("this is a post request")
}
```
### alternatively export a default function that will receive all requests except the ones that you export as a named function.

```js
// src/routes/hello/index.js 
// endpoint: localhost:3000/hello

export function GET(req,res){
  res.send("this is a get request")
}

export default function(req,res){
  res.send("this is a catch all request methods except the GET method")
}
```

## Use middleware 
```js
export const GET = [authMiddleware,(req,res)=>{
  res.send("get hello")
}]

function authMiddleware(req,res,next){
    if(\*check authentication*\){
        next()
    }else{
        res.status(401).json({message:"unauthenticated"})
    }
}
```
### make a dynamic route by simply naming the folder as ":dynamicName" . then access the dynamicName param as req.params.dynamicName;
### make a catch-all route  by simply naming the folder as * ;

