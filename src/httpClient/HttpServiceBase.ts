import { CtxInterpretor } from "../CtxInterpretor";
import { HttpAbstractService } from "./HttpAbstractService";
import { IHttpResult } from "./IHttpResult";
import { MiddleWareConfig } from "./MiddleWareConfig";

export class HttpServiceBase<T> extends HttpAbstractService {
  constructor(
    conf:any 
  ) {
  	super(conf) ;
    this.url = conf.url ;
  }

  protected url:string ;

protected  globalCtxInt:CtxInterpretor = new CtxInterpretor(process.env) ;

   public delete(
    id: string,
    headers: any = {}
  ): Promise<IHttpResult<T>> {
   
    return super.baseDelete<T>(this.url + id, headers)
  }
  public  deleteMiddleware = (config:MiddleWareConfig) =>{   
    config = this.globalCtxInt.updateEnv(config , true) ;
    return (req , res , next) =>{
      var localCtxInt:CtxInterpretor = new CtxInterpretor(req.ctx)
      localCtxInt.startPatern = "$ctx." ;
      var localConfig = localCtxInt.updateEnv(config , true) ;
      this.delete( localConfig.params.id, localConfig.headers)
      .then((data)=>{
        req.ctx[localConfig.output] = data ;
        next() ;
      }).catch((err)=>{
        next(err)
      })
    }
  }

  public get(
    query: string = '*',
    headers: any = {}
  ): Promise<IHttpResult<T>> {
    
    return super.baseGet<T>(this.url + query, headers)

  }

  public  getMiddleware = (config:MiddleWareConfig) =>{   
    config = this.globalCtxInt.updateEnv(config , true) ;
    return (req , res , next) =>{
      var localCtxInt:CtxInterpretor = new CtxInterpretor(req.ctx)
      localCtxInt.startPatern = "$ctx." ;
      var localConfig = localCtxInt.updateEnv(config , true) ;
      this.get( localConfig.params.query, localConfig.headers)
      .then((data)=>{
        req.ctx[localConfig.output] = data ;
        next() ;
      }).catch((err)=>{
        next(err)
      })
    }
  }

  public patch(
    body: any ,
    headers: any = {},
    query: string = ''
  ): Promise<IHttpResult<T>> {

    return super.basePatch<T>(this.url + query , body, headers)
    
  }
  public  patchMiddleware = (config:MiddleWareConfig) =>{   
    config = this.globalCtxInt.updateEnv(config , true) ;
    return (req , res , next) =>{
      var localCtxInt:CtxInterpretor = new CtxInterpretor(req.ctx)
      localCtxInt.startPatern = "$ctx." ;
      var localConfig = localCtxInt.updateEnv(config , true) ;
      this.patch( localConfig.body , localConfig.headers , localConfig.params.query)
      .then((data)=>{
        req.ctx[localConfig.output] = data ;
        next() ;
      }).catch((err)=>{
        next(err)
      })
    }
  }

  public post(
    body: T | T[] ,
    headers: any = {},
    query: string = ''
  ): Promise<IHttpResult<T>> {

    return super.basePost<T>(this.url + query , body, headers)
    
  }
  public  postMiddleware = (config:MiddleWareConfig) =>{   
    config = this.globalCtxInt.updateEnv(config , true) ;
    return (req , res , next) =>{
      var localCtxInt:CtxInterpretor = new CtxInterpretor(req.ctx)
      localCtxInt.startPatern = "$ctx." ;
      var localConfig = localCtxInt.updateEnv(config , true) ;
      // console.log(JSON.stringify(localConfig))
      this.post( localConfig.body , localConfig.headers , localConfig.params.query)
      .then((data)=>{
        req.ctx[localConfig.output] = data ;
        // console.log(JSON.stringify(data)) ;
        next() ;
      }).catch((err)=>{
        next(err)
      })
    }
  }
  
  public put(
    body: T | T[],
    headers: any = {},
    query: string = ''
  ): Promise<IHttpResult<T>> {

    return super.basePut<T>(this.url + query , body, headers)
    
  }
    public  putMiddleware = (config:MiddleWareConfig) =>{   
    config = this.globalCtxInt.updateEnv(config , true) ;
    return (req , res , next) =>{
      var localCtxInt:CtxInterpretor = new CtxInterpretor(req.ctx)
      localCtxInt.startPatern = "$ctx." ;
      var localConfig = localCtxInt.updateEnv(config , true) ;
      this.put( localConfig.body , localConfig.headers , localConfig.params.query)
      .then((data)=>{
        req.ctx[localConfig.output] = data ;
        next() ;
      }).catch((err)=>{
        next(err)
      })
    }
  }

}