"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CtxInterpretor_1 = require("../CtxInterpretor");
const HttpAbstractService_1 = require("./HttpAbstractService");
class HttpServiceBase extends HttpAbstractService_1.HttpAbstractService {
    constructor(conf) {
        super(conf);
        this.globalCtxInt = new CtxInterpretor_1.CtxInterpretor(process.env);
        this.deleteMiddleware = (config) => {
            config = this.globalCtxInt.updateEnv(config, true);
            return (req, res, next) => {
                var localCtxInt = new CtxInterpretor_1.CtxInterpretor(req.ctx);
                localCtxInt.startPatern = "$ctx.";
                var localConfig = localCtxInt.updateEnv(config, true);
                this.delete(localConfig.params.id, localConfig.headers)
                    .then((data) => {
                    req.ctx[localConfig.output] = data;
                    next();
                }).catch((err) => {
                    next(err);
                });
            };
        };
        this.getMiddleware = (config) => {
            config = this.globalCtxInt.updateEnv(config, true);
            return (req, res, next) => {
                var localCtxInt = new CtxInterpretor_1.CtxInterpretor(req.ctx);
                localCtxInt.startPatern = "$ctx.";
                var localConfig = localCtxInt.updateEnv(config, true);
                this.get(localConfig.params.query, localConfig.headers)
                    .then((data) => {
                    req.ctx[localConfig.output] = data;
                    next();
                }).catch((err) => {
                    next(err);
                });
            };
        };
        this.patchMiddleware = (config) => {
            config = this.globalCtxInt.updateEnv(config, true);
            return (req, res, next) => {
                var localCtxInt = new CtxInterpretor_1.CtxInterpretor(req.ctx);
                localCtxInt.startPatern = "$ctx.";
                var localConfig = localCtxInt.updateEnv(config, true);
                this.patch(localConfig.body, localConfig.headers, localConfig.params.query)
                    .then((data) => {
                    req.ctx[localConfig.output] = data;
                    next();
                }).catch((err) => {
                    next(err);
                });
            };
        };
        this.postMiddleware = (config) => {
            config = this.globalCtxInt.updateEnv(config, true);
            return (req, res, next) => {
                var localCtxInt = new CtxInterpretor_1.CtxInterpretor(req.ctx);
                localCtxInt.startPatern = "$ctx.";
                var localConfig = localCtxInt.updateEnv(config, true);
                // console.log(JSON.stringify(localConfig))
                this.post(localConfig.body, localConfig.headers, localConfig.params.query)
                    .then((data) => {
                    req.ctx[localConfig.output] = data;
                    // console.log(JSON.stringify(data)) ;
                    next();
                }).catch((err) => {
                    next(err);
                });
            };
        };
        this.putMiddleware = (config) => {
            config = this.globalCtxInt.updateEnv(config, true);
            return (req, res, next) => {
                var localCtxInt = new CtxInterpretor_1.CtxInterpretor(req.ctx);
                localCtxInt.startPatern = "$ctx.";
                var localConfig = localCtxInt.updateEnv(config, true);
                this.put(localConfig.body, localConfig.headers, localConfig.params.query)
                    .then((data) => {
                    req.ctx[localConfig.output] = data;
                    next();
                }).catch((err) => {
                    next(err);
                });
            };
        };
        this.url = conf.url;
    }
    delete(id, headers = {}) {
        return super.baseDelete(this.url + id, headers);
    }
    get(query = '*', headers = {}) {
        return super.baseGet(this.url + query, headers);
    }
    patch(body, headers = {}, query = '') {
        return super.basePatch(this.url + query, body, headers);
    }
    post(body, headers = {}, query = '') {
        return super.basePost(this.url + query, body, headers);
    }
    put(body, headers = {}, query = '') {
        return super.basePut(this.url + query, body, headers);
    }
}
exports.HttpServiceBase = HttpServiceBase;
//# sourceMappingURL=HttpServiceBase.js.map