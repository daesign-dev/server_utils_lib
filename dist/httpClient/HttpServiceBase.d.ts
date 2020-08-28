import { CtxInterpretor } from "../CtxInterpretor";
import { HttpAbstractService } from "./HttpAbstractService";
import { IHttpResult } from "./IHttpResult";
export declare class HttpServiceBase<T> extends HttpAbstractService {
    constructor(conf: any);
    protected url: string;
    protected globalCtxInt: CtxInterpretor;
    delete(id: string, headers?: any): Promise<IHttpResult<T>>;
    deleteMiddleware: (config: any) => (req: any, res: any, next: any) => void;
    get(query?: string, headers?: any): Promise<IHttpResult<T>>;
    getMiddleware: (config: any) => (req: any, res: any, next: any) => void;
    patch(body: any, headers?: any, query?: string): Promise<IHttpResult<T>>;
    patchMiddleware: (config: any) => (req: any, res: any, next: any) => void;
    post(body: any, headers?: any, query?: string): Promise<IHttpResult<T>>;
    postMiddleware: (config: any) => (req: any, res: any, next: any) => void;
    put(body: any, headers?: any, query?: string): Promise<IHttpResult<T>>;
    putMiddleware: (config: any) => (req: any, res: any, next: any) => void;
}
