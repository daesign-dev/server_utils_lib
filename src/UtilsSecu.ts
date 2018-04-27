
import * as crypto from  'crypto';
import * as url from 'url' ;
import * as assert from 'assert' ;
import * as express from "express" ;

export class UtilsSecu{

	constructor(private currentApp:any){
		 assert(currentApp.conf.secretKey, "secretKey is not spécified");
	}
	
	public addHeadersKey (rq:any){
		
		var date:number = Date.now() ;
		if(!rq.headers ){
			rq.headers = {}
		}
		rq.headers.keyDate = date ;
		// rq.url = rq.url.toLowerCase().replace(/\/\//gi , '/').replace(/http:\//, "http://").replace(/https:\//, "https://")
		rq.headers.key = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
                   .update(date + rq.url.toLowerCase())
                   .digest('hex')

	}

	public get chekInternalMidelWare(): express.RequestHandler | express.ErrorRequestHandler {
		return (req, res, next)=>{
			var date = req.header('keyDate') ;
			var key = req.header('key')  ;
			var requrl ;
			var currentDate:number = Date.now() ;
			if(key){
				if(currentDate > date+ 30000){
		        	console.log("keyDate is obsolete : " + currentDate + ">"  + date + "+ 30000" ) ;
		        	next("keyDate is obsolete") ;
				}else{
					if(req.originalUrl && req.originalUrl.length > 1){
						requrl = this.currentApp.conf.urlBase + req.originalUrl.substr(1) ;
					}else{
						requrl = this.currentApp.conf.urlBase  ;
					}
					
					var newKey:string = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
			                   .update(date + requrl.toLowerCase())
			                   .digest('hex') ;

			        if(newKey == key){
			        	req.ctx.internalCallValid = true ;
			        	next() ;
			        }else{
			        	req.ctx.internalCallValid = false ;
			        	console.log("key dont match uri : " + requrl , date , key , newKey) ;
			        	next() ;
			        }
		    	}
		       
			}else{
				next() ;
			}
			
		}
	} 

	public get protectInternalMidelWare():express.RequestHandler | express.ErrorRequestHandler{
		return (req, res, next) => {
			var date = req.header('keyDate') ;
			var key = req.header('key')  ;
			var requrl ;
			var currentDate:number = Date.now() ;
			if(key){
				if(currentDate > date + 30000){
		        	console.log("keyDate is obsolete : " + currentDate + ">"  + date + "+ 30000" ) ;
		        	next("keyDate is obsolete") ;
				}else{
					if(req.originalUrl && req.originalUrl.length > 1){
						requrl = this.currentApp.conf.urlBase + req.originalUrl.substr(1) ;
					}else{
						requrl = this.currentApp.conf.urlBase  ;
					}
					
					var newKey:string = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
		                   .update(date + requrl.toLowerCase())
		                   .digest('hex') ;
		                   
			        if(newKey == key){
			        	req.ctx.internalCallValid = true ;

			        	next() ;
			        }else{
			        	console.log("key dont match uri : " + requrl , date , key , newKey) ;
			        	next("key dont match uri : " + requrl) ;
			        }
			    }
			}else{
				next("no key") ;
			}
			
		}
	} 
}