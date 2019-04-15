import Geolocation from 'react-native-geolocation-service';

export default class Event {

    constructor(data,eventType){
        this.data = data;
        this.eventType = eventType;
    }

    getLocation = () => new Promise((resolve,reject)=> {
        Geolocation.getCurrentPosition(
            (position) => {
               resolve(position);
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    })

    setLocation = (location) => {
        this.location = location;
    }

    getEventsTimestamp = () => {
        curDate = new Date();
        return `${curDate.getDate()}/${curDate.getMonth()+1}/${curDate.getFullYear()} @ ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`
    }

    setEventsTimestamp = (timestamp) => {
        this.timestamp = timestamp;
    }

    dataToJSON = () => {
        const data = {"timeStamp": this.timestamp,"location": this.location.coords,"data":this.data};
        return JSON.stringify(data);
    }

}


