import React from 'react';
import { View,Text,StyleSheet,TouchableOpacity,Alert } from "react-native";

const IAlert=()=>{
  return(
    Alert.alert(
        "Alert Title",
        "My Alert Msg",
        [
          {
            text: "Cancel",
            onPress: () => Alert.alert("Cancel Pressed"),
            style: "cancel",
          },
        ],
        {
          cancelable: true,
          onDismiss: () =>
            Alert.alert(
              "This alert was dismissed by tapping outside of the alert dialog."
            ),
        }
      )
  );
}

export default IAlert;