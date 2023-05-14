import fs from "fs";
import path from "path";
const httpMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"];

function readRecursiveIndexFiles(dirPath, indexPaths = [], isDynamic) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      readRecursiveIndexFiles(filePath, indexPaths,file.startsWith(":"));
    } else {
      if (file === "index.js") {
        if(isDynamic){
        indexPaths.push(dirPath);
        }else{
        indexPaths.unshift(dirPath);
        }
      }
    }
  });
}

async function getIndexFile(route) {
  return await import("../../" + route + "/index.js");
}

function handleRoute(route, method, handler, router) {
  if (
    handler.constructor.name === "Function" ||
    handler.constructor.name === "AsyncFunction"
  ) {
    router[method.toLowerCase()](route, handler);
  } else if (handler.constructor.name === "Array") {
    router[method.toLowerCase()](route, ...handler);
  }
}

export default async (router, options) => {
  if (router)
    try {
      const routeDir = options.routeDir || "routes";
      const indexPaths = [];
      readRecursiveIndexFiles(routeDir, indexPaths);
      for (let indexFile of indexPaths) {
        const handlers = await getIndexFile(indexFile);
        httpMethods.forEach((method) => {
          if (handlers && handlers[method]) {
            const apiRoute = indexFile.substring(routeDir.length);
            handleRoute(apiRoute, method, handlers[method], router);
          }
        });
      }
    } catch (err) {
      console.log("error happened", err);
    }
};
