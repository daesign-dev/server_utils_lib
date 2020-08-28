import {UtilsSecu} from    "./UtilsSecu" ;
import * as url from 'url' ;
import * as request from 'request-promise-native' ;
// BOf5u8FgRaUCe8h3oESxOiksanNEDi6T0AuL9qRRIZs='
// jgffnFDGijg654FGHdeamlkdfj8egsglkhjBrfohg

// import * as crypto from  'crypto-js';
// var key:string = "rerererer" ;
// var date:number = Date.now() ;
// if(rq.headers.keyDate){
//     date = new Date(rq.headers.keyDate).valueOf() ;
// }else{
//     rq.headers.keyDate = date ;
// }
// console.log(rq.url) ;
// var url = encodeURI(rq.url.trim().toLowerCase().replace(/\/\/+/gi, '/').replace(/^([a-z]+):\/+/, "$1://"));
//     var key:string = crypto.HmacSHA256( date + url , key).toString()
// rq.headers.key = key


var utilSecu:UtilsSecu = new UtilsSecu({conf:{secretKey:"poipoi"}}) ;
var rq:any ={

    url:"https://confService.hiji.fr/59f1918b650e4e6e3e8d2b77/"  ,
    headers:{
        keyDate:Date.now(),
    }
}
utilSecu.addHeadersKey(rq) ;
console.log(rq.headers.keyDate) ;
console.log(rq.headers.key) ;
request.get(rq).then(
    (val)=>{
        console.log(val) ;
    }
)

