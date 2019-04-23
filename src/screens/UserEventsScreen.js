import React, {Component} from 'react';
import {View, Text,TouchableHighlight,ScrollView,StyleSheet } from 'react-native';
import HttpRequest from '../HTTPRequest';
import Loading from '../components/Loading';
import localDatabase from '../SQLiteDatabase';
import NetInfo from "@react-native-community/netinfo";

//TODO USE THIS COMPONENT TO RENDER EACH ITEM
class EventVisualizationItem extends Component{

    constructor(props){
        super(props);
    }

    render(){
        return(
            <Text>
                {
                    this.props.event
                }
            </Text>

        )
    }
}

export default class UserEventsScreen extends Component {

    constructor(props){
        super(props);
        this.state = {
            dataFetched: false,
        }
        this.user = this.props.navigation.getParam('user');
    }

    async componentDidMount(){
        try{
            const isConnected = await NetInfo.isConnected.fetch();
            if(!isConnected) {
               this.items = await localDatabase.getUserEvents(this.user);
               this.items = JSON.stringify(this.items,null,'\t');
               this.setState({dataFetched: true});
            }else{
                HttpRequest.sendHTTPRequest('GET','http://192.0.3.76:9999/User/Events',this.user,null).then((res) =>{
                    this.items = res.response;
                    this.setState({dataFetched: true});
                 });
            }
        }catch(err){
            console.log(err);
            return;
        }
    }

    render(){
        if(!this.state.dataFetched){
            return (
                <Loading visible= {!this.state.dataFetched} text = " Fetching data "/>
            )
        }
        return(

            <View style = {styles.mainContainer}>
                <ScrollView style = {styles.scrollView}>
                    <Text>
                        {
                            this.items
                        }
                    </Text>
                </ScrollView>
            </View>
            
            
        )
    }
}

const styles = StyleSheet.create({

    mainContainer: {
        flexDirection: 'column',
        flex: 1,
    }
});