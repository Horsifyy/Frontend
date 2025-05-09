import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Navbar = ({navigateToHome, navigateToProfile}) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButton} onPress={navigateToHome}>
        <Icon name="home" size={30} color="#555" />
        <Text style={styles.navButtonText}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={navigateToProfile}>
        <Icon name="person" size={24} color="#555" />
        <Text style={styles.navButtonText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  navButtonText: {
    fontSize: 12,
    color: '#555',
  },
});

export default Navbar;
