import nBGGFetch from "./module/nBGGFetch.js";

const theH1 = document.getElementById("h1");
const theImg = document.getElementById("img");
const theSub = document.getElementById("sub");
const theInput = document.getElementById("input")


function getUuid(){
    return URL.createObjectURL(new Blob()).split('/')[3];
}
async function start(){
    theH1.innerText = '验证码';
    let pa = new URLSearchParams(window.location.search);
    let cookieId = pa.get('cookieID');
    if (!cookieId){
        theH1.innerText = '未指定cookieId，无法加载验证码。';
        return;
    }
    theImg.src = './img/loading128.png';
    let res
    try{
        let baseUrl = window.location.origin.includes('docgpt') || window.location.origin.includes('.workers.')  ?
            window.location.origin : 'https://binggo2.docgpt.top';
        let url = `${baseUrl}/edgesvc/turing/captcha/create`    
        // console.log(`start captcha/create: ${url}`)
        res = await nBGGFetch(url,{
            
            headers:{"cookieID":cookieId}
        });
    }catch (error){
        console.warn(error)
        theH1.innerText = error.message;
        return;
    }
    if(!res.ok){
        theImg.src = '';
        theH1.innerText = `错误代码:${res.status}原因:${res.statusText}`
        return;
    }
    let id = res.headers.get('id');
    let blob = await res.blob();
    theImg.src = URL.createObjectURL(blob);

    //提交按钮
    theSub.onclick = async ()=>{
        theSub.onclick = undefined;
        theImg.src = '';
        let q  = new URLSearchParams();
        q.append("type","visual");
        q.append("id",id);
        q.append("regionId","0");
        q.append("value",theInput.value);
        let res
        // let location = 'https://bing.vcanbb.top' ;//window.location.origin
        let baseUrl = window.location.origin.includes('docgpt') || window.location.origin.includes('.workers.')  ?
            window.location.origin : 'https://binggo2.docgpt.top'; // true是https://binggo1.docgpt.top
        baseUrl = window.location.origin.includes('.dahai123.') || window.location.origin.includes('.pages.') ?
            'https://binggo1.docgpt.top' : 'https://binggo2.docgpt.top';   
        let url = `${baseUrl}/edgesvc/turing/captcha/verify?${q.toString()}`     
        // console.log('提交按钮 captcha.js url:',url)    
        try{
            res = await nBGGFetch(url,{
                headers:{"cookieID":cookieId}
            });
        }catch (error){
            console.warn(error);
            theH1.innerText = error.message;
            return;
        }
        if(!res.ok){
            theH1.innerText = `提交失败！错误代码:${res.status}原因:${res.statusText}`;
            return;
        }
        let json = await res.json();
        if(json.statusCode===200&&(json.reason==="Solved")){ // ||json.reason==="NoChallengeSession"
            theH1.innerText = `已解决！✅`;
            theImg.remove();
            theInput.remove();
            theSub.remove();
            setTimeout(()=>{
                let re = pa.get('redirect')
                if (re){
                    window.location = re;
                }
            },1000);
        }else if (json.statusCode===200&&json.reason==="WrongAnswer"){
            theH1.innerText = `验证码错误！`;
            setTimeout(()=>{
                window.location.reload();
            },1000);
        }else {
            theH1.innerText = `发生错误:${json.reason}`;
        }
    }
}

window.addEventListener("load",start);