/**
 * 自定义的fetch，用于返回自定义异常
 * @param url {String} 请求的url
 * @param rr {Object,undefined} 要添加的请求头
 * @param noAddHeader {boolean,undefined} 是否不添加用于标示的请求头
 *
 * */
import RandomAddress from "./RandomAddress.js";

export default async function nBGGFetch(url,rr,noAddHeader){
    // console.log('nBGGFetch, url:'+url)
    if(!noAddHeader){
        if(!rr){
            rr = {headers:{"haiBingGoGoWeb":"true"}};
        }else if(!rr.headers){
            rr.headers = {"haiBingGoGoWeb":"true"};
        }else {
            rr.headers['haiBingGoGoWeb'] = "true";
        }
        rr.headers['randomAddress'] = RandomAddress.randomAddress;
    }
  
//    rr.method='OPTIONS' 
//    console.log('1nBGGFetch, rr.method:', rr) 
   let res = await fetch(url,rr)
   let re = new Response(res.body, res);
//    let userCookieID = res.headers.get("Cookieid");
//    console.log('nBGGFetch, userCookieID:' )
//    console.log( res )
   re.headers.set("Access-Control-Allow-Origin", "*");
   re.headers.set("haiBing", "true");
   re.headers.set("cookieID", 0);
   re.headers.set("Report-Only", "");
   re.headers.set("Report-To", "");
   if(re.headers.get('NewBingGoGoError')){
       let json = await re.json();
       let error= new Error(json.message);
       error.value = json.value;
       error.isNewBingGoGoError = true;
       error.theType = json.type;//newBingGoGo 自定义错误类型
       error.theData = json.data;//newBingGoGo 自定义错误数据
       throw error;
   }
   return re;
}