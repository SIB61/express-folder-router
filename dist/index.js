"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const httpMethods = ["GET", "PUT", "POST", "DELETE", "PATCH"];
function readRecursiveIndexFiles(dirPath, indexPaths = [], isDynamic = false) {
    const files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readRecursiveIndexFiles(filePath, indexPaths, file.startsWith(":"));
        }
        else {
            if (file === "index.js") {
                if (isDynamic) {
                    indexPaths.push(dirPath);
                }
                else {
                    indexPaths.unshift(dirPath);
                }
            }
        }
    });
}
function getIndexFile(route) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.resolve(`${"../../" + route + "/index.js"}`).then(s => __importStar(require(s)));
    });
}
function handleRoute(route, method, handler, router) {
    if (handler.constructor.name === "Function" ||
        handler.constructor.name === "AsyncFunction") {
        router[method.toLowerCase()](route, handler);
    }
    else if (handler.constructor.name === "Array") {
        router[method.toLowerCase()](route, ...handler);
    }
}
exports.default = (router, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (router)
        try {
            const routeDir = options.routeDir || "routes";
            const indexPaths = [];
            readRecursiveIndexFiles(routeDir, indexPaths);
            for (let indexFile of indexPaths) {
                const handlers = yield getIndexFile(indexFile);
                httpMethods.forEach((method) => {
                    if (handlers && handlers[method]) {
                        const apiRoute = indexFile.substring(routeDir.length);
                        handleRoute(apiRoute, method, handlers[method], router);
                    }
                });
            }
        }
        catch (err) {
            console.log("error happened", err);
        }
});
