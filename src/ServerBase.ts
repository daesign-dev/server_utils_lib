import * as express from 'express';
import * as promBundle from 'express-prom-bundle';
import * as fs from 'fs-extra';
import * as http from 'http';
import * as _ from 'lodash';
import * as jose from 'node-jose';
import * as request from 'request-promise-native';
import * as Util from 'util';
import { ConfLoader } from './ConfLoader';
import { IApplicationConfiguration } from './IApplicationConfiguration';
import { RequestContext } from "./RequestContext";
import { UtilsSecu } from './UtilsSecu';

export class ServerBase{

	public currentApp:IApplicationConfiguration ;
	public app:any ;
	public secu:UtilsSecu ;
	public server:http.Server ;
	public metrics = promBundle({
		includeMethod: true,
		includePath: true
	});

	constructor(){
		this.currentApp = {} ;
		this.init().then(()=>{
			this.app.use((err, req, res, next) => {
			    let obj = this.toErrRes(err) ;
			    res.send(obj);
			});
			this.startHttpServer() ;
		}).catch((err)=>{
				console.log(err) ;
			})
		process.on('message', this.parentProcessHandler )
		
	}

	protected get parentProcessHandler(){
		return (msg) => {
			console.log("parentMessage " , msg ) ;
			switch (msg) {
				case "reloadConf":
					this.reloadConfPromise()
					 .then((conf)=>{
				    	this.currentApp.conf = conf ;
						
					}).catch((err)=>{
						console.log(err) ;
					})
					break;
			}
		}
	}

	protected  sendToParentProcess(msg){
		process.send(msg)
	}

	protected startHttpServer(){
		this.server = this.app.listen(this.currentApp.conf.port, () => {
	        console.log('Server listen on port ' + this.currentApp.conf.port )
	        
		}) ;
		this.currentApp.server = this.server  ;
	}
	protected init():Promise<any>{
		let prom = this.loadConfPromise().then((conf)=>{
			this.currentApp.conf =  conf ;
			if(this.currentApp.conf.debug){
				console.log(this.currentApp) ;
			}
			this.app = express();	
			console.log("start app") ;
			this.currentApp.express = this.app  ;
			this.currentApp.toErrRes = this.toErrRes ;
			this.currentApp.toJsonRes = this.toJsonRes ;
			this.secu = new UtilsSecu(this.currentApp) ;
			this.currentApp.metrics = this.metrics ;
			this.app.use(this.metrics)
			this.currentApp.secu = this.secu ;
			this.app.use( (req, res , next) => {
				this.headers.forEach((data)=>{
					res.header(data[0] , data[1]) ;
				})	
		       
			  next() ;
			})
			.use((req, res, next) => {
				if(this.currentApp.conf.debug){
					console.log(req.method + "," +  req.url) ;
				}
			    next() ;
			})
			.use(this.addCtx , this.secu.chekInternalMidelWare , this.checkJWT) 
			return this.currentApp ;
		}).then(()=>{
			return this.loadDepConfPromise() ;
		}).then(data=>{
			this.app.use(this.hasRight)
			.get('/', (req, res) => {
				    res.send({online:true})
				})
			.get('/reloadConf', this.reloadConf)
		})

		return prom ;
	}

	public headers:string[][] = [
			["Access-Control-Allow-Methods" , "GET, POST, OPTIONS, PUT, PATCH, DELETE"],
			["Access-Control-Allow-Origin", "*"],
			["Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, idtoken, JWT, jwt, keydate, keyDate , key"],
			["Cache-Control", "no-cache, no-store, must-revalidate"],
			["Pragma", "no-cache"],
			["Expires", "0"]

		];
	
	protected 	loadConfPromise():Promise<any>{
		return ConfLoader.getConf() ;
	}

