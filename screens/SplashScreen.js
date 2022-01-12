import React,{useEffect} from 'react';
import { StyleSheet,View,Text,Image,ImageBackground,Dimensions } from 'react-native';

export default SplashScreen=({navigation})=>{
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Home');
        }, 2000);
    }, [])
    return(
      <View style={{flex:1}}>
          <Image style={{width:width,height:height,resizeMode:'stretch'}}
           source={require('../assets/images/Splash.jpg')}
          />
      </View>
    );
}