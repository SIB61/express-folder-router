import * as fs from "fs";
import * as path from "path";
const httpMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"];

function readRecursiveIndexFiles(dirPath: string, indexPaths: string[] = [], isDynamic = false) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function(file) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      readRecursiveIndexFiles(filePath, indexPaths, file.startsWith(":"));
    } else {
      if (file === "index.js") {
        if (isDynamic) {
          indexPaths.push(dirPath);
        } else {
          indexPaths.unshift(dirPath);
        }
      }
    }
  });
}

async function getIndexFile(route: string) {
  return await import("../../../../" + route + "/index.js");
}

function handleRoute(route: string, method: string, handler: Function | Function[], router) {
  if (handler instanceof Function) {
    router[method.toLowerCase()](route, handler);
  } else if (handler instanceof Array<Function>) {
    router[method.toLowerCase()](route, ...handler);
  }
}

type FolderRouterOptions = {
  routeDir: string
}
export async function configureFolderRouter(router, options: FolderRouterOptions) {
  if (router)
    try {
      const routeDir = options.routeDir || "routes";
      const indexPaths: string[] = [];
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
      console.log("folder routing exception: ", err);
    }
};
