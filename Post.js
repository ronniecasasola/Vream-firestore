import React from 'react';
import { TouchableHighlight, View, Text, Dimensions, StyleSheet } from 'react-native';

export default class Post extends React.PureComponent {

    render() {
        return (
          <TouchableHighlight
            //onPress={() => this.()}
          >

              <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start" }}>
               
                <View style={{backgroundColor: "#eee",  opacity: 0.5, borderTopLeftRadius: 0, borderBottomRightRadius: 15, overflow: "hidden", padding: 10, marginTop:25, width: Dimensions.get('window').width * 0.7, height: 170 }}>
                
                  <Text style={{color: "black", fontStyle: 'italic'}}>{this.props.title}</Text>
                  <Text style={{ color: "white", paddingTop: 5, fontStyle: 'italic'}} numberOfLines = {6} ellipsizeMode= {'tail'} >
                    {this.props.body}
                  </Text>
                  
                </View>
               <View style={styles.triangleCorner}></View>
              </View>

          </TouchableHighlight>
        );
    }
}
const styles = StyleSheet.create({
  triangleCorner: {
    top:25,
    left:0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: Dimensions.get('window').width * 0.2 ,
    borderTopWidth: 160,
    borderRightColor: 'transparent',
    borderTopColor: "#eee",
    opacity: 0.5,
    borderTopRightRadius: 5,
  },
  triangleCorner1: {
    top:35,
    right:0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: Dimensions.get('window').width * 0.1 ,
    borderBottomWidth: 160,
    borderLeftColor: 'transparent',
    borderBottomColor: "#eee",
    borderBottomLeftRadius: 5,
    opacity: 0.5
  }
});