## express-folder-routing

This is a minimalist package for express to add folder based routing in it.

## Installation

```bash
npm install express-folder-router
```

## usage

```js
import express from "express";
import { configureFolderRouter } from "express-folder-router";

const app = express();
configureFolderRouter(app);

app.listen(3000, () => {
  console.log("listening to port 3000");
});
```

The default directory for our api routes is 'routes'. If we want to change the default directory name or path we can pass a second optional param:

```js
configureFolderRouter(app, {
  routeDir: "src/routes",
});
```

If we want to use any extra methods like head or ws etc. we can pass another option as below:

```js
configureFolderRouter(app, {
  extraMethods: ["head", "ws"],
});
```

We can turn off the api route logs by:

```js
configureFolderRouter(app, {
  log: false,
});
```

## create an api endpoint

```js
// routes/hello/index.js or routes/hello.js
// endpoint: localhost:3000/hello

export const GET = (req, res) => {
  res.send("this is a get request");
};

export const POST = (req, res) => {
  res.send("this is a post request");
};
```

## alternatively export a default function that will receive all requests except the ones that you export as a named function.

```js
export const GET = (req, res) => {
  res.send("This is a get request");
};

// this function will catch all the http methods except GET
export default function (req, res) {
  res.send("Success");
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

###### We can make a dynamic route by simply naming the file as "[dynamicName].js" or ":dynamicName.js".

###### We can make a catch-all route by simply naming the file as [...name].js or \*.js.

![alt dashboard](https://github.com/SIB61/express-folder-router/blob/main/imgs/example.png)
