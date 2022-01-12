import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import QuranIndexes from './QuranIndexes';
import HadeesIndexes from './HadeesIndexes';
import BibleIndexes from './BibleIndexes';
const Tab = createMaterialTopTabNavigator();

export default IndexesTabs = ({ navigation }) => {
  return (
    <Tab.Navigator
      initialRouteName="QuranIndexes"
      screenOptions={{
        tabBarActiveTintColor: '#fff', tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 16, fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#28D6C0', borderBottomColor: '#000' },
        tabBarContentContainerStyle: { backgroundColor: '#28D6C0', borderBottomColor: '#000', borderBottomWidth: 2 },
      }}
      tabBarPosition='top'
    >
      
      <Tab.Screen
        name="QuranIndexes"
        component={QuranIndexes}
        options={{ tabBarLabel: 'Quran', unmountOnBlur: true }}
        listeners={({ navigation }) => ({
          // blur: () => navigation.setParams({ screen: undefined }),
          focus: () => console.log('Quran Screen'),
          unmountOnBlur: false,
        })}
      />
      <Tab.Screen
        name="HadeesIndexes"
        component={HadeesIndexes}
        options={{ tabBarLabel: 'Hadees' }}
        listeners={({ navigation }) => ({ 
          blur: () => navigation.setParams({ screen: undefined }),
          focus: () => console.log('Hadees Screen'),
        })}
      />
      <Tab.Screen
        name="BibleIndexes"
        component={BibleIndexes}
        options={{ tabBarLabel: 'Bible' }}
        listeners={({ navigation }) => ({
          blur: () => navigation.setParams({ screen: undefined }),
          focus: () => console.log('Bible Screen')
        })}
      />
    </Tab.Navigator>
    
  );
}