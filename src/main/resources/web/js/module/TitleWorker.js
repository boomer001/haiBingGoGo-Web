/**
 * 管理标题的对象
 * */
export default class TitleWorker {
    goGoSubtitleDiv;
    constructor(goGoSubtitleDiv) {
        this.goGoSubtitleDiv = goGoSubtitleDiv;
    }
    /**
     * 设置文档标题
     * */
    setPageTitleText(text){
        document.title = text;
    }
    /**
     * 设置副标题
     * */
    setSubtitleText(text){
        this.goGoSubtitleDiv.innerText = text;
    }
    /**
     * 重置标题到初始状态
     * */
    restart(){
        // this.setSubtitleText('New Bing 精简版');
        // document.title = 'haiBing 海冰';
        document.title = 'haiBing海冰--NewBing精简版';
        
    }
    /**
     * 正在创建聊天时
     * */
    onCreating(){
        this.setSubtitleText('正在建立连接. 稍等！');
    }
    /**
     * 正在发送消息时
     * */
    onSending(){
        this.setSubtitleText('正在发送消息.');
    }
    /**
     * 正在回复时
     * */
    onAnswering(){
        this.setSubtitleText('正在接收消息.');
    }

    /**
     * 等待下一条消息时
     */
    waitingNext(){
        this.setSubtitleText('回答完毕');
    }
}