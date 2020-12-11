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
export default class EditScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventTitle: '',
      eventDesciption: '',
      selected: undefined,
      scenes: [],
      selectedCollective: '',
      collectivesArray: [],
      collectives: [],
      usersArray: [],
      users: [],
      selectedUsers: [],
      selectedExternal: [],
      selectedAlert: [],
      dateStart: new Date(),
      dateEnd: new Date(),
      selectedRecurrence: '',
      eventID: undefined,
    };
  }
  static navigationOptions = {
    title: 'Изменение события',
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
    const {navigation} = this.props;
    const item1 = navigation.getParam('item', 'empty');
    console.log(item1);
    this.setState({
      eventTitle: item1.title,
      eventDesciption: item1.description,
    });
    var list = [];
    var usersList = [];
    var externalList = [];
    var selectedEditUsers = [];
    var selectedCollectivesEdit = [];
    var selectedReqEditUsers = [];
    var selectedExtEditUsers = [];
    for (i = 0; i < this.state.usersArray.length; i++) {
      var item = {
        name: this.state.usersArray[i].Name,
        id: this.state.usersArray[i].Id,
      };
      var usersEdit = item1.alerted.split(';');
      var usersReqEdit = item1.required.split(';');
      for (var j = 0; j < usersEdit.length; j++) {
        if (item.name === usersEdit[j]) {
          selectedEditUsers.push(item.id);
        }
      }
      for (var j = 0; j < usersEdit.length; j++) {
        if (item.name === usersReqEdit[j]) {
          selectedReqEditUsers.push(item.id);
        }
      }
      usersList.push(item);
    }
    this.setState({
      selectedAlert: selectedEditUsers,
      selectedUsers: selectedReqEditUsers,
    });
    for (i = 0; i < this.state.externalArray.length; i++) {
      var item = {
        name: this.state.externalArray[i].Name,
        id: this.state.externalArray[i].Id,
      };
      var usersExtEdit = item1.outer.split('; ');
      for (var j = 0; j < usersExtEdit.length; j++) {
        if (item.name === usersExtEdit[j]) {
          selectedExtEditUsers.push(item.id);
        }
      }
      externalList.push(item);
    }
    this.setState({selectedExternal: selectedExtEditUsers});
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
      var collectivesEdit = item1.troups;
      if (item.title === collectivesEdit) {
        selectedCollectivesEdit.push(item.id);
      }
      collectivesList.push(item);
    }
    var startDate = item1.date;
    var startTime = item1.time.split(' - ');
    var startDateTime = startDate + 'T' + startTime[0] + ':00Z';
    var endDateTime = startDate + 'T' + startTime[1] + ':00Z';
    var offset = new Date().getTimezoneOffset() / 60;
    this.setState({
      dateStart: new Date(startDateTime),
      dateEnd: new Date(endDateTime),
    });
    this.setState({selectedCollective: selectedCollectivesEdit});
    var selectedRec;
    if (item1.recurrence) {
      selectedRec = 'key1';
    } else {
      selectedRec = 'key0';
    }
    this.setState({selectedReccurence: selectedRec, eventID: item1.serverId});
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
    const {navigation} = this.props;
    const item1 = navigation.getParam('item', 'empty');
    if (this.state.selectedRecurrence === '') {
      var rec = item1.recurrence ? 'key1' : 'key0';
    } else {
      rec = this.state.selectedRecurrence;
    }
    if (rec === 'key0') {
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
    var ds = new Date(this.state.dateStart);
    var de = new Date(this.state.dateEnd);
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
        dateStart: new Date(ds.setHours(ds.getHours() - 3)),
        dateEnd: new Date(de.setHours(de.getHours() - 3)),
        isRecurrence: rec === 'key0' ? false : true,
        recurrenceRule: recurrenceRule,
        eventId: this.state.eventID,
      };
    } else {
      Alert.alert(
        'Некорректная дата',
        'Дата начала события позже даты окончания',
      );
    }
    console.log(savedEvent);
    if (this.state.prodCheck) {
      var port = 'https://calendar.bolshoi.ru:8050';
    } else {
      port = 'https://calendartest.bolshoi.ru:8050';
    }
    fetch(port + '/WCF/BTService.svc/EditEvent', {
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
    const {navigation} = this.props;
    var selectedCollectiveEdit;
    const item1 = navigation.getParam('item', 'empty');
    for (var i = 0; i < this.state.collectives.length; i++) {
      var collectivesEdit = item1.troups;
      if (this.state.collectives[i].title === collectivesEdit) {
        selectedCollectiveEdit = this.state.collectives[i].id - 1;
      }
    }
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
        <View style={{padding: 10}}>
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
              selectedValue={
                this.state.selectedCollective === 0
                  ? selectedCollectiveEdit
                  : this.state.selectedCollective
              }
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
          timeZoneOffsetInMinutes="0"
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
          timeZoneOffsetInMinutes="0"
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
            selectedValue={
              this.state.selectedReccurence === ''
                ? item1.recurrence
                : this.state.selectedRecurrence
            }
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
