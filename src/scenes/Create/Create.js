/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  AsyncStorage,
  ScrollView,
  Alert,
} from 'react-native';
import {Input} from 'react-native-elements';
import moment from 'moment';
import ReactNativeSettingsPage, {
  SectionRow,
  SwitchRow,
} from 'react-native-settings-page';
import {Item, Picker, Icon} from 'native-base';
import realm from '../../services/realm';
import CalendarPicker from 'react-native-calendar-picker';
import NetInfo from '@react-native-community/netinfo';
import MultiSelect from 'react-native-multiple-select';
import DatePicker from 'react-native-date-picker';

export default class CreateScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventTitle: '',
      eventDesciption: '',
      selected: undefined,
      scenes: [],
      selectedCollective: undefined,
      collectivesArray: [],
      collectives: [],
      usersArray: [],
      users: [],
      selectedUsers: [],
      selectedExternal: [],
      selectedAlert: [],
      dateStart: new Date(),
      dateEnd: new Date(),
      selectedRecurrence: 'key0',
    };
  }
  static navigationOptions = {
    title: 'Создание события',
  };

  componentDidMount() {
    this.getParams();
  }

  getParams = async () => {
    try {
      const userToken = JSON.parse(await AsyncStorage.getItem('userToken'));
      this.setState({userToken: JSON.parse(userToken)});
      const prodCheck = JSON.parse(await AsyncStorage.getItem('development'));
      this.setState({prodCheck: prodCheck});
      const collectives = JSON.parse(await AsyncStorage.getItem('collectives'));
      this.setState({collectivesArray: collectives});
      const users = JSON.parse(await AsyncStorage.getItem('users'));
      this.setState({usersArray: users});
      const external = JSON.parse(await AsyncStorage.getItem('external'));
      this.setState({externalArray: external});
    } catch (error) {
      console.log(error.message);
    }
    var list = [];
    var usersList = [];
    var externalList = [];
    for (i = 0; i < this.state.usersArray.length; i++) {
      var item = {
        name: this.state.usersArray[i].Name,
        id: this.state.usersArray[i].Id,
      };
      usersList.push(item);
    }
    for (i = 0; i < this.state.externalArray.length; i++) {
      var item = {
        name: this.state.externalArray[i].Name,
        id: this.state.externalArray[i].Id,
      };
      externalList.push(item);
    }
    for (var i = 0; i < realm.objects('Scene').length; i++) {
      var item = {
        label: realm.objects('Scene')[i].title,
        value: realm.objects('Scene')[i].id,
        color: realm.objects('Scene')[i].color,
        id: realm.objects('Scene')[i].resourceId,
        canWrite: realm.objects('Scene')[i].canWrite,
      };
      if (item.canWrite === true) {
        list.push(item);
      }
    }
    var collectivesList = [];
    for (var i = 0; i < this.state.collectivesArray.length; i++) {
      var item = {
        title: this.state.collectivesArray[i].Title,
        id: this.state.collectivesArray[i].Id,
      };
      collectivesList.push(item);
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({scenes: list});
    this.setState({collectives: collectivesList});
    this.setState({users: usersList});
    this.setState({external: externalList});
  };

  onValueChange(value) {
    this.setState({
      selected: value,
    });
  }

  onValueChangeCollective(value) {
    this.setState({
      selectedCollective: value,
    });
  }

  onValueChangeRecurrence(value) {
    this.setState({
      selectedRecurrence: value,
    });
  }

  saveEvent = async () => {
    var recurrenceRule = '';
    var weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    if (this.state.selectedRecurrence === 'key0') {
      recurrenceRule = '';
    } else {
      var weekDay = weekDays[this.state.dateStart.getDay() - 1];
      var startDate = new Date(this.state.dateStart.setMilliseconds(0))
        .toISOString()
        .replace(/\.\d+/, '')
        .split('-')
        .join('')
        .split(':')
        .join('');
      var endDate = new Date(this.state.dateEnd.setMilliseconds(0))
        .toISOString()
        .replace(/\.\d+/, '')
        .split('-')
        .join('')
        .split(':')
        .join('');
      var freq = '';
      if (this.state.selectedRecurrence === 'key1') {
        freq = 'FREQ=DAILY';
        recurrenceRule =
          'DTSTART:' +
          startDate +
          'RRULE:' +
          freq +
          ';UNTIL=' +
          endDate +
          ';COUNT=7;INTERVAL=1;WKST=' +
          weekDay;
      } else {
        freq = 'FREQ=WEEKLY';
        recurrenceRule =
          'DTSTART:' +
          startDate +
          'RRULE:' +
          freq +
          ';UNTIL=' +
          endDate +
          ';COUNT=4;INTERVAL=1;WKST=' +
          weekDay;
      }
    }
    if (new Date(this.state.dateEnd) > new Date(this.state.dateStart)) {
      var savedEvent = {
        username: this.state.userToken.username,
        password: this.state.userToken.password,
        isLogin: this.state.userToken.isLogin,
        title: this.state.eventTitle,
        description: this.state.eventDesciption,
        resourceId: this.state.scenes[this.state.selected].id,
        collectiveId: this.state.collectives[this.state.selectedCollective].id,
        isPlan: false,
        isDisableNotifications: true,
        conductorUser: 0,
        requiredUsers: this.state.selectedUsers,
        dutyUsers: this.state.selectedAlert,
        alertedUsers: this.state.selectedAlert,
        externalUsers: this.state.selectedExternal,
        dateStart: this.state.dateStart.toISOString(),
        dateEnd: this.state.dateEnd.toISOString(),
        isRecurrence: this.state.selectedRecurrence === 'key0' ? false : true,
        recurrenceRule: recurrenceRule,
      };
      console.log(this.state.selectedRecurrence, 'xd');
    } else {
      Alert.alert(
        'Некорректная дата',
        'Дата начала события позже даты окончания',
      );
    }
    if (this.state.prodCheck) {
      var port = 'https://calendar.bolshoi.ru:8050';
    } else {
      port = 'https://calendartest.bolshoi.ru:8050';
    }
    fetch(port + '/WCF/BTService.svc/CreateEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savedEvent),
    })
      .then(response => {
        console.log(response);
        this.props.navigation.navigate('Agenda');
      })
      .catch(err => {
        console.error(err);
      });
  };

  onSelectedUsersChange = selectedUsers => {
    this.setState({selectedUsers});
  };

  onSelectedExternalChange = selectedExternal => {
    this.setState({selectedExternal});
  };

  onSelectedAlertChange = selectedAlert => {
    this.setState({selectedAlert});
  };

  onDateStartChange = date => {
    this.setState({dateStart: date});
  };
  onDateEndChange = date => {
    this.setState({dateEnd: date});
  };

  render() {
    const {selectedUsers} = this.state;
    const {selectedExternal} = this.state;
    const {selectedAlert} = this.state;
    return (
      <ScrollView style={{padding: 10}}>
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
        <View style={{marginTop: 20, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Оповещаемые пользователи
          </Text>
          <MultiSelect
            hideTags
            items={this.state.users}
            uniqueKey="id"
            onSelectedItemsChange={this.onSelectedAlertChange}
            selectedItems={selectedAlert}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
            altFontFamily="ProximaNova-Light"
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#CCC"
            submitButtonText="Принять"
          />
        </View>
        <View style={{marginTop: 20, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Внешние пользователи
          </Text>
          <MultiSelect
            hideTags
            items={this.state.external}
            uniqueKey="id"
            onSelectedItemsChange={this.onSelectedExternalChange}
            selectedItems={selectedExternal}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
            altFontFamily="ProximaNova-Light"
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#CCC"
            submitButtonText="Принять"
          />
        </View>
        <View style={{marginTop: 20, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Обязательные участники
          </Text>
          <MultiSelect
            hideTags
            items={this.state.users}
            uniqueKey="id"
            onSelectedItemsChange={this.onSelectedUsersChange}
            selectedItems={selectedUsers}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
            altFontFamily="ProximaNova-Light"
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{color: '#CCC'}}
            submitButtonColor="#CCC"
            submitButtonText="Принять"
          />
        </View>

        <View style={{padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              marginLeft: 10,
              color: '#90a4ae',
            }}>
            Сцена
          </Text>
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
              placeholder="Выберите сцену"
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
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Коллектив
          </Text>
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
              placeholder="Выберите коллективы"
              placeholderStyle={{color: '#bfc6ea'}}
              placeholderIconColor="#007aff"
              selectedValue={this.state.selectedCollective}
              onValueChange={this.onValueChangeCollective.bind(this)}>
              {this.state.collectives.map(function(item, i) {
                return <Picker.Item label={item.title} value={i} />;
              })}
            </Picker>
          </Item>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Дата и время начала
        </Text>
        <DatePicker
          date={this.state.dateStart}
          onDateChange={this.onDateStartChange}
          is24hourSource="locale"
          locale="ru"
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Дата и время окончания
        </Text>
        <DatePicker
          date={this.state.dateEnd}
          onDateChange={this.onDateEndChange}
          is24hourSource="locale"
          locale="ru"
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Повторение
        </Text>
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
            placeholder="Выберите коллективы"
            placeholderStyle={{color: '#bfc6ea'}}
            placeholderIconColor="#007aff"
            selectedValue={this.state.selectedRecurrence}
            onValueChange={this.onValueChangeRecurrence.bind(this)}>
            <Picker.Item label="Один раз" value="key0" />
            <Picker.Item label="Раз в день" value="key1" />
            <Picker.Item label="Раз в неделю" value="key2" />
          </Picker>
        </Item>
        <View style={{marginTop: 50, marginBottom: 50}}>
          <Button title="Сохранить" onPress={this.saveEvent} />
        </View>
      </ScrollView>
    );
  }
}
