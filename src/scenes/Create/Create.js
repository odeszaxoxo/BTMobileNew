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
import {uniq} from 'lodash';

export default class CreateScreen extends Component {
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
      selectedRecurrence: 'key0',
      selectedCustomDays: [],
      selectedCustomDaysArr: [],
      reqDate: new Date(),
      recDays: 1,
      recWeeks: 1,
      recMonths: 1,
      pickerDate: new Date(),
      reqDateStart: new Date(),
      isDisableNotifications: true,
    };
  }
  static navigationOptions = {
    title: 'Создание события',
    headerBackTitle: 'Назад',
  };

  componentDidMount = async () => {
    this.getParams();
  };

  onDateChange = async date => {
    var offset = new Date().getTimezoneOffset() / 60;
    var offsetCalc = new Date(date).getHours() - offset;
    var newTime = new Date(new Date(date).setHours(offsetCalc));
    var daysArr = this.state.selectedCustomDays;
    daysArr.push(newTime);
    this.setState({selectedCustomDays: daysArr});
    const uniqDates = [...new Set(daysArr.map(date1 => date1.toString()))];
    this.setState({selectedCustomDaysArr: uniqDates});
  };

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
      var offset = new Date().getTimezoneOffset() / 60;
      const picker = new Date(
        JSON.parse(await AsyncStorage.getItem('StarterDate')),
      );
      picker.setHours(picker.getHours() + offset);
      this.setState({
        dateStart: new Date(picker),
        dateEnd: new Date(picker),
      });
      this.setState({
        reqDate: this.state.dateEnd,
        reqDateStart: this.state.dateStart,
      });
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
    console.log(this.state.selected);
  }

  onValueChangeCollective(value) {
    this.setState({
      selectedCollective: value,
    });
    console.log(this.state.selectedCollective);
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
    var start = new Date(this.state.dateStart);
    var end = new Date(this.state.dateEnd);
    this.setState({
      reqDate: this.state.dateEnd,
      reqDateStart: this.state.dateStart,
    });
    var endDate = this.state.reqDate;
    var reqDays = null;
    var reqForm = null;
    if (this.state.selectedRecurrence === 'key0') {
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
            new Date(reqDate).getDate() +
            parseInt(this.state.recWeeks, 10) * 7 -
            1;
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
    if (this.state.selectedRecurrence === 'key4') {
      var uniqDates = this.state.selectedCustomDaysArr;
      for (var i = 0; i < uniqDates.length; i++) {
        var dateSel =
          new Date(uniqDates[i]).getFullYear() +
          '-' +
          new Date(uniqDates[i]).getMonth() +
          '-' +
          new Date(uniqDates[i]).getDate() +
          '-' +
          this.state.dateStart.getHours() +
          '-' +
          this.state.dateStart.getMinutes() +
          '-' +
          this.state.dateStart.getSeconds();
        console.log(dateSel);
      }
    } else {
      if (this.state.eventTitle !== '') {
        if (new Date(this.state.dateEnd) > new Date(this.state.dateStart)) {
          var offset = new Date().getTimezoneOffset() / 60;
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
            dateStart: start.toISOString(),
            dateEnd: end.toISOString(),
            isDisableNotifications: this.state.isDisableNotifications,
            isRecurrence:
              this.state.selectedRecurrence === 'key0' ? false : true,
            recurrenceRule: recurrenceRule,
          };
          if (this.state.prodCheck) {
            var port = 'https://calendar.bolshoi.ru:8050';
          } else {
            port = 'https://calendartest.bolshoi.ru:8050';
          }
          console.log(savedEvent);
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
    this.setState({dateStart: date, reqDateStart: date});
  };
  onDateEndChange = date => {
    this.setState({dateEnd: date, reqDate: date});
  };

  toggleSwitch = value => {
    this.setState({isDisableNotifications: value});
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
            items={this.state.external}
            uniqueKey="id"
            ref={component => {
              this.multiSelect = component;
            }}
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

        <View style={{padding: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 7,
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
        />
        <Text
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
            selectedValue={this.state.selectedRecurrence}
            onValueChange={this.onValueChangeRecurrence.bind(this)}>
            <Picker.Item label="Один раз" value="key0" />
            <Picker.Item label="Ежедневно" value="key1" />
            <Picker.Item label="Еженедельно" value="key2" />
            <Picker.Item label="Ежемесячно" value="key3" />
            {/* <Picker.Item label="Произвольно" value="key4" /> */}
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
        </View>
        {/* <View style={{width: '100%', marginBottom: 30, marginTop: 20}}>
          <CalendarPicker
            startFromMonday={true}
            todayBackgroundColor="#f2e6ff"
            previousTitle="Пред"
            nextTitle="След"
            selectedDayColor="#1976D2"
            selectedDayTextColor="#FFFFFF"
            onDateChange={this.onDateChange}
            weekdays={['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']}
            months={[
              'Январь',
              'Ферваль',
              'Март',
              'Апрель',
              'Май',
              'Июнь',
              'Июль',
              'Август',
              'Сентябрь',
              'Октябрь',
              'Ноябрь',
              'Декабрь',
            ]}
          />
        </View> */}
        <View style={{marginTop: 30, marginBottom: 50}}>
          <Button title="Сохранить" onPress={this.saveEvent} />
        </View>
      </ScrollView>
    );
  }
}
