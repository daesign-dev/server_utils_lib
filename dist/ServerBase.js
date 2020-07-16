"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const promBundle = require("express-prom-bundle");
const fs = require("fs-extra");
const _ = require("lodash");
const jose = require("node-jose");
const request = require("request-promise-native");
const Util = require("util");
const ConfLoader_1 = require("./ConfLoader");
const RequestContext_1 = require("./RequestContext");
const UtilsSecu_1 = require("./UtilsSecu");
class ServerBase {
    constructor() {
        this.metrics = promBundle({
            includeMethod: true,
            includePath: true
        });
        this.headers = [
            ["Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE"],
            ["Access-Control-Allow-Origin", "*"],
            ["Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, idtoken, JWT, jwt, keydate, keyDate , key"],
            ["Cache-Control", "no-cache, no-store, must-revalidate"],
            ["Pragma", "no-cache"],
            ["Expires", "0"]
        ];
        this.currentApp = {};
        this.init().then(() => {
            this.app.use((err, req, res, next) => {
                let obj = this.toErrRes(err);
                res.send(obj);
            });
            this.startHttpServer();
        }).catch((err) => {
            console.log(err);
        });
        process.on('message', this.parentProcessHandler);
    }
    get parentProcessHandler() {
        return (msg) => {
            console.log("parentMessage ", msg);
            switch (msg) {
                case "reloadConf":
                    this.reloadConfPromise()
                        .then((conf) => {
                        this.currentApp.conf = conf;
                    }).catch((err) => {
                        console.log(err);
                    });
                    break;
            }
        };
    }
    sendToParentProcess(msg) {
        process.send(msg);
    }
    startHttpServer() {
        this.server = this.app.listen(this.currentApp.conf.port, () => {
            console.log('Server listen on port ' + this.currentApp.conf.port);
        });
        this.currentApp.server = this.server;
    }
    init() {
        let prom = this.loadConfPromise().then((conf) => {
            this.currentApp.conf = conf;
            if (this.currentApp.conf.debug) {
                console.log(this.currentApp);
            }
            this.app = express();
            console.log("start app");
            this.currentApp.express = this.app;
            this.currentApp.toErrRes = this.toErrRes;
            this.currentApp.toJsonRes = this.toJsonRes;
            this.secu = new UtilsSecu_1.UtilsSecu(this.currentApp);
            this.currentApp.metrics = this.metrics;
            this.app.use(this.metrics);
            this.currentApp.secu = this.secu;
            this.app.use((req, res, next) => {
                this.headers.forEach((data) => {
                    res.header(data[0], data[1]);
                });
                next();
            })
                .use((req, res, next) => {
                if (this.currentApp.conf.debug) {
                    console.log(req.method + "," + req.url);
                }
                next();
            })
                .use(this.addCtx, this.secu.chekInternalMidelWare, this.checkJWT);
            return this.currentApp;
        }).then(() => {
            return this.loadDepConfPromise();
        }).then(data => {
            this.app.use(this.hasRight)
                .get('/', (req, res) => {
                res.send({ online: true });
            })
                .get('/reloadConf', this.reloadConf);
        });
        return prom;
    }
    loadConfPromise() {
        return ConfLoader_1.ConfLoader.getConf();
    }
    loadDepConfPromise() {
        if (this.currentApp.conf['licence_well-known'] && this.currentApp.conf['licence_well-known'] != "") {
            let opt = {
                url: this.currentApp.conf['licence_well-known'],
                json: true
            };
            return Promise.resolve(request.get(opt))
                .then((data) => {
                if (data.code == 500) {
                    throw new Error("licence_well-known " + data.message);
                }
                else {
                    return data;
                }
            }).catch(err => {
                let val = fs.readJSONSync("./confs/dep/" + this.currentApp.conf['licence_well-known'].replace(/\//gi, "_") + ".json");
                return val;
            }).then((conf) => {
                fs.ensureDirSync("./confs/dep/");
                fs.writeJSONSync("./confs/dep/" + this.currentApp.conf['licence_well-known'].replace(/\//gi, "_") + ".json", conf);
                let opt2 = {
                    url: conf.jwks_uri,
                    json: true
                };
                return request.get(opt2)
                    .then((data) => {
                    if (data.code == 500) {
                        throw new Error("jwk " + data.message);
                    }
                    else {
                        return data;
                    }
                }).catch(err => {
                    var valJwk = fs.readJSONSync("./confs/dep/" + conf.jwks_uri.replace(/\//gi, "_") + ".json");
                    return valJwk;
                }).then((objKey) => {
                    fs.ensureDirSync("./confs/dep/");
                    fs.writeJSONSync("./confs/dep/" + conf.jwks_uri.replace(/\//gi, "_") + ".json", objKey);
                    return jose.JWK.asKeyStore(objKey).then((keyStore) => {
                        this.currentApp.licence_keyStore = keyStore;
                        return this.currentApp;
                    });
                });
            });
        }
        else {
            return Promise.resolve(this.currentApp);
        }
    }
    reloadConfPromise() {
        return ConfLoader_1.ConfLoader.getConf().then((conf) => {
            this.currentApp.conf = conf;
        }).then(() => {
            return this.loadDepConfPromise();
        });
    }
    get reloadConf() {
        return (req, res) => {
            this.reloadConfPromise()
                .then((conf) => {
                // 	this.currentApp.conf = conf ;
                res.send({ code: 200 });
            }).catch((err) => {
                res.send(this.toErrRes(err));
            });
        };
    }
    get toErrRes() {
        return (err, code = 500) => {
            if (Util.isString(err)) {
                err = { message: err };
            }
            let rep = {
                code: code,
                message: err.message,
                name: err.name,
                stack: undefined
            };
            if (this.currentApp.conf.debug) {
                rep.stack = err.stack;
            }
            console.log(JSON.stringify(err));
            return rep;
        };
    }
    ;
    get toJsonRes() {
        return (objs, meta = null) => {
            if (!Util.isArray(objs)) {
                objs = [objs];
            }
            ;
            if (!meta) {
                meta = {};
            }
            ;
            return {
                code: 200,
                meta: meta,
                response: objs
            };
        };
    }
    ;
    get addCtx() {
        return (req, res, next) => {
            if (!req.ctx) {
                req.ctx = new RequestContext_1.RequestContext();
            }
            next();
        };
    }
    get checkJWT() {
        return (req, res, next) => {
            let token = req.header('JWT');
            if (token && this.currentApp.licence_keyStore) {
                jose.JWS.createVerify(this.currentApp.licence_keyStore).verify(token)
                    .then(function (result) {
                    var payload = JSON.parse(result.payload.toString());
                    let myDate = (Date.now()) / 1000;
                    if (payload.exp < myDate) {
                        console.log("token is expired", req.ctx.user);
                        next("token is expired");
                    }
                    else if (payload.nbf > myDate) {
                        console.log("nbf token is not valid", req.ctx.user);
                        next("nbf token is not valid");
                    }
                    else {
                        req.ctx.user = payload;
                        next();
                    }
                }).catch(function (err) {
                    next(err);
                });
            }
            else {
                next();
            }
        };
    }
    get hasRight() {
        return (req, res, next) => {
            req.ctx.roles = [];
            var confSecu;
            if (req.ctx.internalCallValid) {
            }
            else if (req.ctx.user) {
                req.ctx.roles = req.ctx.user.role;
                if (this.currentApp.conf && this.currentApp.conf.configurations && this.currentApp.conf.configurations[req.ctx.user.appId]) {
                    confSecu = this.currentApp.conf.configurations[req.ctx.user.appId].httAccess["_$" + req.method.toLowerCase()];
                }
            }
            req.ctx.roles.push("*");
            // console.log("confSecu" , confSecu , this.currentApp.conf ,  )
            if ((!confSecu) && this.currentApp.conf && this.currentApp.conf.publicAccess) {
                if (this.currentApp.conf.debug) {
                    console.log("find public access " + "_$" + req.method.toLowerCase());
                }
                confSecu = this.currentApp.conf.publicAccess["_$" + req.method.toLowerCase()];
            }
            // console.log("confSecu" , confSecu )
            if (req.ctx.internalCallValid || req.method.toLowerCase() == "options") {
                next();
            }
            else {
                let path = req.originalUrl;
                if (confSecu) {
                    let access = confSecu.find((val) => {
                        return path.indexOf(val.route) == 0;
                    });
                    if (access && _.intersection(access.role, req.ctx.roles).length > 0) {
                        next();
                    }
                    else {
                        if (this.currentApp.conf.debug) {
                            console.log("unautorized ", confSecu, access, path, req.ctx.roles);
                        }
                        next("unautorized");
                    }
                }
                else {
                    if (this.currentApp.conf.debug) {
                        console.log("unautorized, no conf match", confSecu, path, req.ctx.roles);
                    }
                    next("unautorized");
                }
            }
        };
    }
}
exports.ServerBase = ServerBase;
//# sourceMappingURL=ServerBase.js.map