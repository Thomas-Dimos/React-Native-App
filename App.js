/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

// USE A STATE MANAGER TO HANDLE GLOBAL APP STATE (LIKE RENDERING THE RELOADING BAR FROM WHEREVER)
import React, {Component} from 'react';
import { createStackNavigator, createAppContainer, NavigationActions,createSwitchNavigator } from "react-navigation";
import Routes from './src/Routes';
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';

const MainAppNavigator = createStackNavigator(Routes.mainApp,{headerMode: 'screen'});

const AuthNavigator = createStackNavigator(Routes.Authentication);

const AppContainer = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    MainApp: MainAppNavigator,
    Authentication: AuthNavigator
  },
  {
    headerMode: 'screen',
    initialRouteName:'AuthLoading'
  }
));

export default class App extends Component {

  render() {
    return (
      <AppContainer 
       // ref = {nav => {
      //    this.navigator = nav;
      //  }}
      />
    );
  }
}


//screenProps = {this.state.isSyncing}