	protected 	loadDepConfPromise():Promise<any>{
		if(this.currentApp.conf['licence_well-known'] && this.currentApp.conf['licence_well-known'] != ""){
			let opt ={
				url:this.currentApp.conf['licence_well-known'],
				json:true 
			}
			return Promise.resolve(request.get(opt))
			.then((data)=>{
				if(data.code == 500){
					throw new Error("licence_well-known " + data.message) ;
				}else{
					return data
				}
			}).catch(err=>{
					let val = fs.readJSONSync("./confs/dep/" + this.currentApp.conf['licence_well-known'].replace(/\//gi, "_") +".json" ) ;
					return val
				}).then((conf)=>{
					fs.ensureDirSync("./confs/dep/")
					fs.writeJSONSync("./confs/dep/" + this.currentApp.conf['licence_well-known'].replace(/\//gi, "_")  + ".json" , conf )
					let opt2 ={
						url:conf.jwks_uri ,
						json:true 
					}
					return request.get(opt2)
					.then((data)=>{
						if(data.code == 500){
							throw new Error("jwk " + data.message) ;
						}else{
							return data ;
						}
					}).catch(err=>{
						var valJwk = fs.readJSONSync("./confs/dep/" + conf.jwks_uri.replace(/\//gi, "_")  +".json" ) ;

						return valJwk ;
					}).then((objKey)=>{
						fs.ensureDirSync("./confs/dep/")
						fs.writeJSONSync("./confs/dep/" + conf.jwks_uri.replace(/\//gi, "_")  + ".json" , objKey )
						return jose.JWK.asKeyStore(objKey).then((keyStore)=>{
								this.currentApp.licence_keyStore = keyStore ;
								return this.currentApp ;
							})
							
					})
				})
		}else{
			return Promise.resolve(this.currentApp) ;
		}
	}
	protected 	reloadConfPromise():Promise<any>{
		return ConfLoader.getConf().then((conf)=>{
		    	this.currentApp.conf = conf ;
			}).then(()=>{
				return this.loadDepConfPromise() ;
			}) ;
	}
	public get reloadConf ()  {
		return (req, res) => {
			this.reloadConfPromise()
			.then((conf)=>{
		    	// 	this.currentApp.conf = conf ;
				res.send({code:200}) ;
			}).catch((err)=>{
				res.send(this.toErrRes(err)) ;
			})
		}
	}

	public get toErrRes ():{(err: any, code?:number):any} {
		return (err: any, code:number=500):any => {
			if(Util.isString(err)){
				err = {message:err }
			}
	        let rep = {
	            code: code,
	            message: err.message,
	            name: err.name,
	            stack: undefined
	        };
	        
	        if(this.currentApp.conf.debug){
	          rep.stack = err.stack ;
			}
			console.log(JSON.stringify(err)) ;
	        return rep ;
	    }
    };

    public  get toJsonRes ():{ (objs: any, meta?:any ): any}{
    	return (objs: any, meta: any = null): any  =>{
		    if (!Util.isArray(objs)) {
		        objs = [objs];
		    };

		    if (!meta) {
		        meta = {};
		    };

		    return {
		        code: 200,
		        meta: meta,
		        response: objs
		    };
		}
	};

	public get addCtx(): express.RequestHandler | express.ErrorRequestHandler{
		return (req, res , next) =>{
			if(!req.ctx){
				req.ctx = new RequestContext() ;
			}
			next() ;
		}
	}
	



	public get checkJWT(): express.RequestHandler | express.ErrorRequestHandler {
		return (req, res, next) => {

			let token = req.header('JWT') 

			if(token && this.currentApp.licence_keyStore ){
				
				jose.JWS.createVerify(this.currentApp.licence_keyStore).verify(token)
				.then(function(result) {
					var payload:any = JSON.parse(result.payload.toString()) ;
					let myDate:number = (Date.now() )/1000;
					if(payload.exp < myDate){
						console.log("token is expired" , req.ctx.user)
						next("token is expired" ) ;
					}else if(payload.nbf > myDate){
						console.log("nbf token is not valid" , req.ctx.user)
						next("nbf token is not valid" ) ;
					}else{
						req.ctx.user = payload ;
						next() ;
					}

		        }).catch(function(err){
		        	next(err) ;
		        })
			}else{
				
				next() ;
			}
		}
	}

	



	public get hasRight(): express.RequestHandler | express.ErrorRequestHandler {

		return (req, res, next)  => {
			req.ctx.roles = [] ;
			var confSecu:any[]
			if(req.ctx.internalCallValid){
				
			}else if(req.ctx.user){

				req.ctx.roles = req.ctx.user.role
				if(this.currentApp.conf &&  this.currentApp.conf.configurations && this.currentApp.conf.configurations[req.ctx.user.appId]){
					confSecu = this.currentApp.conf.configurations[req.ctx.user.appId].httAccess["_$" + req.method.toLowerCase()] ;
				}
			}
			req.ctx.roles.push("*") ;
			// console.log("confSecu" , confSecu , this.currentApp.conf ,  )
			if((! confSecu) &&  this.currentApp.conf && this.currentApp.conf.publicAccess ){
				if(this.currentApp.conf.debug){
					console.log("find public access " + "_$" + req.method.toLowerCase())
				}
				confSecu = this.currentApp.conf.publicAccess["_$" + req.method.toLowerCase()] ;
			}
			// console.log("confSecu" , confSecu )
			if(req.ctx.internalCallValid || req.method.toLowerCase() == "options"){
				next()
			}else{
				let path:string =req.originalUrl ;
				if(confSecu){
					
					let access = confSecu.find(( val )=>{
						return path.indexOf(val.route) == 0 ;
					})
					
					if(access && _.intersection(access.role , req.ctx.roles).length > 0){
						next() ;
					}else{	
						if(this.currentApp.conf.debug){
							console.log("unautorized " , confSecu , access , path , req.ctx.roles );
						}
						next("unautorized" ) ;
					}
				}else{
					if(this.currentApp.conf.debug){
						console.log("unautorized, no conf match" , confSecu , path , req.ctx.roles ) ;
					}
						next("unautorized" ) ;
				}
				
			}
		}
	}




}

