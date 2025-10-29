import { QWebChannel } from './qwebchannel.js'
/**
 * import QWebChannel to connect real-time communication between QT and the web
 * 
 * @function init Initialize the QWebChannel and get the Context
 * @function sendMsg Call the qt method, to send params to qt
 */
class qwebMsg {
  init(){
    if (typeof qt != 'undefined')
    {
      new QWebChannel(qt.webChannelTransport, function(channel)
        {
          window.Context = channel.objects.Context;
          return window.Context;
        }
      );
    }
    else
    {
      console.error("qt is not defined!!");
      return false;
    }
  }
  /**
   * 
   * @param {*} fun 
   * @param {*} params 
   */
  sendMsg(fun,params){
    window.Context[fun](params);
  }
}

const qtwebMsg = new qwebMsg();
export default qtwebMsg;