/*
 * @Author: your name
 * @Date: 2021-07-09 14:49:00
 * @LastEditTime: 2021-10-29 10:27:23
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\fuzzysearch\fuzzysearch.js
 */
let fuzzySearch={}
fuzzySearch.install = function (Vue, options) {
  Vue.prototype.fuzzySearch = function (zTreeId, searchField, isHighLight, isExpand){
    var zTreeObj = $.fn.zTree.getZTreeObj(zTreeId);
    if(!zTreeObj){
      alert("Failed to get tree object");
    }
    var nameKey = zTreeObj.setting.data.key.name;
    isHighLight = isHighLight===false?false:true;
    isExpand = isExpand?true:false;
    zTreeObj.setting.view.nameIsHTML = isHighLight;
    var metaChar = '[\\[\\]\\\\\^\\$\\.\\|\\?\\*\\+\\(\\)]';
    var rexMeta = new RegExp(metaChar, 'gi');
    function ztreeFilter(zTreeObj,_keywords,callBackFunc) {
      if(!_keywords){
        _keywords ='';
      }
      function filterFunc(node) {
        if(node && node.oldname && node.oldname.length>0){
          node[nameKey] = node.oldname;
        }
        zTreeObj.updateNode(node);
        if (_keywords.length == 0) {
          zTreeObj.showNode(node);
          zTreeObj.expandNode(node,isExpand);
          return true;
        }
        if (node[nameKey] && node[nameKey].toLowerCase().indexOf(_keywords.toLowerCase())!=-1) {
          if(isHighLight){
            var newKeywords = _keywords.replace(rexMeta,function(matchStr){
              return '\\' + matchStr;
            });
            node.oldname = node[nameKey];
            var rexGlobal = new RegExp(newKeywords, 'gi');
            node[nameKey] = node.oldname.replace(rexGlobal, function(originalText){
              var highLightText =
                '<span style="color: whitesmoke;background-color: darkred;">'
                + originalText
                +'</span>';
              return 	highLightText;
            });
            node['isSearch'] = true
            zTreeObj.updateNode(node);
          }
          zTreeObj.showNode(node);
          return true;
        }
        zTreeObj.hideNode(node);
        return false;
      }
      var nodesShow = zTreeObj.getNodesByFilter(filterFunc);
      processShowNodes(nodesShow, _keywords);
    }
    function processShowNodes(nodesShow,_keywords){
      if(nodesShow && nodesShow.length>0){
        if(_keywords.length>0){
          $.each(nodesShow, function(n,obj){
            var pathOfOne = obj.getPath();
            if(pathOfOne && pathOfOne.length>0){
              for(var i=0;i<pathOfOne.length-1;i++){
                zTreeObj.showNode(pathOfOne[i]);
                zTreeObj.expandNode(pathOfOne[i],true);
              }
            }
          });
        }else{
          var rootNodes = zTreeObj.getNodesByParam('level','0');
          $.each(rootNodes,function(n,obj){
            zTreeObj.expandNode(obj,true);
          });
        }
      }
    }
    $(searchField).bind('input propertychange', function() {
      var _keywords = $(this).val();
      searchNodeLazy(_keywords);
    });
    var timeoutId = null;
    var lastKeyword = '';
    function searchNodeLazy(_keywords) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(function() {
      if (lastKeyword === _keywords) {
        return;
      }
      ztreeFilter(zTreeObj,_keywords);
        lastKeyword = _keywords;
      }, 500);
    }
  }
}

export default fuzzySearch
