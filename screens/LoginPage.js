import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';

import { } from 'react-navigation';

export class LoginPage extends Component {
	render() {
		return(
			<View style = {styles.container}>
				<View style = {styles.textfields}>
					<TextInput style = {styles.input}>
						placeholder = "username"
						returnKeyType = "next"
						onSubmitEditing = {() => this.passwordInput.focus()}
						keyboardType = "email-address"
						autoCapitalize = "none"
						autoCorrect = {false}
					</TextInput>
					<TextInput style = {styles.input}>
						placeholder = "password"
						returnKeyType = "go"
						secureTextEntry
						ref = {(input) =? this.passwordInput = input}
					</TextInput>
					<TouchableOpacity style = {styles.buttoncontainer}>
						<Text style = {styles.buttontext}> Login </Text>
					</TouchableOpacity>
					<Button
						title = "Register Here"
						color = "#1abc9c"
						onPress = {() => this.props.navigation.navigate('Register')}
					/>
				</View>
			</View>
		);
	}
}
