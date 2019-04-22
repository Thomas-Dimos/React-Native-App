import React, {Component} from 'react';
import {View, Text,TouchableHighlight,ScrollView } from 'react-native';
import HttpRequest from '../HTTPRequest';
import Loading from '../components/Loading';

class EventVisualizationItem extends Component{

    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style = {{justifyContent: "space-evenly"}}>
                <Text>
                    {
                        this.props.event
                    }
                </Text>
            </View>
        )
    }
}

export default class UserEventsScreen extends Component {

    constructor(){
        super();
        this.state = {
            dataFetched: false,
        }
        this.user = this.props.navigation.getParam('user');
        this.items = [];
    }

    componentDidMount(){
        HttpRequest.sendHTTPRequest('GET','http://192.0.3.76:9999/User/Events',this.user,null).then((res) =>{
            for (let i = 0; i < res.response.length; i++){
                item = JSON.parse(res.response[i]);
                this.items[i].push(item);
            }
            this.setState({dataFetched: true});
        });
    }

    render(){
        if(!this.state.dataFetched){
            return (
                <Loading visible= {!this.state.dataFetched} text = " Fetching data "/>
            )
        }
        return(

            <View style = {styles.mainContainer}>
                <ScrollView>
                    {
                        this.items.map((item) =>
                            (
                                <EventVisualizationItem event = {item}/>
                            ))
                    }
                </ScrollView>
            </View>
            
            
        )
    }
}