import React, {Component} from 'react';
import {StyleSheet, View, Text,TouchableHighlight, ScrollView, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DisplayError from '../components/DisplayError';
import HttpRequest from '../HTTPRequest';
import localDatabase from '../SQLiteDatabase';
import NetInfo from "@react-native-community/netinfo";

// Add password Mismatch error
// test no internet connection registration


export default class SignupScreen extends React.Component{
    
    constructor(){

        super();
        this.state = {
            username: '',
            password: '',
            passwordConfirmation: '',
            passwordMismatch: false,
            emptyUsername: false,
        }
        
    }

    registerUser = () => {
        if(this.checkRestrictions()){
            const userInfo = {username: this.state.username, password: this.state.password};
            NetInfo.isConnected.fetch().then((isConnected) => {
                if(!isConnected) {
                    Alert.alert('You must be connected to the Internet in order to register');
                    this.props.navigation.navigate('LoginScreen');
                    return;
                }
                HttpRequest.sendHTTPRequest('POST','http://192.0.3.76:9999/User/sign-up','',userInfo).then((res)=>{
                    if (res.status === 200){
                        localDatabase.registerUser(this.state.username);
                        this.props.navigation.navigate('LoginScreen');
                    }
                }).catch((rej) => {
                    this.clearInputFields();
                    Alert.alert(rej.response);
                    if(rej.status === 432){
                       return;
                    }
                    this.props.navigation.navigate('LoginScreen');
                });
            }).catch((rej) => {
                Alert.alert('Unexpected Error occurred please try again');
                this.props.navigation.navigate('LoginScreen');
                return;
            });
        }else{
            return;
        }
    }

    displayError = (errorMessage) => {
        setTimeout(() => {
            this.setState({passwordMismatch: false, emptyUsername: false});
        },4000);

        return (
            <View style = {{marginTop: 2, alignItems: 'center'}}>
                <DisplayError errorToDisplay = {errorMessage}/>
            </View>
        )
        
    }
    
    clearInputFields = () => {
        this.textInputUsername.clear();
        this.textInputPassword.clear();
        this.textInputPasswordConfirmation.clear();
    }

    checkRestrictions = () => {
        if(this.state.password !== this.state.passwordConfirmation){
            this.setState({passwordMismatch: true});
            return false;
        }else if (!this.state.username){
            this.setState({emptyUsername: true});
            return false;
        }
        return true;
    }
    
    render() {

        return(

            <View style = {styles.mainContainer}>
                <ScrollView contentContainerStyle = {styles.scrollViewContainer} >

                    {
                        this.state.emptyUsername  
                        ? this.displayError('Error registering: Username is empty')
                        : (this.state.passwordMismatch ?this.displayError('Error registering: Passwords are mismatching'):null)
                    }
                    
                    <Text style = {styles.title}>
                        Register new user
                    </Text>

                    <Text style = {styles.text}>
                        Username:
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

                    <Text style = {styles.text}>
                        Password:
                    </Text>

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


                    <Text style = {styles.text}>
                        Confirm Password:
                    </Text> 

                    <TextInput ref = {input => {this.textInputPasswordConfirmation = input}}
                        style = {styles.input}
                        underlineColorAndroid = 'transparent'
                        placeholder = 'Confirm Password'
                        placeholderTextColor = '#66CDAA'
                        autoCapitalize = 'none'
                        secureTextEntry = {true}
                        onChangeText = {(text) =>{
                            this.setState({passwordConfirmation: text})
                        }}
                        />
            

                    <TouchableHighlight style={styles.button} onPress={this.registerUser} underlayColor='#00CD3F'>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableHighlight>

                </ScrollView>
            </View>
        )
    }

}

const styles = StyleSheet.create({

    mainContainer: {
        flexDirection: 'column',
        flex: 1
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
        marginTop: '10%',
    },

    text: {
        alignSelf: 'flex-start',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: '#458B74',
        marginTop: '10%',
        marginLeft: '15%',
    },

    input: {
        borderWidth: 1,
        borderColor : '#66CDAA',
        borderRadius: 3,
        alignSelf: 'stretch',
        marginHorizontal: '15%',
        height: 40,
    },

    button: {
        backgroundColor: '#458B74',
        borderColor: '#458B74',
        borderWidth: 1,
        borderRadius: 15,
        alignSelf: 'center',
        paddingHorizontal: '15%',
        paddingVertical: 2,
        marginTop: '15%'
    },
    
    buttonText: {
        textAlign: 'center',
        fontSize: 18,
    }

});