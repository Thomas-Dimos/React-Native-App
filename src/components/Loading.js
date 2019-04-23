import React,{Component} from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';

export default class Loading extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            isShowing: this.props.visible
        }
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        if (state.isShowing !== props.visible){
            newState.isShowing = props.visible;
        }

        return newState;
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.isShowing !== this.state.isShowing){
            this.setState({isShowing : !this.state.showLoading});
        }
    }

    render(){
        return (
            <Modal
                transparent = {true}
                visible = {this.state.isShowing}
            >
                <View style={styles.syncing}>
                    <Text style = {{fontSize: 18,fontWeight: 'bold'}}>
                        {this.props.text}
                    </Text>
                    <ActivityIndicator size = {50} color="#0000ff" />
                </View>
            </Modal>     
        ) 
    }
}

styles = {
    syncing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    }
}