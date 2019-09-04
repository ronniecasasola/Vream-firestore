import { AsyncStorage } from 'react-native';
import firebase from '../firebase.js'

const STORAGE_KEY = 'POSTS';

export const storePost = (post) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(post));
}

const DEFAULT_POSTS = {
  posts: ''
};

export const checkIfPostLimitReached = async () => {
  try {
    let posts = await AsyncStorage.getItem(STORAGE_KEY);
    if (posts == null) { 
    	const arrayOfDates = [];
    	firebase.firestore().collection('users').doc('1').collection('posts')
    	.where("shared_online", "==", true)
    	.orderBy("timestamp", "desc").limit(2)
    	.get().then(function(querySnapshot) {
        	querySnapshot.forEach(function(doc) {
            const timestampOfLastTwoPosts = doc.get("timestamp");
            
            arrayOfDates.push(timestampOfLastTwoPosts.toDate());
        	});
        storePost(arrayOfDates);
    });
    return true;
  	} else{
  		const arrayOfDates = JSON.parse(posts);
  		if(arrayOfDates.length < 2){
  			const updatedDates = [new Date(), arrayOfDates[0]];
  			storePost(updatedDates);
  			return true;
  		} else{
  			const dateOfLastPost = arrayOfDates[0];
  			const dateOfSecondLastPost = arrayOfDates[1];
  			const todaysDate = new Date();
  			if(new Date(dateOfLastPost).getFullYear() == new Date(dateOfSecondLastPost).getFullYear()){
  				if(new Date(dateOfLastPost).getMonth() == new Date(dateOfSecondLastPost).getMonth()){
  					if(new Date(dateOfLastPost).getDay() == new Date(dateOfSecondLastPost).getDay() 
  						&& new Date(dateOfLastPost).getDay() == todaysDate.getDay()){
  						return false;
  					}
  				}
  			}
  			const updatedDates = [new Date(), arrayOfDates[0]];
  			storePost(updatedDates);
  			return true;
  		}
  		

  	}
} catch (error) {
    console.log('Error  posts', error);
  }
}