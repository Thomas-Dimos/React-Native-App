import HomeScreen from "./screens/HomeScreen";
import QRScanningScreen from "./screens/QRScanningScreen";
import BeaconScanningScreen from "./screens/BeaconScanningScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import UserEventsScreen from "./screens/UserEventsScreen";

export default Routes = {
    mainApp: {
        Home:{
            screen: HomeScreen,
        },
        QRscanningScreen: {
            screen: QRScanningScreen
        },
        BeaconScanningScreen: {
            screen: BeaconScanningScreen
        },
        UserEventsScreen: {
            screen: UserEventsScreen
        },
    },

    Authentication: {
        LoginScreen: {
            screen: LoginScreen
        },
        SignupScreen: {
            screen: SignupScreen
        }
    }  
}