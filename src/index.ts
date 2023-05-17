import { readdirSync, statSync } from "fs";
import { join } from "path";

const REST_METHODS = ["GET", "PUT", "POST", "DELETE", "PATCH"];

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

function readIndexFiles(
  dirPath: string,
  indexPaths: string[] = [],
  isDynamic = false
) {
  const files = readdirSync(dirPath);
  files.forEach(function(file) {
    const filePath = join(dirPath, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      readIndexFiles(filePath, indexPaths, file.startsWith(":"));
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
          REST_METHODS.push(method.toUpperCase());
        });
      }
      const routeDir = options?.routeDir || "routes";
      const indexPaths: string[] = [];
      readIndexFiles(routeDir, indexPaths);
      for (let indexFile of indexPaths) {
        const handlers = await getIndexFile(indexFile);
        REST_METHODS.forEach((method) => {
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
