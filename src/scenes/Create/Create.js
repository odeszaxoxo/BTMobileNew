/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, Text, Button, AsyncStorage} from 'react-native';
import {Input} from 'react-native-elements';
import moment from 'moment';
import ReactNativeSettingsPage, {
  SectionRow,
  SwitchRow,
} from 'react-native-settings-page';
import {Item, Picker, Icon} from 'native-base';
import realm from '../../services/realm';
import CalendarPicker from 'react-native-calendar-picker';

export default class CreateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventTitle: '',
      eventDesciption: '',
      selected: undefined,
      scenes: [],
    };
  }
  static navigationOptions = {
    title: 'Создание события',
  };

  componentDidMount() {
    this.getParams();
  }

  getParams = async () => {
    console.log('params');
    try {
      const userToken = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({userToken: JSON.parse(userToken)});
    } catch (error) {
      console.log(error.message);
    }
    var list = [];
    for (var i = 0; i < realm.objects('Scene').length; i++) {
      var item = {
        label: realm.objects('Scene')[i].title,
        value: realm.objects('Scene')[i].id,
        color: realm.objects('Scene')[i].color,
        id: realm.objects('Scene')[i].resourceId,
      };
      list.push(item);
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({scenes: list});
  };

  onValueChange(value) {
    this.setState({
      selected: value,
    });
  }

  saveEvent = async () => {
    console.log(this.state.userToken.username);
    var savedEvent = {
      username: this.state.userToken.username,
      password: this.state.userToken.password,
      isLogin: this.state.userToken.isLogin,
      title: this.state.eventTitle,
      description: this.state.eventDesciption,
      resourceId: this.state.scenes[this.state.selected].id,
    };
    console.log(savedEvent);
  };

  render() {
    return (
      <View style={{padding: 10}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Название
        </Text>
        <Input
          onChangeText={eventTitle => this.setState({eventTitle})}
          value={this.state.eventTitle}
          inputStyle={{color: 'black', fontSize: 20}}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Описание
        </Text>
        <Input
          onChangeText={eventDesciption => this.setState({eventDesciption})}
          value={this.state.eventDesciption}
          inputStyle={{color: 'black', fontSize: 20}}
        />
        <Item picker>
          <Picker
            mode="dialog"
            iosIcon={
              <Icon
                name="arrow-down"
                style={{color: '#000', position: 'absolute', right: 0}}
              />
            }
            iosHeader="Выберите"
            style={{minWidth: '97%', position: 'relative'}}
            placeholder="Выберите время"
            placeholderStyle={{color: '#bfc6ea'}}
            placeholderIconColor="#007aff"
            selectedValue={this.state.selected}
            onValueChange={this.onValueChange.bind(this)}>
            {this.state.scenes.map(function(item, i) {
              return <Picker.Item label={item.label} value={i} />;
            })}
          </Picker>
        </Item>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Дата
        </Text>
        <Input
          onChangeText={eventDesciption => this.setState({eventDesciption})}
          value={this.state.eventDate}
          inputStyle={{color: 'black', fontSize: 20}}
        />
        <Button
          style={{marginTop: 50}}
          title="Сохранить"
          onPress={this.saveEvent}
        />
      </View>
    );
  }
}
