import React,{Component} from 'react';
import {StyleSheet, Text } from 'react-native';

export default class DisplayError extends Component {

    constructor(props){
        super(props);
    }

    render(){
        return (
                <Text style = {styles.error}>
                    {this.props.errorToDisplay}
                </Text>
        )
    }
}

const styles = StyleSheet.create({
    error: {
        color: '#CD0000',
        fontSize: 18,
        fontFamily: 'system-ui',
        textAlign: 'center',
    }

});
