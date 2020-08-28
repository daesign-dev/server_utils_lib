
export class RequestContext {

	"null" = null ;
	"emptyStr" = "" ;
	get now():number{
		return Date.now() ;
	}

	get DateNow(){
		return new Date() ;
	}

}