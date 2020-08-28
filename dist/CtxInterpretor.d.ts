export declare class CtxInterpretor {
    context: any;
    startPatern: string;
    endPatern: string;
    splitPatern: string;
    constructor(context: any);
    private setEnv;
    private setGlobalEnv;
    updateArrEnv(obj: any[], clone?: boolean, removeUnknownVar?: boolean): any;
    updateEnv(obj: any, clone?: boolean, removeUnknownVar?: boolean): any;
}
