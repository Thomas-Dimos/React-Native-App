import { BleManager, State } from 'react-native-ble-plx';
import Beacons from 'react-native-beacons-manager';
import React, {Component} from 'react';
import { Alert, Button, StyleSheet, View, FlatList, Text, DeviceEventEmitter } from 'react-native';
import Event from '../events/Event';
import localDatabase from '../SQLiteDatabase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NetInfo from "@react-native-community/netinfo";
import HttpRequest from '../HTTPRequest';
import AsyncStorage from '@react-native-community/async-storage';

export default class BeaconScanningScreen extends React.Component {
    constructor() {
        super();
        this.manager = new BleManager();
        this.state = {
            isRenderingButton: false,
            allBeaconDevices: [],
            toggleButton: false,
        }
        this.allBeacons = [];
        beaconsDidRangeEvent = null;
    }

    startScanning = async () => {
        this.setState({isRenderingButton: true});
        await Beacons.startRangingBeaconsInRegion('Region1');
    }

    pressedOk = async () => {
        await this.manager.enable();
        this.startScanning();
    }

    pressedCancel = () => {
        this.props.navigation.navigate('Home');
    }

    requestToEnableBluetooth = async () => {
       const currState =  await this.manager.state();
       if(currState === State.PoweredOff){
            Alert.alert('Bluetooth is currently disabled to continue you must enable it','Do you want to enable Bluetooth',[
                {text: 'Cancel', onPress: this.pressedCancel, style: 'cancel' },
                {text: 'OK', onPress: this.pressedOk}
            ],{cancelable: false},
            );
       }else if (currState === State.PoweredOn) {
           this.startScanning();
       }
    }

    registerBeaconRangingEvents = () => {
        this.beaconsDidRangeEvent = DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
           // this.allBeacons = [];
            data.beacons.forEach(beacon => {
                if(!this.allBeacons.some(e => {
                    if(beacon.protocol === 'IBeacon'){
                        return (e.major === beacon.major && e.minor === beacon.minor)
                    }
                    return e.instanceId === beacon.instanceId
                })){
                    if(beacon.protocol === 'IBeacon'){
                        this.allBeacons.push({uuid: beacon.uuid, major: beacon.major, minor: beacon.minor});
                    }else{
                        this.allBeacons.push({uuid: beacon.uuid, instanceId: beacon.instanceId})
                    }
                    this.setState({allBeaconDevices: this.allBeacons});
                }
                /*
                if(beacon.protocol === 'IBeacon'){
                    this.allBeacons.push({key: beacon.uuid, key1: beacon.major, key2: beacon.minor});
                }else{
                    this.allBeacons.push({key: beacon.uuid, key1: beacon.instanceId})
                }
                this.setState({allBeaconDevices: this.allBeacons});*/
            });
        });
    }

    buttonPress = async () => {
        if(!this.state.toggleButton){
            await Beacons.stopRangingBeaconsInRegion('Region1');
            //this.allBeacons = [];

    
        }else{
            this.startScanning();
        }
        this.setState((previousState) => {
            return {
                toggleButton: !previousState.toggleButton
            }
        });

    }

    renderItems = ({item}) => {
        if(item.minor){
            return (
                <TouchableOpacity onPress = { ()=> {const selectedBeacon =`${item.uuid}/${item.major}/${item.minor}`;this.sendBeaconEVent(selectedBeacon)}}>
                    <Text style = {styles.item}>
                        {item.uuid} --- {item.major} --- {item.minor}
                    </Text>
                </TouchableOpacity>
            
            );
        }
            return (
                <TouchableOpacity onPress = { ()=> {const selectedBeacon = `${item.uuid}/${item.instanceId}`;this.sendBeaconEVent(selectedBeacon)}}>
                    <Text style = {styles.item}>
                        {item.uuid} --- {item.instanceId}
                    </Text>
                </TouchableOpacity>
            );
        
    }

    sendBeaconEVent = async (beacon) => {
        beaconEvent = new Event(beacon,'BeaconEvent');
        let lastEventID;
        try {
            location = await beaconEvent.getLocation();
            beaconEvent.setLocation(location);
            beaconEvent.setEventsTimestamp(beaconEvent.getEventsTimestamp());
            const user =  await AsyncStorage.getItem('currentUser');
            await localDatabase.registerEvent(user,beaconEvent);
            lastEventID =  await localDatabase.getLastEventID();
            isConnected = await NetInfo.isConnected.fetch();
            if(!isConnected) {
                localDatabase.registerUnsentEvent(lastEventID);
                return;
            }
        } catch (error) {
            console.log(error);
            return;
        }
        HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/BeaconEvents/new',beaconEvent).then((res) =>{
            if (res.status === 200){
                
                Alert.alert('Beacon Event was successfully stored in database');
            }
        }).catch((rej)=>{
            localDatabase.registerUnsentEvent(lastEventID);
            Alert.alert(rej.response);
            return;
        });
    }

    render(){
        const buttonTitle = !this.state.toggleButton ? 'Stop Scanning' : 'Start Scanning';
        const buttonColor = !this.state.toggleButton ? 'red' : 'darkblue' ;
        let i =0;
        if(!this.state.isRenderingButton){
            return null;
        }
        if(this.state.allBeaconDevices.length > 0 || this.state.isRenderingButton){
            return(
                <View style={styles.container}>

                    <View style ={styles.flatlist}>
                        <FlatList data={this.state.allBeaconDevices}
                        extraData = {this.state}
                        renderItem = {this.renderItems}
                        keyExtractor = {item => (i++).toString()}
                        />
                    </View>
                    
                    <View style ={styles.buttonStyle}>
                        <Button
                            onPress = {this.buttonPress}
                            title = {buttonTitle}
                            color = {buttonColor}
                        />
                    </View>
                </View>
            );
        }
    }

    componentDidMount() {
        this.registerBeaconRangingEvents();
        this.requestToEnableBluetooth();
    }

    componentWillUnmount() {
        Beacons.stopRangingBeaconsInRegion('Region1').then(() => {this.beaconsDidRangeEvent.remove();});
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    flatlist: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
    },
    buttonStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    item: {
        fontSize: 13,
    },
});

