/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, AsyncStorage, Image, Text} from 'react-native';
import SelectMultiple from 'react-native-select-multiple';
import {isEmpty} from 'lodash';
import realm from '../../services/realm';
import {Button, Icon} from 'react-native-elements';

var _ = require('lodash');

class ScenesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: [],
      selectedScenes: [],
      disabled: false,
      all: [],
      selected: [],
    };
  }
  static navigationOptions = {
    title: 'Выберите сцены',
  };

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('willFocus', async () => {
      var testArr = await AsyncStorage.getItem('Selected');
      var arr2 = [];
      if (JSON.parse(testArr) === []) {
        for (let i = 1; i <= realm.objects('Scene').length; i++) {
          arr2.push(i);
        }
        await AsyncStorage.setItem('Selected', JSON.stringify(arr2));
      } else {
        arr2 = testArr;
      }
      var list1 = [];
      for (var x = 0; x < realm.objects('Scene').length; x++) {
        if (JSON.parse(arr2).includes(realm.objects('Scene')[x].id)) {
          var item1 = {
            label: realm.objects('Scene')[x].title,
            value: realm.objects('Scene')[x].id,
          };
          list1.push(item1);
        }
      }
      this.setState({selectedScenes: list1});
    });
    var list = [];
    for (var i = 0; i < realm.objects('Scene').length; i++) {
      var item = {
        label: realm.objects('Scene')[i].title,
        value: realm.objects('Scene')[i].id,
        color: realm.objects('Scene')[i].color,
        isAllowed: realm.objects('Scene')[i].canWrite,
      };
      list.push(item);
    }
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({scenes: list});
  }

  onSelectionsChange = selectedScenes => {
    this.setState({selectedScenes});
  };

  selectAll = () => {
    this.setState({selectedScenes: this.state.scenes});
  };

  reset = () => {
    this.setState({selectedScenes: null});
  };

  shadeColor = (color, percent) => {
    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    if (R === 0) {
      R = 32;
    }

    if (G === 0) {
      G = 32;
    }

    if (B === 0) {
      B = 32;
    }

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    var RR =
      R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
    var GG =
      G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
    var BB =
      B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

    return '#' + RR + GG + BB;
  };

  goToAgenda = async () => {
    await AsyncStorage.removeItem('Selected');
    const {navigation} = this.props;
    var selectedList = [];
    for (var j = 0; j < this.state.selectedScenes.length; j++) {
      selectedList.push(this.state.selectedScenes[j].value);
    }
    await AsyncStorage.setItem('Selected', JSON.stringify(selectedList));
    navigation.navigate('Agenda');
  };

  renderLabel = (label, rights) => {
    const col = this.state.scenes.find(item => {
      return item.label === label;
    });
    for (var i = 0; i < this.state.scenes.length; i++) {
      if (this.state.scenes[i].label === label) {
        if (this.state.scenes[i].isAllowed) {
          var rights = true;
        } else {
          rights = false;
        }
      }
    }
    return (
      <View
        style={{flexDirection: 'row', alignItems: 'center', height: '100%'}}>
        <View
          style={{
            marginLeft: 10,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            width: '95%',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: 45,
              width: 10,
              backgroundColor: this.shadeColor(col.color, -15),
            }}
          />
          <Text style={{marginLeft: 10, marginRight: 40}}>{label}</Text>
          {rights ? (
            <Icon
              name="create"
              color="gray"
              style={{marginLeft: 40, size: 20}}
            />
          ) : null}
        </View>
      </View>
    );
  };

  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          zIndex: 0,
        }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
            }}>
            <Button
              title="Выбрать все"
              onPress={this.selectAll}
              buttonStyle={{
                width: '70%',
                alignSelf: 'center',
                marginBottom: 10,
              }}
            />
            <Button
              title="Сброс"
              onPress={this.reset}
              buttonStyle={{
                width: '70%',
                alignSelf: 'center',
                marginBottom: 10,
              }}
            />
          </View>
          <View style={{marginBottom: 10}}>
            <SelectMultiple
              items={this.state.scenes}
              selectedItems={this.state.selectedScenes}
              onSelectionsChange={this.onSelectionsChange}
              style={{zIndex: 0, height: '84%'}}
              rowStyle={{height: 39}}
              renderLabel={this.renderLabel}
            />
          </View>
        </View>
        <Button
          onPress={this.goToAgenda}
          title="Выбрать"
          disabled={isEmpty(this.state.selectedScenes) ? true : false}
          buttonStyle={{
            position: 'absolute',
            bottom: 25,
            right: 20,
            width: 150,
            height: 50,
            zIndex: 1,
            borderRadius: 50,
          }}
        />
      </View>
    );
  }
}
export default ScenesList;
