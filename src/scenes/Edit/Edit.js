/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  AsyncStorage,
  ScrollView,
  Alert,
  TextInput,
  Switch,
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
      selected: 0,
      scenes: [],
      selectedCollective: 0,
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
      reqDate: new Date(),
      recDays: 1,
      recWeeks: 1,
      recMonths: 1,
      isDisableNotifications: true,
      reqDateStart: new Date(),
    };
  }
  static navigationOptions = {
    title: 'Изменение события',
    headerBackTitle: 'Назад',
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
    var endDate = item1.dateEnd;
    var startDateTime = startDate + 'T' + startTime[0] + ':00Z';
    var endDateTime = endDate + 'T' + startTime[1] + ':00Z';
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
    var weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    var weekDay = weekDays[this.state.reqDateStart.getDay()];
    const {navigation} = this.props;
    const item1 = navigation.getParam('item', 'empty');
    var start = new Date(this.state.dateStart);
    var end = new Date(this.state.dateEnd);
    this.setState({
      reqDate: this.state.dateEnd,
      reqDateStart: this.state.dateStart,
    });
    var endDate = this.state.reqDate;
    var reqDays = null;
    var reqForm = null;
    if (this.state.selectedRecurrence === '') {
      var rec = item1.recurrence ? 'key1' : 'key0';
    } else {
      rec = this.state.selectedRecurrence;
    }
    if (rec === 'key0') {
      recurrenceRule = '';
    } else {
      var offset = new Date().getTimezoneOffset() / 60;
      var startDateCopy = this.state.reqDateStart;
      var startDateForm1 = new Date(
        startDateCopy.setHours(startDateCopy.getHours() - offset),
      );
      var startDate = new Date(startDateForm1.setMilliseconds(0))
        .toISOString()
        .replace(/\.\d+/, '')
        .split('-')
        .join('')
        .split(':')
        .join('');
      var freq = '';
      if (this.state.selectedRecurrence === 'key1') {
        let reqDate = new Date(
          this.state.reqDate.setHours(this.state.reqDate.getHours() - offset),
        );
        reqDays =
          new Date(reqDate).getDate() + parseInt(this.state.recDays, 10) - 1;
        reqForm = new Date(reqDate.setDate(reqDays));
        endDate = new Date(reqForm.setMilliseconds(0))
          .toISOString()
          .replace(/\.\d+/, '')
          .split('-')
          .join('')
          .split(':')
          .join('');
        freq = 'FREQ=DAILY';
        recurrenceRule =
          'DTSTART:' +
          startDate.substr(0, 9) +
          '000000Z' +
          'RRULE:' +
          freq +
          ';UNTIL=' +
          endDate.substr(0, 9) +
          '000000Z' +
          ';INTERVAL=1;WKST=MO';
      } else {
        if (this.state.selectedRecurrence === 'key2') {
          let reqDate = new Date(
            this.state.reqDate.setHours(this.state.reqDate.getHours() - offset),
          );
          reqDays =
            new Date(reqDate).getDate() + parseInt(this.state.recWeeks, 10) * 7;
          reqForm = new Date(reqDate.setDate(reqDays));
          endDate = new Date(reqForm.setMilliseconds(0))
            .toISOString()
            .replace(/\.\d+/, '')
            .split('-')
            .join('')
            .split(':')
            .join('');
          freq = 'FREQ=WEEKLY';
          recurrenceRule =
            'DTSTART:' +
            startDate.substr(0, 9) +
            '000000ZRRULE:' +
            freq +
            ';UNTIL=' +
            endDate.substr(0, 9) +
            '000000Z' +
            ';INTERVAL=1;WKST=MO;' +
            'BYDAY=' +
            weekDay;
        } else {
          let reqDate = new Date(
            this.state.reqDate.setHours(this.state.reqDate.getHours() - offset),
          );
          reqDays =
            new Date(reqDate).getMonth() + parseInt(this.state.recMonths, 10);
          reqForm = new Date(reqDate.setMonth(reqDays));
          endDate = new Date(reqForm.setMilliseconds(0))
            .toISOString()
            .replace(/\.\d+/, '')
            .split('-')
            .join('')
            .split(':')
            .join('');
          freq = 'FREQ=MONTHLY';
          recurrenceRule =
            'DTSTART:' +
            startDate.substr(0, 9) +
            '000000ZRRULE:' +
            freq +
            ';UNTIL=' +
            endDate.substr(0, 9) +
            '000000Z' +
            ';INTERVAL=1;WKST=MO;' +
            'BYDAY=' +
            weekDay;
        }
      }
    }
    var ds = new Date(this.state.dateStart);
    var de = new Date(this.state.dateEnd);
    if (this.state.eventTitle !== '') {
      if (new Date(this.state.dateEnd) > new Date(this.state.dateStart)) {
        var savedEvent = {
          username: this.state.userToken.username,
          password: this.state.userToken.password,
          isLogin: this.state.userToken.isLogin,
          title: this.state.eventTitle,
          description: this.state.eventDesciption,
          resourceId: this.state.scenes[this.state.selected].id,
          collectiveId: this.state.collectives[this.state.selectedCollective]
            .id,
          isPlan: false,
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
          isDisableNotifications: this.state.isDisableNotifications,
        };
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
      } else {
        Alert.alert(
          'Некорректная дата',
          'Дата начала события позже даты окончания',
        );
      }
    } else {
      Alert.alert(
        'Заполните обязательные поля',
        'Обязательные поля отмечены звездочкой.',
      );
    }
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

  toggleSwitch = value => {
    this.setState({isDisableNotifications: value});
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
            marginTop: 7,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Название
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
              color: 'red',
            }}>
            {' '}
            *
          </Text>
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
            marginTop: 10,
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
        <View style={{position: 'relative'}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 35,
              marginLeft: 10,
              color: '#90a4ae',
              display: 'flex',
              alignContent: 'center',
            }}>
            Черновик(без уведомлений):
          </Text>
          <Switch
            trackColor={{false: '#767577', true: '#cfd8dc'}}
            thumbColor={
              this.state.isDisableNotifications ? '#388e3c' : '#f4f3f4'
            }
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.isDisableNotifications}
            style={{position: 'absolute', left: '80%', top: 35}}
          />
        </View>
        <View style={{marginTop: 10, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
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
            ref={component => {
              this.multiSelect = component;
            }}
            onSelectedItemsChange={this.onSelectedAlertChange}
            selectedItems={selectedAlert}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
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
          <View>
            {this.multiSelect &&
              this.multiSelect.getSelectedItemsExt(selectedAlert)}
          </View>
        </View>
        <View style={{marginTop: 10, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Внешние пользователи
          </Text>
          <MultiSelect
            hideTags
            ref={component => {
              this.multiSelect = component;
            }}
            items={this.state.external}
            uniqueKey="id"
            onSelectedItemsChange={this.onSelectedExternalChange}
            selectedItems={selectedExternal}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
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
          <View>
            {this.multiSelect &&
              this.multiSelect.getSelectedItemsExt(selectedExternal)}
          </View>
        </View>
        <View style={{marginTop: 10, padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
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
            ref={component => {
              this.multiSelect = component;
            }}
            onSelectedItemsChange={this.onSelectedUsersChange}
            selectedItems={selectedUsers}
            selectText="  Выбрать пользователей"
            searchInputPlaceholderText="Поиск..."
            onChangeInput={text => console.log(text)}
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
          <View>
            {this.multiSelect &&
              this.multiSelect.getSelectedItemsExt(selectedUsers)}
          </View>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 7,
            marginLeft: 10,
            color: '#90a4ae',
          }}>
          Сцена
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
              color: 'red',
            }}>
            {' '}
            *
          </Text>
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
              marginTop: 7,
              marginBottom: 10,
              marginLeft: 0,
              color: '#90a4ae',
            }}>
            Коллектив
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginTop: 7,
                color: 'red',
              }}>
              {' '}
              *
            </Text>
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
            marginTop: 10,
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
          timeZoneOffsetInMinutes={0}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 10,
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
          timeZoneOffsetInMinutes={0}
        />
        {this.state.selectedRecurrence !== 'key0' ? (
          <Text
            style={{
              fontSize: 15,
              marginTop: 15,
              marginLeft: 10,
              color: '#90a4ae',
            }}>
            Повторяющееся
          </Text>
        ) : null}
        {/* <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 7,
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
            <Picker.Item label="Ежедневно" value="key1" />
            <Picker.Item label="Еженедельно" value="key2" />
            <Picker.Item label="Ежемесячно" value="key3" />
          </Picker>
        </Item>
        <View>
          {this.state.selectedRecurrence === 'key1' ? (
            <TextInput
              style={{
                height: 40,
                backgroundColor: 'transparent',
                fontSize: 15,
                marginTop: 15,
                borderBottomWidth: 1,
                borderBottomColor: 'lightgray',
              }}
              placeholder="Введите количество дней"
              onChangeText={text => this.setState({recDays: text})}
              keyboardType="numeric"
            />
          ) : this.state.selectedRecurrence === 'key2' ? (
            <TextInput
              style={{
                height: 40,
                backgroundColor: 'transparent',
                fontSize: 15,
                marginTop: 15,
                borderBottomWidth: 1,
                borderBottomColor: 'lightgray',
              }}
              placeholder="Введите количество недель"
              onChangeText={text => this.setState({recWeeks: text})}
              keyboardType="numeric"
            />
          ) : this.state.selectedRecurrence === 'key3' ? (
            <TextInput
              style={{
                height: 40,
                backgroundColor: 'transparent',
                fontSize: 15,
                marginTop: 15,
                borderBottomWidth: 1,
                borderBottomColor: 'lightgray',
              }}
              placeholder="Введите количество месяцев"
              onChangeText={text => this.setState({recMonths: text})}
              keyboardType="numeric"
            />
          ) : null}
        </View> */}
        <View style={{marginTop: 30, marginBottom: 50}}>
          <Button title="Сохранить" onPress={this.saveEvent} />
        </View>
      </ScrollView>
    );
  }
}
