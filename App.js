
import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import Hadees from './screens/Hadees';
import Search from './screens/Search';
import SearchIndexes from './screens/SearchIndexes';
import Synonyms from './screens/Synonyms';
import ReadFile from './screens/ReadFile';
import Quran from './screens/Quran';
import Bible from './screens/Bible';
import Quran_StopWords from './screens/Quran_StopWords';
import Hadees_StopWords from './screens/Hadees_StopWords';
import Bible_StopWords from './screens/Bible_StopWords';
import Detail from './screens/Detail';
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Hadees" component={Hadees} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Search" component={Search} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="SearchIndexes" component={SearchIndexes} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Synonyms" component={Synonyms} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="ReadFile" component={ReadFile} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Quran" component={Quran} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Bible" component={Bible} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Quran_StopWords" component={Quran_StopWords} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Hadees_StopWords" component={Hadees_StopWords} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Bible_StopWords" component={Bible_StopWords} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
         <Stack.Screen name="Detail" component={Detail} options={{
          headerStyle: { backgroundColor: '#3a53a6' }, headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;