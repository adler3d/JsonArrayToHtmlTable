var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    os = require("os");

var number_of_players=360;  
var qapsort=(arr,cb)=>{if(typeof cb=='undefined')cb=e=>e;return arr.sort((a,b)=>cb(b)-cb(a));}  
var qapmin=(arr,cb)=>{if(typeof cb=='undefined')cb=e=>e;var out;var i=0;for(var k in arr){var v=cb(arr[k]);if(!i){out=v;}i++;out=Math.min(out,v);}return out;}  
var qapmax=(arr,cb)=>{if(typeof cb=='undefined')cb=e=>e;var out;var i=0;for(var k in arr){var v=cb(arr[k]);if(!i){out=v;}i++;out=Math.max(out,v);}return out;}  
var qapsum=(arr,cb)=>{if(typeof cb=='undefined')cb=e=>e;return arr.reduce((pv,ex)=>pv+cb(ex),0);}  
var getarr=(m,k)=>{if(!(k in m))m[k]=[];return m[k];};  
var result_parse=(data)=>{  
  var arr=data.split("\n");//OK 1283\nSEED 22904832135050\n2 388 CRASHED\n1 396 CRASHED\n  
  var f=s=>{var A=s.split(" ");return {id:A[0],v:A[1]};};  
  var t=[f(arr[2]),f(arr[3])];  
  if(t[0].v==t[1].v)return [1,1];  
  var t1_win=t[0].v<t[1].v;  
  if(t[0].id=="1")return t1_win?[0,2]:[2,0];  
  if(t[0].id=="2")return t1_win?[2,0]:[0,2];  
  console.log("no way");  
  return [0,0];  
};  
var make_top_great_again=(data)=>{  
  var arr=data.split("\n").map(e=>JSON.parse(e));  
  var user2games={};var waveid2games={};  
  arr.map(e=>e.delta=result_parse(e["result.txt"]));  
  arr.map(e=>{var p=e.players;getarr(user2games,p[0]).push(e);getarr(user2games,p[1]).push(e);});  
  arr.map(e=>getarr(waveid2games,e.wave_id).push(e));  
  var max_games=qapmax(waveid2games,e=>e.length);  
  var min_games=qapmin(user2games,e=>e.length);  
  var done=[];  
  for(var i in waveid2games){var e=waveid2games[i];if(e.length==number_of_players/2)done.push(i);}  
  var users={};  
  var f=(u,g,id)=>{  
    getarr(users,u).push(g.delta[id]);  
  };  
  done.map(wid=>waveid2games[wid]).map(games=>games.map(  
    e=>{f(e.players[0],e,0);f(e.players[1],e,1);}  
  ));  
  var table=[];  
  for(var u in users){  
    var user_games=users[u];  
    table.push({  
      user:u,  
      score:qapsum(user_games),  
      wins:(qapsum(user_games,d=>d?1:0)*100/done.length)+" %"  
    });  
  }  
  var sorted_table=qapsort(table,e=>e.score);  
  var out=JSON.stringify(sorted_table);  
  //document.getElementById("out").innerHTML=PrintMyTable(sorted_table);  
  //document.body.innerHTML="<pre>"+out;  
  console.log(out);  
};

var xhr_get=(url,ok,err)=>{
  var req=(url.substr(0,"https".length)=="https"?https:http).get(url,(res)=>{
    var statusCode=res.statusCode;var contentType=res.headers['content-type'];var error;
    if(statusCode!==200){error=new Error('Request Failed.\nStatus Code: '+statusCode);}
    if(error){err(error.message);res.resume();return;}
    //res.setEncoding('utf8');
    var rawData='';res.on('data',(chunk)=>rawData+=chunk);
    res.on('end',()=>{try{ok(rawData);}catch(e){err(e.message);}});
  }).on('error',(e)=>{err('Got error: '+e.message);});
  return req;
}

xhr_get("http://russianaicup.ru/2017_R2_games.log",make_top_great_again,()=>{console.log("no way")});
