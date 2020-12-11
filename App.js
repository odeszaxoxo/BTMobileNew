/* eslint-disable react/no-did-mount-set-state */
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';

import SignInScreen from './src/scenes/AuthFlow/SignIn/SignInScreen';
import AuthLoadingScreen from './src/scenes/AuthFlow/AuthLoadingScreen/AuthLoadingScreen';
import Scenes from './src/scenes/ScenesList/ScenesList';
import AgendaList from './src/scenes/Agenda/AgendaList';
import Settings from './src/scenes/Settings/Settings';
import jsonData from './src/data/data1.json';
import NotificationService from './src/services/NotificationService';
import NotificationServiceLong from './src/services/NotificationServiceLong';
import appConfig from './app.json';
import Datepicker from './src/scenes/Datepicker/Datepicker';
import Create from './src/scenes/Create/Create';
import Edit from './src/scenes/Edit/Edit';

const AppStack = createStackNavigator({
  Agenda: AgendaList,
  Scenes: Scenes,
  Settings: Settings,
  Datepicker: Datepicker,
  Create: Create,
  Edit: Edit,
});

const AuthStack = createStackNavigator(
  {SignIn: SignInScreen},
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#000',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  },
);

const SwitchNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#1E151A',
      },
      headerTintColor: '#1E151A',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  },
);

const AppContainer = createAppContainer(SwitchNavigator);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: jsonData,
      dataAPI: {},
      senderId: appConfig.senderID,
      scenes: {
        1: 'Историческая сцена',
        2: 'Новая сцена',
        3: 'Бетховенский зал',
        4: 'Верхняя сцена',
        5: 'Балетный зал',
      },
      smallTime: 'key0',
      bigTime: 'key0',
      bigCheck: true,
      smallCheck: true,
      username: null,
    };
    this.notif = new NotificationService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
    this.notifLong = new NotificationServiceLong(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );
  }

  getUserPrefs = async () => {
    try {
      const small = JSON.parse(await AsyncStorage.getItem('smallCheck'));
      this.setState({smallCheck: small});
      const big = JSON.parse(await AsyncStorage.getItem('bigCheck'));
      this.setState({bigCheck: big});
      const smallTime = await AsyncStorage.getItem('smallTime');
      this.setState({smallTime: smallTime});
      const bigTime = await AsyncStorage.getItem('bigTime');
      this.setState({bigTime: bigTime});
      const token = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({usertoken: token});
      return [small, big, smallTime, bigTime, token];
    } catch (error) {
      console.log(error.message);
    }
  };

  onRegister(token) {
    console.log('Registered !', JSON.stringify(token));
    console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
    console.log(notif.title, notif.message);
  }

  render() {
    return <AppContainer />;
  }
}
