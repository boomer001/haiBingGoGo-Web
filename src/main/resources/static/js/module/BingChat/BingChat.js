import nBGGFetch from "../nBGGFetch.js";
import BingChating from "./BingChating.js";
import CookieID from "../CookieID.js";

export default class BingChat {
    bingChating;
    chatFirstMessages;//ChatFirstMessages 对象
    chatOptionsSets;//chatOptionsSets对象


    constructor(chatFirstMessages, chatOptionsSets) {
        this.chatFirstMessages = chatFirstMessages;
        this.chatOptionsSets = chatOptionsSets;


    }

    /**
     * 结束当前会话
     * */
    end() {
        this.bingChating = undefined;
    }

    /**
     * 是否已经开始聊天
     * @return {boolean}
     * */
    isStart() {
        return !!this.bingChating;
    }

    /**
     * 发送消息
     * @param text {String} 消息文本
     * @param onMessage {function} 当bing回复时的回调函数
     * @return {ReturnMessage}
     * */
    sendMessage(text, onMessage) {
        if (!this.isStart()) {
            throw new Error("聊天没有开始，需要先使用start方法开始聊天");
        }
        return this.bingChating.sendMessage(text, (message, returnMessage) => {
            onMessage(message, returnMessage);
        });
    }

    retry(fn, finnallyFailCall, retriesLeft = 3, interval = 100) {
        return new Promise((resolve, reject) => {
            fn()
                .then(resolve)
                .catch((error) => {
                    setTimeout(() => {
                        if (retriesLeft <= 1) {
                            if (finnallyFailCall) {
                                finnallyFailCall(error);
                            }
                            return
                        } else {
                            console.error(`Retrying${retriesLeft} after ${interval}ms  due to:`, error)
                        }

                        this.retry(fn, finnallyFailCall, retriesLeft - 1, interval).then(resolve, reject);
                    }, interval);
                });
        });
    }
  
    async start(theChatType, finnallyFailCall) {

        return this.retry(() => this.startChat(theChatType), finnallyFailCall, 3, 1000)

    }


    /**
     开始聊天
     @param theChatType {"Creative","Balanced","Precise"} 聊天选项 默认平衡
     @return {BingChat}
     @throws Error
     */
    // async start(theChatType) {
    async startChat(theChatType) {
        if (this.isStart()) {
            throw new Error("聊天已经开始了，需要使用end方法结束后再重新开始。");
        }
        // throw new Error(" 失败重连测试,startChat error, ");
        let res
         
        let baseUrl = 'https://binggo2.docgpt.top/turing/conversation/create';
        try {
            
            res = await nBGGFetch(baseUrl,
                !CookieID.cookieID ? undefined : { headers: { "cookieID": CookieID.cookieID } });
        } catch (e) {
            console.warn(e);
            throw e.isNewBingGoGoError ? e : new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
        }
        let errorTip = '被拒绝服务了,请刷新网页,然后重试'
        let cookieID = res.headers.get("cookieID");
        if (res.status === 404) {
            // throw new Error(`服务所在地区不提供NewBing服务，请联系服务搭建者切换服务所在地区，第${cookieID}个账号。`);
            throw new Error(errorTip + 1);
        }
        let rText = await res.text();
        console.log('BingChat.js rText:' + rText)

        if (rText.length < 1) {
            if (cookieID === 'self') {
                // throw new Error(`魔法链接服务服务所在地区无法使用或账号登录状态失效，尝试切换魔法链接或重新登录。`);
                throw new Error(errorTip + 2);
            } else {
                // throw new Error(`服务所在地区无法使用或cookie失效，第${cookieID}个账号。`);
                throw new Error(errorTip + 3);
            }
        }

        let resjson = JSON.parse(rText);
        if (!resjson.result) {
            console.warn(resjson);
            throw new Error("未知错误！");
        }
        if (resjson.result.value !== 'Success') {
            console.warn(resjson);
            let type = resjson.result.value;
            let mess = resjson.result.message;
            if (resjson.result.value === 'UnauthorizedRequest') {
                type = 'NoLogin'
                mess = errorTip + 4;//cookieID === 'self'?'在使用之前需要先登录微软账号，请前往bing.com登录微软账号。':`cookie失效，第${cookieID}个cookie。`;
            } else if (resjson.result.value === 'Forbidden') {
                type = 'NoPower'
                mess = errorTip + 5;//cookieID === 'self'?'当前账号没有使用NewBing的权限':`cookie无权限，第${cookieID}个cookie。`;
            }
            let error = new Error(mess);
            error.type = type;
            throw error;
        }
        this.bingChating = BingChating.create(this, resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType, undefined);
        CookieID.cookieID = cookieID;
        return this;
    }

}