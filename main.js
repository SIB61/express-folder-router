import fs from "fs"
import path from "path"
const directoryPath = "api";
const routes = [];
function readDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      readDirectory(filePath);
    } else {
      if(file === "index.js")
      routes.push(dirPath);
    }
  });
}

const createExpressFolderRoutes = (router) => {
  try {
    readDirectory(directoryPath);
    routes.forEach((route)=>{
      import("./"+route+"/index.js").then(({GET,PUT,POST,DELETE,PATCH})=>{
          GET && router?.get(route,GET)
          PUT && router?.put(route,PUT);
          POST && router?.post(route,POST);
          DELETE && router?.delete(route,DELETE);
          PATCH && router?.PATCH(route,PATCH)
      }).catch(err=>{
          console.log(err)
        })
    })
  } catch (err) {
    console.log("error happened", err);
  }
};

createExpressFolderRoutes()
