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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.OpenAPIGenerator = exports.APIRouteScanner = exports.createSwaggerHandler = void 0;
var handler_1 = require("./handler");
Object.defineProperty(exports, "createSwaggerHandler", { enumerable: true, get: function () { return handler_1.createSwaggerHandler; } });
var scanner_1 = require("./scanner");
Object.defineProperty(exports, "APIRouteScanner", { enumerable: true, get: function () { return scanner_1.APIRouteScanner; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "OpenAPIGenerator", { enumerable: true, get: function () { return generator_1.OpenAPIGenerator; } });
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
var handler_2 = require("./handler");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return handler_2.createSwaggerHandler; } });
//# sourceMappingURL=index.js.map