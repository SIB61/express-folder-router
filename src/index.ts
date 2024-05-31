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

const getPathType = (path) => {
  if (path.startsWith('[...') && path.endsWith(']')) {
    return 'catch-all'
  } else if (path.startsWith('[') && path.endsWith(']')) {
    return 'dynamic'
  } else {
    return 'absolute'
  }
}

function getControllerFilePaths(dirPath: string): string[] {
  const filePaths = readdirSync(dirPath);
  let controllerFilePaths: string[] = []
  filePaths.forEach(async (filePath) => {
    const controllerPath = path.join(dirPath, filePath);
    const isFolder = statSync(controllerPath).isDirectory();
    if (isFolder) {
      controllerFilePaths = controllerFilePaths.concat(getControllerFilePaths(controllerPath))
      return
    }

    console.log(filePath, controllerPath)

    if (
      (controllerPath.charAt(0) === "[" && controllerPath.charAt(controllerPath.length - 4) === "]") ||
      controllerPath.charAt(0) === ":"
    ) {
      controllerFilePaths.push(controllerPath)
    } else {
      controllerFilePaths.unshift(controllerPath)
    }
  });
  return controllerFilePaths;
}

function getApiRoute(url: string): string {
  const [baseurl] = path.basename(url).split(".");
  const dirname = path.dirname(url);
  const apiRoute = baseurl === "index" ? dirname : path.join(dirname, baseurl);
  return apiRoute
    .split(path.sep)
    .map((item) => {
      if (item.startsWith("[") && item.endsWith("]")) {
        return `:${item.substring(1, item.length - 1)}`;
      }
      return item;
    })
    .join(path.posix.sep);
}

type FolderRouterOptions = {
  routeDir?: string;
  extraMethods?: Array<String>;
};

const isValidHandlers = (handlers: any[]) => {
  return handlers.every(handler => typeof handler === 'function')
}

export async function configureFolderRouter(
  router: unknown,
  options: FolderRouterOptions = {}
) {
  const { extraMethods = [], routeDir = "routes" } = options;
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
    httpMethods.forEach((method) => {
      const handler = handlers[method] || handlers.default?.default || handlers.default;
      const apiRoute = getApiRoute(controllerPath.substring(routeDir.length));
      const apiRouteHandlers = [handler].flat();
      if (!isValidHandlers(apiRouteHandlers)) {
        return
      }
      router[method.toLowerCase()](apiRoute, ...apiRouteHandlers);
      console.log(`> ${method} ${apiRoute}`)
    });
  }
}