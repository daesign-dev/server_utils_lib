
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
		if(rq.headers.keyDate){
			date = new Date(rq.headers.keyDate).valueOf() ;
		}else{
			rq.headers.keyDate = date ;
		}
		if(this.currentApp.conf.debug){
			console.log(rq.url) ;
		}
		
		var url = encodeURI(rq.url.trim().toLowerCase().replace(/\/\/+/gi, '/').replace(/^([a-z]+):\/+/, "$1://"));
		// console.log(url) ;
		// var url = encodeURI(url);
		// var url = rq.url.trim().toLowerCase().replace(/\/\/+/gi, '/').replace(/^([a-z]+):\/+/, "$1://")
		
		if(this.currentApp.conf.debug){
			console.log(url) ;
		}
		rq.headers.key = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
                   .update(date + url)
				   .digest('hex') ;
		if(this.currentApp.conf.debug){
			console.log(rq.headers.keyDate , rq.headers.key)
		}		   
		

	}

	

	public get chekInternalMidelWare(): express.RequestHandler | express.ErrorRequestHandler {
		return (req, res, next)=>{
			var date = Number(req.header('keyDate')) ;
			var key = req.header('key')  ;
			var requrl:string ;
			var currentDate:number = Date.now() ;
			if(key){
				if(currentDate > date+ 30000){
					if(this.currentApp.conf.debug){
						console.log("keyDate is obsolete : " + currentDate + ">"  + date + "+ 30000" ) ;
					}
		        	next("keyDate is obsolete") ;
				}else{
					if(req.originalUrl && req.originalUrl.length > 1){
						requrl = this.currentApp.conf.urlBase + req.originalUrl.substr(1) ;
					}else{
						requrl = this.currentApp.conf.urlBase  ;
					}
					var url = requrl.trim().toLowerCase().replace(/\/\/+/gi, '/').replace(/^([a-z]+):\/+/, "$1://");
					url = encodeURI(decodeURI(url)) ;
					
					var newKey:string = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
			                   .update(date + url)
			                   .digest('hex') ;

			        if(newKey == key){
			        	req.ctx.internalCallValid = true ;
			        	next() ;
					}else{
						
						req.ctx.internalCallValid = false ;
						if(this.currentApp.conf.debug){
							console.log("key dont match uri encodeURI: " + url , date , key , newKey) ;
						}
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
			var date = Number(req.header('keyDate')) ;
			var key = req.header('key')  ;
			var requrl:string ;
			var currentDate:number = Date.now() ;
			if(key){
				if(currentDate > date + 30000){
					if(this.currentApp.conf.debug){
					console.log("keyDate is obsolete : " + currentDate + ">"  + date + "+ 30000" ) ;
					}
		        	next("keyDate is obsolete") ;
				}else{
					if(req.originalUrl && req.originalUrl.length > 1){
						requrl = this.currentApp.conf.urlBase + req.originalUrl.substr(1) ;
					}else{
						requrl = this.currentApp.conf.urlBase  ;
					}
					var url = requrl.trim().toLowerCase().replace(/\/\/+/gi, '/').replace(/^([a-z]+):\/+/, "$1://") ;
					url = encodeURI(decodeURI(url)) ;
					var newKey:string = crypto.createHmac('sha256', this.currentApp.conf.secretKey)
		                   .update(date + url)
		                   .digest('hex') ;
		                   
			        if(newKey == key){
			        	req.ctx.internalCallValid = true ;

			        	next() ;
			        }else{
						
							if(this.currentApp.conf.debug){
							console.log("key dont match uri : " + requrl , date , key , newKey) ;
							}
							next("key dont match uri : " + requrl) ;
						
			        }
			    }
			}else{
				next("no key") ;
			}
			
		}
	} 
}