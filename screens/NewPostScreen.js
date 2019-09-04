import React, { Component } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  AppRegistry, 
  Text, 
  TextInput, 
  View, 
  Keyboard, 
  TouchableOpacity, 
  Button, 
  Switch, 
  YellowBox, 
  StatusBar,
  ImageBackground 

} from 'react-native';

import { ExpoLinksView } from '@expo/samples';
import DropdownAlert from 'react-native-dropdownalert';
import checkIfPostLimitReached from '../storage/PostHistoryVerifier';
import firebase from '../firebase.js';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

export default class NewPostScreen extends Component {
    constructor(props) {
    super(props);
    //creates a reference to to the posts a user has made in the firebase database
    this.ref = firebase.firestore().collection('users').doc('1').collection('posts');
    this.unsubscribe = null;
    this.state = { title: '', body: '', shared_online: false, tag: '', timestamp: new Date(), posts: [], switchValue: false};
  }
    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onCollectionUpdate = (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        const { title, body, likes, location, shared_online, tag, timestamp } = doc.data();
        
        posts.push({
          key: doc.id,
          doc, // DocumentSnapshot
          title,
          body,
          likes,
          location,
          shared_online,
          tag,
          timestamp
        });
      });

      this.setState({ 
        posts,
        loading: false,
     });
    }

  render() {
    if (this.state.loading) {
  return null; // or render a loading icon
    }
    const { title, body } = this.state
    return (
      <ImageBackground source={require('../assets/images/background.png')} style={{flex: 1, width: '100%', height: '100%'}} >
        <View style={styles.container}>
          <View>
            <Text style={styles.header}>New</Text>
          </View>
          <View>
          <ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.titleInput}
                value={this.state.title}
                placeholder="Title"
                maxLength={30}
                onChangeText={(text) => this.handleTitleChange(text)}
              />
              <TextInput
                style={styles.contentInput}
                placeholder="describe your vision"
                maxLength={400}
                multiline = {true}
                editable = {true}
                onBlur = {Keyboard.dismiss}
                value = {this.state.body}
                onChangeText={(text) => this.handleBodyChange(text)}
              />

              

              <View style={styles.inputContainer}>
                
              </View>

            </View>

            
            <View style={styles.shareContainer}>
              <Button
                  style={styles.saveButton}
                  title={'Save'}
                  //button is disabled if title or body text is empty
                  disabled={!this.state.body.length || !this.state.title.length} 
                  onPress={() => 
                    this.addPost()
                  }
                />
              <View style={{flexDirection: 'row', paddingTop: 10}}>
                <Text style={{paddingRight: 15, color: 'white'}}>Share</Text>
                <Switch
                onValueChange = {this.toggleSwitch}
                value = {this.state.switchValue}/>
              </View>
            </View>
          </ScrollView>
          </View>
          <DropdownAlert
            ref={ref => this.dropDownAlertRef = ref}
            tapToCloseEnabled={true}
            updateStatusBar  ={false}
            defaultContainer={{ padding: 8, paddingTop: StatusBar.currentHeight, flexDirection: 'row' }} />
        </View>
       </ImageBackground> 

    );
  }

  toggleSwitch = (value) => {
    this.setState({switchValue: value})
  }

  //updates the state of the title text when it is changed
  handleTitleChange(text){
    this.setState({title: text});
  }
  handleBodyChange(text){
    this.setState({body: text});
  }
  //creates and adds a new post to the database
  async addPost() {
    var check = await checkIfPostLimitReached();
  if(check){
    this.ref.add({
      title: this.state.title,
      body: this.state.body,
      likes: 1,
      tag: '',
      shared_online: this.state.switchValue,
      timestamp: new Date(),
      location: new firebase.firestore.GeoPoint(0, 0)
    });
    this.dropDownAlertRef.alertWithType('success', 'Success', 'Your vision has been successfully shared ');
    console.log('daily limit not reached');
  } else{
    this.dropDownAlertRef.alertWithType('error', 'Error', 'You have reached your daily post limit');
    console.log('daily limit reached');
  }
  
}
}



NewPostScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  },
  shareContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 50,
    alignItems: 'flex-start',
    justifyContent:'space-between',
    paddingLeft: 20,
    paddingRight: 20
  },
  header: {
    fontSize: 25,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
    color: 'white'
  },
  inputContainer: {
  paddingTop: 15,
  color: 'white'
},
titleInput: {
  borderColor: '#CCCCCC',
  borderTopWidth: 1,
  borderBottomWidth: 1,
  height: 50,
  fontSize: 25,
  paddingLeft: 20,
  paddingRight: 20,
  color: 'white'
},
contentInput: {
  paddingTop: 20,
  paddingBottom: 20,
  height: 200,
  fontSize: 20,
  paddingLeft: 20,
  paddingRight: 20,
  textAlignVertical: 'top',
  color: 'white'
},
saveButton: {
  borderWidth: 1,
  borderColor: '#007BFF',
  backgroundColor: '#007BFF',
  padding: 15,
  margin: 5,
  borderRadius: 20,
  width:150,
  alignItems: "center",
  color: 'white'
},
saveButtonText: {
  color: '#FFFFFF',
  fontSize: 20,
  textAlign: 'center'
}
});
