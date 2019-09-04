import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Header,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  RefreshControl 

} from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import firebase from '../firebase.js';
import { MonoText } from '../components/StyledText';
import Post from '../components/Post.js';
import { GeoFirestore } from "geofirestore";

export default class HomeScreen extends Component {

	constructor(props){
		super(props);
		this.ref = firebase.firestore().collectionGroup('posts');
    this.unsubscribe = null;
    const firestore = firebase.firestore();
    const geofirestore = new GeoFirestore(this.ref);
    const geocollection = geofirestore;
    	this.state = {
        textInput: '',
        loading: true,
        posts: [],
        currentPage: 1,
        limit: 5,
        lastVisible: null,
        firstVisible: null,
        finishedList: false,
        refreshing: false,
    	};
	}

	async componentDidMount() {
    // Get the user's location
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    let location = await Location.getCurrentPositionAsync({});
    console.log('location: ', location);
    this.getPosts();
  }

 

	getPosts = async () => {
		try{
		const {currentPage, itemsPerPage} = this.state;
		const startAt = currentPage * itemsPerPage - itemsPerPage;
        this.setState({loading: true});
         console.log('Retrieving initial Data');
        let initialQuery = await this.ref
          .where("shared_online", "==", true)
	      .orderBy('timestamp', 'desc')
	      .limit(this.state.limit);

	      let documentSnapshots = await initialQuery.get();

	      let posts = documentSnapshots.docs.map(document => document.data());

	      if(posts.length > 0){
	      	  let firstVisible = documentSnapshots.docs[0];
		      let lastVisible = documentSnapshots.docs[posts.length - 1];
	  	    
		      this.setState({
		        posts: [...this.state.posts, ...posts],
		        firstVisible: firstVisible,
		        lastVisible: lastVisible,
		        refreshing: false,
		        loading: false
		      });
	  	}
	  } catch (error) {
      console.log(error);
    }
  };

  getMorePosts = async () =>{

  		try {
      // Set State: Refreshing
      this.setState({
        refreshing: true,
        loading: true
      });
      console.log('Retrieving additional Data');
      // Cloud Firestore: Query (Additional Query)
      let additionalQuery = await this.ref
        .where("shared_online", "==", true)
	    .orderBy('timestamp', 'desc')
        .startAfter(this.state.lastVisible)
        .limit(this.state.limit)
      // Cloud Firestore: Query Snapshot
      let documentSnapshots = await additionalQuery.get();
      // Cloud Firestore: Document Data
      let posts = documentSnapshots.docs.map(document => document.data());
      
      if(posts.length > 0){
	      // Cloud Firestore: Last Visible Document (Document ID To Start From For Proceeding Queries)
	      let lastVisible = documentSnapshots.docs[posts.length - 1];
	      // Set State
	      this.setState({
	        posts: [...this.state.posts, ...posts],
	        lastVisible: lastVisible,
	        refreshing: false,
	        loading: false
	      });
  		} else{
  			this.setState({
	        posts: [...this.state.posts],
	        lastVisible: this.state.lastVisible,
	        refreshing: false,
	        loading: false,
	        finishedList: true
	      });
  		}
    }
    catch (error) {
      console.log(error);
    }


  }

  getNewPosts = async () =>{

  		try {
      // Set State: Refreshing
      this.setState({
        refreshing: true,
        loading: true
      });
      console.log('Retrieving new Data');
      // Cloud Firestore: Query (Additional Query)
      let additionalQuery = await this.ref
        .where("shared_online", "==", true)
	    .orderBy('timestamp', 'desc')
        .endBefore(this.state.firstVisible)

      // Cloud Firestore: Query Snapshot
      let documentSnapshots = await additionalQuery.get();
      // Cloud Firestore: Document Data
      let posts = documentSnapshots.docs.map(document => document.data());
      if(posts.length > 0){
	      // Cloud Firestore: Last Visible Document (Document ID To Start From For Proceeding Queries)
	      // Set State
	      let firstVisible = documentSnapshots.docs[0];
	      this.setState({
	        posts: [...posts, ...this.state.posts],
	        refreshing: false,
	        loading: false,
	        firstVisible: firstVisible,
	      });
  		} else{
  			this.setState({
	        refreshing: false,
	        loading: false
	      });
  		}
    }
    catch (error) {
      console.log(error);
    }


  }




  // Render Footer
  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };


  _onRefresh = () => {
    this.setState({refreshing: true});
    fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

//.


    
	render(){
		
	  return (
	  	<ImageBackground source={require('../assets/images/background.png')} style={{flex: 1, width: '100%', height: '100%'}} >
		  	<View style={styles.container}>
		        <View>
		          <Text style={styles.header}>Vream</Text>
		        </View>

		       	<FlatList
	          		data={this.state.posts}
	          		renderItem={({ item }) => <Post id={item.id} title={item.title} body ={item.body} />}
	          		keyExtractor={(item, index) => String(index)}
	          		ListFooterComponent={this.renderFooter}
	          		onEndReached={()=>{
	          			if (this.state.loading === false && this.state.finishedList === false){
	          			this.getMorePosts();
	          			}
	          		}}
	          		refreshControl={
			          <RefreshControl
			            refreshing={this.state.refreshing}
			            onRefresh={this.getNewPosts}
			          />
			        }
	          		onEndReachedThreshold={0.1}
			         // Refreshing (Set To True When End Reached)
			         loading={this.state.loading}
	        	/>
			</View>
		</ImageBackground>  	
	     
	  );
	}
}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/development-mode/'
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes'
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 25,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
    color: 'white'
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
