import fs from "fs";
import path from "path";
const directoryPath = "routes";
const routes = [];

function readDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      readDirectory(filePath);
    } else {
      if (file === "index.js") {
        routes.push(dirPath);
      }
    }
  });
}

function handleRoute(route, method, handler, router) {
  if (handler) {
    if (
      handler.constructor.name === "Function" ||
      handler.constructor.name === "AsyncFunction"
    ) {
      router[method.toLowerCase()]("/"+route, handler);
    } else if(handler.constructor.name === "Array") {
      router[method.toLowerCase()](route, ...handler);
    }
  }
}

export default async (router) => {
  if (router)
    try {
      readDirectory(directoryPath);
      for (let route of routes) {
        const handlers = await import("../../" + route + "/index.js");
        ["GET", "PUT", "POST", "DELETE", "PATCH"].forEach((method) => {
          console.log(method);
          if (handlers && handlers[method]) {
            console.log(handlers)
            handleRoute(route, method, handlers[method], router);
          }
        });
      }
    } catch (err) {
      console.log("error happened", err);
    }
};
