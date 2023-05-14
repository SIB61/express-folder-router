## express-folder-routing
This is a minimalist package for express to add folder based routing in it.

## Installation
```bash
npm install express-folder-routing
```

## usage
```js
import useFolderRoute from "express-folder-routing"
import express from "express"

const app = express()
useFolderRoute(app,{
    routeDir:"routes" //default directory is route.
})
app.listen(3000,()=>{})
```

your index files in the specified routeDir will be Api endpoint.

## create an api endpoint
```js
// /routes/hello/index.js 
// endpoint: localhost:3000/hello

export function GET(req,res){
  res.send("get hello")
}

export function POST(req,res){
  res.send("post hello")
}

export function PUT(req,res){
  res.send("put hello")
}

export function DELETE(req,res){
  res.send("delete hello")
}
export function PATCH(req,res){
  res.send("delete hello")
}
```

## Use middleware 
```js
export const GET = [authMiddleware,(req,res){
  res.send("get hello")
}]

function authMiddleware = (req,res,next){
    if(\*check authentication*\){
        next()
    }else{
        res.status(401).send()
    }
}
```
