import { readdirSync, statSync } from "fs";
import { join } from "path";

const HTTP_METHODS = ["GET", "PUT", "POST", "DELETE", "PATCH", "HEAD", "OPTIONS"];

async function getIndexFile(route: string) {
  return await import(process.cwd() + "/" + route + "/index.js");
}

function handleRouting(
  route: string,
  method: string,
  handler: Function | Function[],
  router: any
) {
  if (handler instanceof Function) {
    router[method.toLowerCase()](route, handler);
  } else if (handler instanceof Array<Function>) {
    router[method.toLowerCase()](route, ...handler);
  }
}

function getRouteType (file:string):RouteType {
      let routeType:RouteType = "static";
      if(file==="*"){routeType="catch-all"}
      else if(file.startsWith(":")){routeType="dynamic"}
      return routeType
}

type RouteType = 'dynamic' | 'static' | 'catch-all'

function readIndexFiles(
  dirPath: string,
  indexPaths: string[] = [],
) {
  const files = readdirSync(dirPath);
  files.forEach(function(file) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      readIndexFiles(filePath, indexPaths);
    } else {
      if (file === "index.js") {
          indexPaths.unshift(dirPath);
      }
    }
  });
}

type FolderRouterOptions = {
  routeDir: string;
  extraMethods: Array<string>;
};

export async function configureFolderRouter(
  router: any,
  options: FolderRouterOptions
) {
  if (router)
    try {
      if (options?.extraMethods && options.extraMethods instanceof Array<string>) {
        options.extraMethods.forEach((method) => {
          HTTP_METHODS.push(method.toUpperCase());
        });
      }
      const routeDir = options?.routeDir ?? "routes";
      const indexPaths: string[] = [];
      readIndexFiles(routeDir, indexPaths);
      for (let indexFile of indexPaths) {
        const handlers = await getIndexFile(indexFile);
        HTTP_METHODS.forEach((method) => {
          let handler = handlers
            ? handlers[method] || handlers.default
            : undefined;
          if (handler) {
            const apiRoute = indexFile.substring(routeDir.length);
            handleRouting(
              apiRoute,
              method,
              handler,
              router
            );
          }
        });
      }
    } catch (err) {
      console.log("folder routing exception: ", err);
    }
}
