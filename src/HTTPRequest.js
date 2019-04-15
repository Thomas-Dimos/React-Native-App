import AsyncStorage from '@react-native-community/async-storage';
import Event from './events/Event';
import localDatabase from './SQLiteDatabase';

class HTTPRequest{

    constructor(){

    }

    //deleted async
    sendHTTPRequest = (method,URL,data) => new Promise ((resolve,reject) => {
        const request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
            if (request.readyState !== 4){
                return;
            }
            if (request.status === 200) {
               resolve({status: 200, response: request.response});
            }else if (request.status === 498){ //token expired
                AsyncStorage.getItem('currentUser').then(async (user) => {
                    try{
                        refreshToken = await localDatabase.getToken(user,'refreshToken');
                        this.sendHTTPRequest('GET','http://192.0.3.76:9999/User/refresh',refreshToken).then(async (res) => {
                            await localDatabase.updateUserAccessToken(user,res.response);
                            this.sendHTTPRequest(method,URL,data).then((res) => {
                                resolve({status: 200, response: res});
                            });
                        }).catch((rej) => {
                            Alert.alert(rej);
                        })
                    }catch(err){
                        console.log(err);
                    }      
                })
            }else{
                reject({status: request.status, response: request.response});
            }
        }
        request.open(method,URL,true);
        if(data instanceof Event){
            AsyncStorage.getItem('currentUser').then((username) => {
                localDatabase.getToken(username,'accessToken').then((accessToken) => {
                    request.setRequestHeader('x-access-token',accessToken);
                    request.setRequestHeader('Content-Type','application/json');
                    request.send(data.dataToJSON());
                });
            });
        }else if (typeof(data) === 'string'){
            console.log("refreshToken is sent");
            request.setRequestHeader('x-access-token',data);
            request.send();
        }else{
            request.setRequestHeader('Content-Type','application/json');
            dataToSend = JSON.stringify(data);
            request.send(dataToSend);
        }
   });

}

const HttpRequest = new HTTPRequest();
export default HttpRequest;