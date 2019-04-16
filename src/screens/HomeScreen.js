import React, {Component} from 'react';
import {StyleSheet, View,TouchableOpacity,Image, Text, ActivityIndicator,PermissionsAndroid,BackHandler } from 'react-native';
import localDatabase from '../SQLiteDatabase';
import SyncingDatabases from '../components/SyncingDatabases'
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";


export default class HomeScreen extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            renderMap: false,
            isSyncing: false,
            showLoading: false
        }
        previousState = '';
        //localDatabase.dropTables();
    }
    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam('title'),
            headerLeft: (

                    <Image 
                    style = {{flex:1,width:40,height:30}}
                    source = { require('../icons/user.png') }
                    resizeMode = 'contain'
                    />

            ),
            headerRight: (
                <TouchableOpacity style = {{flex:1}}
                    onPress = {navigation.getParam('logout')}>
                    <Image 
                    style = {{width:45,height:35}}
                    source = { require('../icons/logout.png') }
                    resizeMode = 'contain'
                    />
                </TouchableOpacity>
            ),
            headerRightContainerStyle: {marginRight: '2%'},
            headerLeftContainerStyle: {marginLeft: '2%'},
            headerTitleStyle: {flex:1,textAlign: 'center'}
        }
    }

    componentDidMount() {
        this.requestLocationPermission().then(() => {
            AsyncStorage.getItem('currentUser').then((username) => {
                this.props.navigation.setParams({title: username});
                this.props.navigation.setParams({logout: this.signOut});
                NetInfo.addEventListener('connectionChange',this.handleConnectivityChange);
                this.setState({renderMap: true});
            })
            
        }).catch((error) => {
            console.log('Error getting Permissions to use location');
            return;
        });

    }

    signOut = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Authentication');
    }

    /*
    //Usefull if you need to pass props from AppContaniner to all screens

    static getDerivedStateFromProps(nextProps, prevState){
        //console.log(nextProps);
        if(nextProps.screenProps !== prevState.isSyncing){
            return {isSyncing: nextProps.screenProps};
        }else{
            return null;
        }
    }

    componentDidUpdate (prevProps, prevState) {
        if(prevState.isSyncing !== this.state.isSyncing){
            this.setState({showLoading : !this.state.showLoading});
        }

    }
    */
    render(){
        if(!this.state.renderMap ){
            return null
        }else{
            return (
                <View style={styles.container}>

                    <SyncingDatabases visible= {this.state.showLoading}/>
                    
                    <View style={styles.map}>
    
                    </View>
    
                    <View style={styles.buttons}>
    
                        <TouchableOpacity onPress = {() => this.props.navigation.navigate('BeaconScanningScreen')}>
    
                            <Image
                                style = {{flex: 0.2,aspectRatio: 1.5}}
                                source={require('../icons/beacon_blue.png')}
                                resizeMode = 'contain'
                            />
    
                            <Text style = {{fontSize: 12,position: 'relative',right: 22}}>
                               Beacon scanning
                            </Text>
    
                        </TouchableOpacity>
    
                        <TouchableOpacity onPress = {() => this.props.navigation.navigate('QRscanningScreen')}>
    
                            <Image
                                style = {{flex: 0.2, aspectRatio: 1.5}}
                                source={require('../icons/qr_icon.png')}
                                resizeMode = 'contain'
                            />
    
                            <Text style = {{fontSize: 12,position: 'relative',right: 15}}>
                                QR scanning
                            </Text>
    
                        </TouchableOpacity>
    
                    </View>
                </View>
            ); 
        }
    }

    handleConnectivityChange = (connectionInfo) => {

        if(connectionInfo.type === 'wifi' && previousState !== 'wifi'){
            console.log('Syncing databases');
            localDatabase.isDatabasesSynced(this.props.navigation.getParam('title')).then((res) => {
                if(!res){
                    this.setState({showLoading: true});
                    localDatabase.syncDatabases(this.props.navigation.getParam('title')).then(() => {
                    this.setState({showLoading: false});
                    }).catch(() => {
                            this.setState({showLoading: false});
                            Alert.alert("Some events couldn't be sent");
                    })
                }
            }).catch(() => {
                console.log('Error in handleConnectivity');
            })
      }
      previousState = connectionInfo.type; 
    }
    
    componentWillUnmount() {
        //NetInfo.removeEventListener('connectionChange',this.handleConnectivityChange);
    }

    requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'This App requires location in order to work',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );
            if (granted === PermissionsAndroid.RESULTS.DENIED) {
                this.props.navigation.navigate('Home');
            } 
        } catch (err) {
            Alert.alert(err);
        }
    }

  }


  const styles = StyleSheet.create({

    container: {
        flex: 1,
        flexDirection: 'column',
    },

    map: {
        flex: 3,
    },

    buttons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        marginLeft: 40,
    },
  });