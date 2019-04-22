import SQLite from 'react-native-sqlite-storage';
import Event from './events/Event';
import HttpRequest from './HTTPRequest';

//Maybe need to make registerUnsentEvent to return a promise

 class SQLiteDatabase {

    constructor() {
        this.initDatabase();
    }

    onOpened = () => {
        console.log('Database has opened sucessfully');
    }

    onError = () => {
        console.log('Error opening Database');
    }

    seeEventDatabase = (tx) => {
        
        tx.executeSql('SELECT * FROM Event ',[],(tx,results) => {
            for (let i = 0; i < results.rows.length; i++) {
                console.log(results.rows.item(i));
            }
        });
    }

    /*seeUnsentEventDatabase = () => {
        this.db.transaction((tx) => {
            tx.executeSql('SELECT * FROM UnsentEvents ',[],(tx,results) => {
                for (let i = 0; i < results.rows.length; i++) {
                    console.log(results.rows.item(i));
                }
            })
        });
    }*/

    isDatabasesSynced = (user) => new Promise ((resolve,reject) => {
        this.db.transaction((tx) => {
            tx.executeSql(`SELECT Event_id FROM Event,UnsentEvents WHERE Event_id = UnsentEvent_id AND user = "${user}" LIMIT 1`,[],(tx,results) => {
                if(results.rows.length === 0){
                    console.log('Databases are synchronized');
                    resolve(true);
                }else{
                    resolve(false);
                }
            },() => reject());
        });
    })

    syncDatabases = (user) => new Promise ((resolve,reject) => {
        let eventsSynced = 0;
        this.db.transaction((tx) => {
            tx.executeSql(`SELECT Event_id, eventType, timeStamp, speed, heading, accuracy, altitude, longitude, latitude, data FROM Event,UnsentEvents WHERE Event_id = UnsentEvent_id AND user = "${user}"`,[],(tx,results) => {
                if(results.rows.length === 0){
                    console.log('Databases are synchronized');
                    resolve();
                    return;
                }

                for(let i = 0; i < results.rows.length; i++ ){
                    const newEvent = new Event(results.rows.item(i).data,results.rows.item(i).eventType);
                    newEvent.setLocation({coords: {speed: results.rows.item(i).speed,heading: results.rows.item(i).heading, accuracy: results.rows.item(i).accuracy, altitude: results.rows.item(i).altitude, longitude: results.rows.item(i).longitude, latitude: results.rows.item(i).latitude}});
                    newEvent.setEventsTimestamp(results.rows.item(i).timeStamp);

                    if(results.rows.item(i).eventType === 'QREvent'){
                        HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/Events/sync',user,newEvent).then((res) => {
                            if(res.status === 200){
                                this.deleteSendEvent(results.rows.item(i).Event_id);
                                eventsSynced ++;
                                if( eventsSynced === results.rows.length ){
                                    resolve();
                                }
                            }
                        }).catch((err) => {
                            console.log("Couldn't send Event with id: " + results.rows.item(i).Event_id);
                            reject();
                        });
                    }else if (results.rows.item(i).eventType === 'BeaconEvent'){
                        HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/Events/sync',user,newEvent).then((res) => {
                            if(res.status === 200){
                                this.deleteSendEvent(results.rows.item(i).Event_id);
                                eventsSynced ++;
                                if( eventsSynced === results.rows.length ){
                                    resolve();
                                }
                            }
                        }).catch((err) => {
                            console.log("Couldn't send Event with id: " + results.rows.item(i).Event_id);
                            reject();
                        });
                    }else{
                        console.log('Unexpected error while preparing to send the Event in syncDatabases');
                        return
                    }
                }
            })
        });
    });

    deleteSendEvent = (sentEventID) => {
        this.db.transaction((tx) => {
            tx.executeSql( `DELETE FROM UnsentEvents WHERE UnsentEvent_id = ${sentEventID}` ,[]);
        },(error) => {console.log(error)});
    }

    initDatabase = () => {
        this.db = SQLite.openDatabase({name: 'EventDatabase', createFromLocation : 1},this.onOpened, this.onError);
        
        this.db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS Event( '
            + 'Event_id INTEGER PRIMARY KEY AUTOINCREMENT,'
            + 'user TEXT REFERENCES User (username) ON DELETE CASCADE,'
            + 'eventType TEXT, '
            + 'timeStamp TEXT, '
            + 'speed INTEGER, '
            + 'heading INTEGER, '
            + 'accuracy FLOAT, '
            + 'altitude FLOAT, '
            + 'longitude FLOAT, '
            + 'latitude FLOAT, '
            + 'data TEXT ); ',[]);

            tx.executeSql('CREATE TABLE IF NOT EXISTS UnsentEvents( '
            + 'UnsentEvent_id INTEGER PRIMARY KEY REFERENCES Event (Event_id) ON DELETE CASCADE); ',[]);

            tx.executeSql('CREATE TABLE IF NOT EXISTS User( '
            + 'username TEXT PRIMARY KEY, '
            + 'accessToken TEXT,'
            + 'refreshToken TEXT ); ',[]);

            console.log('All trasactions are finished');
        },(error)=>{console.log(error)},()=>{
            //this.seeUnsentEventDatabase();
           // console.log("-------------------------");
           // this.seeStuff();
           // this.db.transaction(this.seeEventDatabase);
        });
    }

    dropTables = () => {
        this.db.transaction((tx) => {
            tx.executeSql('DROP TABLE IF EXISTS Event;');
            tx.executeSql('DROP TABLE IF EXISTS UnsentEvents;');
            tx.executeSql('DROP TABLE IF EXISTS User;')
        });
    }

    getLastEventID = () => new Promise ((resolve,reject) => {
        this.db.transaction((tx) => {
            tx.executeSql('SELECT ROWID FROM Event ORDER BY ROWID DESC LIMIT 1',[], (tx,results) => resolve (results.rows.item(0).Event_id))
        },(error) => reject(error));
    })

    getToken = (username,token) => new Promise ((resolve,reject) => {
        this.db.transaction((tx) => {
            tx.executeSql(`SELECT ${token} FROM User WHERE username = "${username}"`,[], 
            (tx,results) => {
                if (token === 'accessToken'){
                    resolve (results.rows.item(0).accessToken);
                }else{
                    resolve (results.rows.item(0).refreshToken);
                }
            })
        },(error) => reject(error));
    })

    registerUnsentEvent = (eventID) => {
        this.db.transaction((tx) => {
            tx.executeSql(`INSERT INTO UnsentEvents (UnsentEvent_id) VALUES (${eventID});`,[]);
        },(error) => {console.log(error)});
    }

    registerUser = (username) => {
        this.db.transaction((tx) => {
            tx.executeSql(`INSERT INTO User (username) VALUES ("${username}");`,[]);
        })
    }

    updateUserTokens = (username,tokens) => {
        this.db.transaction((tx) => {
            tx.executeSql(`UPDATE User SET accessToken = "${tokens.accessToken}", refreshToken = "${tokens.refreshToken}" WHERE username = "${username}";`,[]);
        });
    }

    updateUserAccessToken = (username,accessToken) => new Promise ((resolve,reject) =>{
        this.db.transaction((tx) => {
            tx.executeSql(`UPDATE User SET accessToken = "${accessToken}" WHERE username = "${username}";`,[]);
        },(error) => {
            reject('Error updating Access Token');
        },
        () => {
            resolve();
        });
    })

    registerEvent = (user,event) => new Promise ((resolve,reject) => {
      
        this.db.transaction((tx) => {
            tx.executeSql(`INSERT INTO Event (user, eventType, timeStamp, speed, heading, accuracy, altitude, longitude, latitude, data) VALUES ("${user}", "${event.eventType}", "${event.getEventsTimestamp()}", ${event.location.coords.speed}, ${event.location.coords.heading}, ${event.location.coords.accuracy}, ${event.location.coords.altitude}, ${event.location.coords.longitude}, ${event.location.coords.latitude}, "${event.data}");`,[]);
        },(error)=>{
            reject("Error registering the Event in local Database " + error)
        },
        ()=>{
            this.db.transaction(this.seeEventDatabase);
            resolve();
        });
    });

}

localDatabase = new SQLiteDatabase();
export default localDatabase;