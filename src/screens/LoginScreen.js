import React, {Component} from 'react';
import {StyleSheet, View, Text,TouchableHighlight,ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import HttpRequest from '../HTTPRequest';
import localDatabase from '../SQLiteDatabase';
import NetInfo from "@react-native-community/netinfo";


export default class LoginScreen extends React.Component{
    
    constructor(){
        super();
        this.state = {
            username: '',
            password: ''
        }

        
    }

    userSignin = () => {
        if((this.state.username === 'tom' && this.state.password === 'dimos')){
            this.props.navigation.navigate('MainApp');
            return;
        }
        const userInfo = {username: this.state.username, password: this.state.password};
        NetInfo.isConnected.fetch().then((isConnected) => {
            if(!isConnected) {
                Alert.alert('You must be connected to the Internet in order to register');
                this.props.navigation.navigate('LoginScreen');
                return;
            }
            HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/log-in',userInfo).then(async (res) => {
            if (res.status === 200){
                const tokens = JSON.parse(res.response);
                localDatabase.updateUserTokens(this.state.username,tokens);
                await AsyncStorage.setItem('currentUser', this.state.username +'');
                this.props.navigation.navigate('MainApp');
            }
            }).catch((rej) => {
                this.clearInputFields();
                Alert.alert(rej.response);
                return;
            });
        })
        //prepare http request
    }

    userSignup = () => {
        this.props.navigation.navigate('SignupScreen');
    }

    clearInputFields = () => {
        this.textInputUsername.clear();
        this.textInputPassword.clear();
    }
    
    render() {
        return(

            <View style = {styles.mainContainer}>
            
                <ScrollView contentContainerStyle = {styles.scrollViewContainer}>

                    <Text style = {styles.title}>
                        Login
                    </Text>

                    <TextInput ref = {input => {this.textInputUsername = input}}
                        style = {styles.input}
                        underlineColorAndroid = 'transparent'
                        placeholder = 'Username'
                        placeholderTextColor = '#66CDAA'
                        autoCapitalize = 'none'
                        onChangeText = {(text) =>{
                            this.setState({username: text})
                        }}
                    />

                    <TextInput ref = {input => {this.textInputPassword = input}}
                        style = {styles.input}
                        underlineColorAndroid = 'transparent'
                        placeholder = 'Password'
                        placeholderTextColor = '#66CDAA'
                        autoCapitalize = 'none'
                        secureTextEntry = {true}
                        onChangeText = {(text) =>{
                            this.setState({password: text})
                        }}
                     />
                

                    <TouchableHighlight style={styles.button1} onPress={this.userSignin} underlayColor='#00CD3F'>
                        <Text style={styles.buttonText}>Signin</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={styles.button2} onPress={this.userSignup} underlayColor='#00CD3F'>
                        <Text style={styles.buttonText}>Signup</Text>
                    </TouchableHighlight>

                </ScrollView>

            </View>
        )
    }

}

const styles = StyleSheet.create({

    mainContainer: {
        flexDirection: 'column',
        flex: 1,
    },

    scrollViewContainer: {
        flexDirection: 'column',
        alignItems: 'center'
    },

    title: {
        color: '#458B74',
        fontSize: 23,
        fontFamily: 'sans-serif',
        textShadowColor: '#00FFE7',
        textShadowRadius: 2,
        marginTop: '20%',
    },


    input: {
        borderWidth: 1,
        borderColor : '#66CDAA',
        borderRadius: 3,
        alignSelf: 'stretch',
        marginHorizontal: '15%',
        marginTop: '10%',
        height: 40,
    },

    button1: {
        backgroundColor: '#458B74',
        borderColor: '#458B74',
        borderWidth: 1,
        borderRadius: 15,
        alignSelf: 'center',
        paddingHorizontal: '15%',
        paddingVertical: 2,
        marginTop: '15%'
    },

    button2: {
        backgroundColor: '#458B74',
        borderColor: '#458B74',
        borderWidth: 1,
        borderRadius: 15,
        alignSelf: 'center',
        paddingHorizontal: '14.3%',
        paddingVertical: 2,
        marginTop: 20,
    },
    
    buttonText: {
        textAlign: 'center',
        fontSize: 18,
    }

});