import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
const Realm = require('realm');

const SceneSchema = {
  name: 'ScenesList',
  primaryKey: 'id',
  properties: {selected: 'string', id: 'int'},
};

export default class Store extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      selected: [1, 2, 3, 4, 5],
      realm: new Realm(),
    };
  }
  static navigationOptions = {
    title: 'Выберите сцены',
  };
  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    const {realm} = this.state;
    if (realm !== null && !realm.isClosed) {
      realm.close();
    }
  }

  fetchData = () => {
    this.setState({loading: true});
    fetch('https://my-json-server.typicode.com/odeszaxoxo/placeholder/scenes')
      .then(response => response.json())
      .then(responseJson => {
        responseJson = responseJson.map(item => {
          item.isSelect = false;
          item.selectedClass = styles.list;
          return item;
        });
        this.setState({
          loading: false,
          dataSource: responseJson,
        });
      })
      .catch(error => {
        this.setState({loading: false});
      });
  };

  FlatListItemSeparator = () => <View style={styles.line} />;

  selectItem = data => {
    data.item.isSelect = !data.item.isSelect;
    data.item.selectedClass = data.item.isSelect
      ? styles.selected
      : styles.list;
    const index = this.state.dataSource.findIndex(
      item => data.item.id === item.id,
    );
    this.state.dataSource[index] = data.item;
    this.setState({
      dataSource: this.state.dataSource,
    });
  };

  goToStore = () => {
    var test = this.state.dataSource.filter(item => item.isSelect);
    var test1 = test.map(function(el) {
      return el.id;
    });
    var selectedScenes = JSON.stringify(test1);
    this.props.navigation.navigate('Agenda', {selected: selectedScenes});
    console.log(selectedScenes, typeof selectedScenes);
    Realm.open({
      schema: [SceneSchema],
    })
      .then(realm => {
        realm.write(() => {
          realm.create(
            'ScenesList',
            {selected: selectedScenes, id: 1},
            'modified',
          );
          console.log(typeof realm.objects('ScenesList')[0].selected, 'ffff');
        });
        this.setState({realm});
      })
      .catch(error => {
        this.setState({loading: false});
      });
  };

  renderItem = data => (
    <TouchableOpacity
      style={[styles.list, data.item.selectedClass]}
      onPress={() => this.selectItem(data)}>
      <Text style={styles.lightText}>
        {' '}
        {data.item.title.charAt(0).toUpperCase() +
          data.item.title.slice(1)}{' '}
      </Text>
    </TouchableOpacity>
  );

  render() {
    const {realm} = this.state;
    var info = JSON.stringify(this.state.selected);
    if (this.state.realm == null) {
      info = JSON.stringify(this.state.selected);
    } else {
      info = realm.objects('ScenesList')[0].selected;
    }
    const itemNumber = this.state.dataSource.filter(item => item.isSelect)
      .length;

    if (this.state.loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.dataSource}
          ItemSeparatorComponent={this.FlatListItemSeparator}
          renderItem={item => this.renderItem(item)}
          keyExtractor={item => item.id.toString()}
          extraData={this.state}
        />
        <View style={styles.numberBox}>
          <Text style={styles.number}>{itemNumber}</Text>
        </View>
        <TouchableHighlight onPress={this.goToStore} underlayColor="white">
          <View style={styles.button}>
            <Text style={styles.buttonTouch}>Выбрать</Text>
          </View>
        </TouchableHighlight>
        <Text>{info}</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 50,
    position: 'relative',
  },
  title: {
    fontSize: 30,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  list: {
    paddingVertical: 5,
    margin: 3,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: -1,
    height: 50,
  },
  lightText: {
    color: '#000000',
    width: '100%',
    paddingLeft: 15,
    fontSize: 20,
  },
  line: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#2196f3',
  },
  button: {
    marginBottom: 30,
    width: 160,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 6,
    backgroundColor: '#1976D2',
  },
  buttonTouch: {
    textAlign: 'center',
    padding: 20,
    color: '#fff',
    fontSize: 18,
  },
  numberBox: {
    position: 'absolute',
    bottom: 65,
    width: 40,
    height: 40,
    borderRadius: 25,
    left: 275,
    zIndex: 3,
    backgroundColor: '#e3e3e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {fontSize: 14, color: '#000'},
  selected: {backgroundColor: '#9be7ff'},
});
