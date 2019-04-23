import { RNCamera } from 'react-native-camera';
import {StyleSheet, View, Alert } from 'react-native';
import React, {Component} from 'react';
import Event from '../events/Event';
import localDatabase from '../SQLiteDatabase';
import HttpRequest from '../HTTPRequest';
import NetInfo from "@react-native-community/netinfo";

//Fix Netinfo dependence by using a state manager

export default class QRScanningScreen extends React.Component{

    constructor(){
        super();
    }
    static navigationOptions = {
        header: null
    }
    
    sendBarcodeEvent = async (barcodes) => {
        QREvent = new Event (barcodes[barcodes.length-1].data,'QREvent');
        let lastEventID;
        let isConnected;
        let user;
        
        try {
            location = await QREvent.getLocation();
            QREvent.setLocation(location);
            QREvent.setEventsTimestamp(QREvent.getEventsTimestamp());
            user =  this.props.navigation.getParam('title');
            await localDatabase.registerEvent(user,QREvent);
            lastEventID =  await localDatabase.getLastEventID();
            isConnected = await NetInfo.isConnected.fetch();
            if(!isConnected) {
                localDatabase.registerUnsentEvent(lastEventID);
                this.camera.resumePreview();
                return;
            }
        } catch (error) {
            console.log(error);
            return;
        }
        HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/Events/new',user,QREvent).then((res) =>{
            if (res.status === 200){
                Alert.alert('QR Event was successfully stored in database');
            }
        }).catch((rej) => {
            localDatabase.registerUnsentEvent(lastEventID);
            Alert.alert(rej.response);
        });
        this.camera.resumePreview();
    }

    render(){
        return(
            <View style= {styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                      }}
                      style={styles.preview}
                      type={RNCamera.Constants.Type.back}
                      flashMode={RNCamera.Constants.FlashMode.auto}
                      captureAudio = {false}
                      permissionDialogTitle={'Permission to use camera'}
                      permissionDialogMessage={'We need your permission to use your camera phone'}
                      onGoogleVisionBarcodesDetected={({ barcodes }) => {
                        this.camera.pausePreview();
                        this.sendBarcodeEvent(barcodes);
                        }}
                    />
            </View>
        );
    }

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});