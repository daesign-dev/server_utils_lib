"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestContext {
    constructor() {
        this["null"] = null;
        this["emptyStr"] = "";
    }
    get now() {
        return Date.now();
    }
    get DateNow() {
        return new Date();
    }
}
exports.RequestContext = RequestContext;
//# sourceMappingURL=RequestContext.js.map