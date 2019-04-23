import React, {Component} from 'react';
import {View, Text,TouchableHighlight,ScrollView,StyleSheet } from 'react-native';
import HttpRequest from '../HTTPRequest';
import Loading from '../components/Loading';

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

    componentDidMount(){
        HttpRequest.sendHTTPRequest('GET','http://192.0.3.76:9999/User/Events',this.user,null).then((res) =>{
            this.items = res.response;
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