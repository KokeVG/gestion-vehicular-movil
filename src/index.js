import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Text, Alert, TouchableHighlight} from 'react-native';

import BackgroundTimer from 'react-native-background-timer';

import PushNotification, {Importance} from "react-native-push-notification";



import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']);

// Notificaciones locales
PushNotification.createChannel({
  channelId: "001", // (required)
  channelName: "Discrepancia", // (required)
  channelDescription: "Discrepancia de patentes.", // (optional) default: undefined.
  playSound: true, // (optional) default: true
  soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
  importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
  vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
}
);


function notificar(id, titulo, mensaje, mensajeLargo) { 
  PushNotification.localNotification({
    channelId: "001",
    title: titulo,
    message: mensaje,
    bigText: mensajeLargo,
    id: id,
    onlyAlertOnce: true,
  });
}

const Estacionamiento = () => {

  // Buscador
  const [est, onChangeEst] = useState(null);
  const [encontrado, setEncontrado] = useState(false);
  const [datos, setDatos] = useState(null);
  const [segRestantes, setSegRestantes] = useState(10);


  // Buscar estacionamiento
  const buscar = async () =>{ 
    if(est !== null){
        // buscar por la api
        var json = await obtenerEstacionamiento()
        if(json !== null){
          setDatos(json)
          console.log(json);
          setEncontrado(true)
          Contador();

          if(json['estado'] === "Ocupado" && json['patente'] !== json['patente_uso']){
            var titulo, mensaje, mensajeLargo;
            titulo = "Patente incorrecta";
            mensaje = `La patente ${json['patente_uso']} no corresponde.`;
            mensajeLargo = `La patente esperada es ${json['patente']} pero se obtuvo la patente ${json['patente_uso']}.`;
            
            notificar(json['estacionamiento'], titulo, mensaje, mensajeLargo);
          }
        }
        else{
            Alert.alert("Sin registro", "El estacionamiento ingresado no esta registrado.");
        }
    }
    else {
      Alert.alert("Entrada vacía", "Ingrese el número del estacionamiento.");
    }
  };
  // escucha que se actualiza los datos de estacionamiento
  const obtenerEstacionamiento = async () => {
    var url = 'http://192.168.81.173:8000/api/estacionados/?estacionamiento=' + est.toString();
    //    var url = 'http://192.168.1.104:8000/api/estacionados/?estacionamiento=' + est.toString();
    try {
      const response = await fetch(url);
      if(response.status === 200){
        const json = await response.json();
        return json;
      }
      return null;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (segRestantes === 0) {
      BackgroundTimer.stopBackgroundTimer();
      setSegRestantes(10);
      buscar();
    }
  }, [segRestantes]);

  const Contador = () => {
    BackgroundTimer.runBackgroundTimer(() => {
      setSegRestantes(segs => {
        if (segs > 0) return segs - 1;
        else return 0;
      });
    }, 1000);
  };

  return(
    <>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.Title}>ESTACIONAMIENTO</Text>
        <View style={styles.fila}>
          <TextInput
            style={styles.input}
            placeholder="ID Estacionamiento"
            placeholderTextColor="#000000"
            value={est}
            onChangeText={onChangeEst}
          />
          <TouchableHighlight
            style={styles.buttonBuscar}
            onPress={() => buscar()}>
            <Text
              style={styles.text}>
                Buscar
            </Text>
          </TouchableHighlight>
        </View>
        
        { encontrado &&
          <View style={styles.estacionamiento}>
            <View style={styles.borde}>
              <View style={styles.fila12}>
                <View style={styles.fila21}>
                  <Text style={styles.centro}>
                    Estado:
                  </Text>
                </View>
                <View style={styles.fila22}>
                  <Text style={styles.centro}>
                    {datos['estado']}
                  </Text>
                </View>
              </View>
              { datos['estado'] === 'Libre' || datos['estado'] === 'Ocupado' &&
              <View style={styles.fila12}>
                <View style={styles.fila21}>
                  <Text style={styles.centro}>
                    Patente dueño:
                  </Text>
                </View>
                <View style={styles.fila22}>
                  <Text style={styles.centro}>
                    {datos['patente']}
                  </Text>
                </View>
              </View>
              }
              { datos['estado'] === 'Ocupado' &&
              <>
              <View style={styles.fila12}>
                <View style={styles.fila21}>
                  <Text style={styles.centro}>
                    Fecha:
                  </Text>
                </View>
                <View style={styles.fila22}>
                  <Text style={styles.centro}>
                    {datos['fecha']} {datos['hora']}
                  </Text>
                </View>
              </View>
              <View style={styles.fila12}>
                <View style={styles.fila21}>
                  <Text style={styles.centro}>
                    Patente actual:
                  </Text>
                </View>
                <View style={styles.fila22}>
                  <Text style={styles.centro}>
                    {datos['patente_uso']}
                  </Text>
                </View>
              </View>
              </>
              }
            </View>
          </View>
        }
      </ScrollView>
    </>
  )
};

export default Estacionamiento;

const styles = StyleSheet.create({

  buttonBuscar: {
    width:"44%",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: "3%",
    //paddingHorizontal: 32,
    marginHorizontal: "3%",
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'black',
  },
  buttonLimpiar: {
    width:"44%",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: "3%",
    //paddingHorizontal: 32,
    marginHorizontal: "3%",
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  scrollView: {
    //marginBottom: 10,
    width: "100%",
    height: "100%",
    //paddingBottom: 50,
  },
  estacionamiento:{
    alignItems: "center",
    //marginHorizontal: "0%",
    width: "100%",
    //flexDirection: "column",
  },
  fila: {
    alignItems: "center",
    flexDirection: 'row',
    width: "100%",
    //marginHorizontal: 10,
  },
  input: {
    backgroundColor: '#e5e4e4',
    width: "44%",
    paddingVertical: "3%",
    //paddingHorizontal: "3%",
    borderRadius: 10,
    margin: "3%",
    textAlign: "center",
    fontSize: 14,
    color: "black",
  },
  inputAPE: {
    backgroundColor: '#e5e4e4',
    width: "94%",
    paddingVertical: "3%",
    //paddingHorizontal: "2%",
    borderRadius: 10,
    marginHorizontal: "3%",
    textAlign: "center",
    fontSize: 20,
    color: "black",
  },
  Title: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 30,
    padding: "1%",
  },
  borde: {
    marginHorizontal: "3%",
    marginTop: "3%",
    //flex: 0.3,
    borderWidth: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  fila12: {
    //flex: 0.3,
    //borderBottomWidth: 5,
    flexDirection: 'row',
    alignItems: "center",
    width: "100%",
  },
  fila21: {
    //flex: 0.3,
    //borderBottomWidth: 5,
    //textAlign: 'center',
    flexDirection: 'row',
    borderRightWidth: 5,
    justifyContent: 'center',
    alignItems: "center",
    width: "50%",
  },
  fila22: {
    //flex: 0.3,
    //borderBottomWidth: 5,
    //textAlign: 'center',
    flexDirection: 'row',
    //borderRightWidth: 5,
    alignItems: "center",
    justifyContent: 'center',
    width: "50%",
  },
  centro: {
    //width: "50%",
    textAlign: 'center',
    alignItems: "center",
    fontSize: 18,
    paddingLeft: 5,
  },
  fila11: {
    //flex: 0.3,
    borderBottomWidth: 5,
    flexDirection: 'row',
    //alignItems: "center",
    width: "100%",
  },
});

 