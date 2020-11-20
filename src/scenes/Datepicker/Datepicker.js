/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View, AsyncStorage, Text} from 'react-native';
import {Button} from 'react-native-elements';
import moment from 'moment';
import CalendarPicker from 'react-native-calendar-picker';

export default class DatePickers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStartDate: new Date(),
      selectedEndDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    };
  }
  static navigationOptions = {
    title: 'Выберите даты',
  };

  componentDidMount() {
    this.props.navigation.addListener('willFocus', async () => {
      var startDate = await AsyncStorage.getItem('SelectedStartDate');
      var endDate = await AsyncStorage.getItem('SelectedEndDate');
      if (startDate !== null && endDate !== null) {
        this.setState({selectedStartDate: startDate, selectedEndDate: endDate});
      }
    });
  }

  onDateChange = (date, type) => {
    if (type === 'END_DATE') {
      this.setState({
        selectedEndDate: date,
      });
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: null,
      });
    }
  };

  goToAgenda = async () => {
    await AsyncStorage.removeItem('SelectedStartDate');
    await AsyncStorage.removeItem('SelectedEndDate');
    await AsyncStorage.removeItem('PickerDate');
    const {navigation} = this.props;
    await AsyncStorage.setItem(
      'SelectedStartDate',
      moment(this.state.selectedStartDate).format('YYYY-MM-DDT00:00:00'),
    );
    await AsyncStorage.setItem(
      'SelectedEndDate',
      moment(this.state.selectedEndDate).format('YYYY-MM-DDT00:00:00'),
    );
    navigation.navigate('Agenda');
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100%',
          zIndex: 0,
        }}>
        <CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          todayBackgroundColor="#f2e6ff"
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
        <Text>' '</Text>
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          buttonStyle={{
            marginTop: 40,
            alignSelf: 'center',
            width: 150,
            height: 50,
            zIndex: 1,
            borderRadius: 50,
          }}
        />
        <Text>' '</Text>
      </View>
    );
  }
}
