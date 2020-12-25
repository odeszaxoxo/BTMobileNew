import Realm from 'realm';

class Event extends Realm.Object {}
Event.schema = {
  name: 'EventItem',
  properties: {
    title: 'string',
    scene: 'int',
    time: 'string',
    date: 'string',
    alerted: 'string',
    outer: 'string',
    troups: 'string',
    required: 'string',
    conductor: 'string',
    sceneId: 'string',
    id: 'int',
    serverId: 'int',
    description: 'string',
    recurrence: 'bool',
    dateEnd: 'string',
    isDisableNotifications: 'bool',
  },
  primaryKey: 'id',
};

class Scene extends Realm.Object {}
Scene.schema = {
  name: 'Scene',
  primaryKey: 'id',
  properties: {
    selected: 'bool',
    id: 'int',
    title: 'string',
    color: 'string',
    resourceId: 'string',
    canWrite: 'bool',
  },
};

class Selected extends Realm.Object {}
Selected.schema = {
  name: 'Selected',
  properties: {selected: 'string', id: 'int'},
  primaryKey: 'id',
};

export default new Realm({
  schema: [Event, Scene, Selected],
});
