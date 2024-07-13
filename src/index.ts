import { readdirSync, statSync } from "fs";
import path from "path";
const currentWorkingDirectory = process.cwd()

const HTTP_METHODS = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "PATCH",
];

const getFileNameWithoutExt = (nameWithExt: string) => {
  return nameWithExt.replace(/\.[^/.]+$/, "")
}

type PathType = 'dynamic' | 'catch-all' | 'static'

const getRouteType = (path: string): PathType => {
  if (path.startsWith('[...') && path.endsWith(']')) return 'catch-all'
  if (path.startsWith('[') && path.endsWith(']')) return 'dynamic'
  if (path == '*') return 'catch-all'
  return 'static'
}

const getRouteString = (path: string): string => {
  const pathType = getRouteType(path)
  if (pathType == 'catch-all') return '*'
  if (pathType == 'dynamic') return `:${path.slice(1, -1)}`;
  return path
}


function getControllerFilePaths(dirPath: string): string[] {
  const docs = readdirSync(dirPath);
  let controllerFilePaths: string[] = []
  docs.forEach(async (doc) => {
    const docPath = path.join(dirPath, doc);
    const isFolder = statSync(docPath).isDirectory();
    if (isFolder) {
      controllerFilePaths = getControllerFilePaths(docPath).concat(controllerFilePaths)
      return
    }

    if (getRouteType(getFileNameWithoutExt(doc)) == 'dynamic') {
      controllerFilePaths.push(docPath)
      return
    }

    controllerFilePaths.unshift(docPath)
  });

  return controllerFilePaths;
}

function getApiRoute(url: string): string {
  const baseurl = getFileNameWithoutExt(path.basename(url))
  const dirname = path.dirname(url);
  const apiRoute = baseurl === "index" ? dirname : path.join(dirname, baseurl);
  return apiRoute
    .split(path.sep)
    .map(getRouteString)
    .join(path.posix.sep);
}

type FolderRouterOptions = {
  routeDir?: string;
  extraMethods?: Array<String>;
  log?: boolean,
};

const isValidHandlers = (handlers: any[]) => {
  return handlers.every(handler => typeof handler === 'function')
}

export async function configureFolderRouter(
  router: unknown,
  options: FolderRouterOptions = {}
) {
  const { extraMethods = [], routeDir = "routes", log = true } = options;
  if (!router) {
    return;
  }
  const httpMethods = [...HTTP_METHODS, ...extraMethods.map(extraMethod => extraMethod.toUpperCase())]
  const controllerPaths = getControllerFilePaths(routeDir!);

  for (let controllerPath of controllerPaths) {
    const importPath = path.sep === path.posix.sep
      ? path.join(currentWorkingDirectory, controllerPath)
      : "file://" + path.join(currentWorkingDirectory, controllerPath);
    const handlers = await import(importPath);
    const apiRoute = getApiRoute(controllerPath.substring(routeDir.length));

    httpMethods.forEach((method) => {
      const handler = handlers[method] || handlers.default?.default || handlers.default;
      const apiRouteHandlers = [handler].flat();
      if (!isValidHandlers(apiRouteHandlers)) {
        return
      }
      router[method.toLowerCase()](apiRoute, ...apiRouteHandlers);
      if (log) {
        console.log(`> ${method} ${apiRoute}`)
      }
    });
  }
}