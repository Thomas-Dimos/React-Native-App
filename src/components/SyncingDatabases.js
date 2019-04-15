import React,{Component} from 'react';
import {StyleSheet, View, Text, ActivityIndicator } from 'react-native';

export default class SyncingDatabases extends Component {

    render(){
        return (
            <View style={styles.syncing}>
                <Text style = {{fontSize: 18}}>
                    Syncing Databases
                </Text>
                <ActivityIndicator size = {50} color="#0000ff" />
            </View>
        )
    }
}

styles = {
    syncing: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#474747',
    }
}