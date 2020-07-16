/// <reference types="node" />
import * as express from 'express';
import * as http from 'http';
import { IApplicationConfiguration } from './IApplicationConfiguration';
import { UtilsSecu } from './UtilsSecu';
export declare class ServerBase {
    currentApp: IApplicationConfiguration;
    app: any;
    secu: UtilsSecu;
    server: http.Server;
    metrics: any;
    constructor();
    protected readonly parentProcessHandler: (msg: any) => void;
    protected sendToParentProcess(msg: any): void;
    protected startHttpServer(): void;
    protected init(): Promise<any>;
    headers: string[][];
    protected loadConfPromise(): Promise<any>;
    protected loadDepConfPromise(): Promise<any>;
    protected reloadConfPromise(): Promise<any>;
    readonly reloadConf: (req: any, res: any) => void;
    readonly toErrRes: {
        (err: any, code?: number): any;
    };
    readonly toJsonRes: {
        (objs: any, meta?: any): any;
    };
    readonly addCtx: express.RequestHandler | express.ErrorRequestHandler;
    readonly checkJWT: express.RequestHandler | express.ErrorRequestHandler;
    readonly hasRight: express.RequestHandler | express.ErrorRequestHandler;
}
