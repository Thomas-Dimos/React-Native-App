import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export default class AuthLoadingScreen extends Component{

    componentDidMount(){
      AsyncStorage.getItem('currentUser').then((username) => {
        this.props.navigation.navigate(username? 'MainApp':'Authentication');
      })
    }
    render(){
      return null;
    }
  }