function pushGithub(path,content){

const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
const repo="Maccen-Prop/listing-site";

const api="https://api.github.com/repos/"+repo+"/contents/"+path;

let sha=null;

try{

let res=UrlFetchApp.fetch(api,{
method:"get",
headers:{Authorization:"token "+token},
muteHttpExceptions:true
});

let json=JSON.parse(res.getContentText());

if(json.sha){
sha=json.sha;
}

}catch(e){}

let payload={
message:"auto update listing",
content:Utilities.base64Encode(content)
};

if(sha){
payload.sha=sha;
}

let options={
method:"put",
headers:{Authorization:"token "+token},
contentType:"application/json",
payload:JSON.stringify(payload),
muteHttpExceptions:true
};

UrlFetchApp.fetch(api,options);

}
