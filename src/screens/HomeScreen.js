import React, {Component} from 'react';
import {StyleSheet, View,TouchableOpacity,Image, Text,PermissionsAndroid,Alert } from 'react-native';
import localDatabase from '../SQLiteDatabase';
import Loading from '../components/Loading'
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";

//Pass Netinfo state from this screen to all others by setParam so they don't need to check the wifi state

class HeaderTitle extends Component {

    constructor(props){
        	super(props);
    }

    render(){
        return (
            <TouchableOpacity
            style = {{flex:1,alignItems: 'center'}}
            onPress = {() => this.props.navigation.navigate('UserEventsScreen',{user: this.props.title})}
            >
                <Text style = {{fontWeight: 'bold',fontSize: 18,fontFamily:'sans-serif'}}>
                    {this.props.title}
                </Text>
            </TouchableOpacity>
        )
    }

}


export default class HomeScreen extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            renderMap: false,
            isSyncing: false,
            showLoading: false
        }
        previousState = '';
        const userIcon = require('../icons/user.png');
        const logoutIcon = require('../icons/logout.png');
        this.props.navigation.setParams({userIcon: userIcon});
        this.props.navigation.setParams({logoutIcon: logoutIcon});
        this.beaconIcon = require('../icons/beacon_blue.png');
        this.QRIcon = require('../icons/qr_icon.png');
        //localDatabase.dropTables();
    }
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: <HeaderTitle navigation = {navigation} title = {navigation.getParam('title')}/>,
            headerLeft: (

                    <Image 
                    style = {{flex:1,width:40,height:30}}
                    source = {navigation.getParam('userIcon')}
                    resizeMode = 'contain'
                    />

            ),
            headerRight: (
                <TouchableOpacity style = {{flex:1}}
                    onPress = {navigation.getParam('logout')}>
                    <Image 
                    style = {{width:45,height:35}}
                    source = {navigation.getParam('logoutIcon')}
                    resizeMode = 'contain'
                    />
                </TouchableOpacity>
            ),
            headerRightContainerStyle: {marginRight: '2%'},
            headerLeftContainerStyle: {marginLeft: '2%'}
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

                    <Loading visible= {this.state.showLoading} text = "Syncing Databases"/>
                    
                    <View style={styles.map}>
    
                    </View>
    
                    <View style={styles.buttons}>
    
                        <TouchableOpacity onPress = {() => this.props.navigation.navigate('BeaconScanningScreen',{title: this.props.navigation.getParam("title")})}>
    
                            <Image
                                style = {{flex: 0.2,aspectRatio: 1.5}}
                                source={this.beaconIcon}
                                resizeMode = 'contain'
                            />
    
                            <Text style = {{fontSize: 12,position: 'relative',right: 22}}>
                               Beacon scanning
                            </Text>
    
                        </TouchableOpacity>
    
                        <TouchableOpacity onPress = {() => this.props.navigation.navigate('QRscanningScreen',{title: this.props.navigation.getParam("title")})}>
    
                            <Image
                                style = {{flex: 0.2, aspectRatio: 1.5}}
                                source= {this.QRIcon}
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
                    localDatabase.getToken(this.props.navigation.getParam('title'),'accessToken').then((accessToken) => {
                        localDatabase.syncDatabases(this.props.navigation.getParam('title'),this.accessToken).then(() => {
                            this.setState({showLoading: false});
                            }).catch(() => {
                                    this.setState({showLoading: false});
                                    Alert.alert("Some events couldn't be sent");
                            })
                        }).catch((err) => {
                            console.log(err);
                            return;
                        });
                    
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