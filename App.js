// import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';

import {Camera} from 'expo-camera';

import { resizeImage, imageToTensor, getModel } from './helpers';

let camera = Camera

const class_labels = ['safe', 'unsafe']

export default function App() {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [startCamera, setStartCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [predictedValue, setPrediction] = useState(null);

  const _startCamera = async () => {
    const {status} = await Camera.requestPermissionsAsync()
    if(status === 'granted') {
      setStartCamera(true)
      setPrediction(null)

    }
    else {
      Alert.alert("Access denied")
    }
  }

  const __takePicture = async () => {
    const photo = await cameraRef.takePictureAsync()
    // console.log(photo)
    setPreviewVisible(true)
    setCapturedImage(photo)
    setStartCamera(false);
    
    processImageAndPredict(photo)
  }

  const classify_image = async (model, imageTensor) => {

    try {
      const output = await model.predict(imageTensor)
      
      return output.dataSync()
    }
    catch (err) {
      console.warn(err)
    }

  }

  const processImageAndPredict = async (photo) => {
    const model = await getModel()

    const image = await resizeImage(photo.uri, 224 , 224);
    
    const imageTensor = await imageToTensor(image.base64);

    const prediction = await classify_image(model, imageTensor)

    console.log(prediction)
    const highestPredictionIndex = prediction.indexOf(
      Math.max.apply(null, prediction),
    );
    const predicted_results = {
      predicted_class: class_labels[highestPredictionIndex],
      probability: prediction[highestPredictionIndex].toFixed(2)
    }
    setPrediction(predicted_results)

  }


  return (
    <View style={styles.container}>
      <View
        style={{
          height: '70%',
          width: '100%'
        }}
      >
        {
          startCamera ? 
            <Camera
              style={{flex: 1, width:"100%", height: '100%'}}
              ref={(r) => {
                cameraRef = r
              }}
              type={camera.Constants.Type.front}
              autoFocus={camera.Constants.AutoFocus.on}
              whiteBalance={camera.Constants.WhiteBalance.auto}
            >
              <View
                style={{
                position: 'absolute',
                bottom: 0,
                flexDirection: 'row',
                flex: 1,
                width: '100%',
                padding: 20,
                justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                      <TouchableOpacity
                        onPress={__takePicture}
                        style={{
                        width: 70,
                        height: 70,
                        bottom: 0,
                        borderRadius: 50,
                        backgroundColor: '#fff'
                        }}
                        />
                  </View>
              </View>
            </Camera>
            :
            <View
            style={{
              flex: 1,
              width: '100%',
              height: '80%',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            >
              {
                previewVisible && capturedImage && (
                <View
                style={{
                  width: '80%',
                  height: '80%'
                }}
                >
                  <CameraPreview photo={capturedImage} ></CameraPreview>
                  {
                    predictedValue ? 
                    <Text style={{marginBottom: 15}}>Class: {predictedValue.predicted_class} Probability: {predictedValue.probability}</Text>
                    :
                    <ActivityIndicator style={styles.activityIndicatiorStyle} color="#000000" size="large" />
                  }
                  
                </View>
              )
              
            }
              <Button
                title="Take Picture"
                buttonStyle={styles.buttonStyle}
                onPress={_startCamera}
              ></Button>

            </View>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStyle: { 
    marginTop: 15,
    marginBottom: 15
  },
  activityIndicatiorStyle: {
    marginTop: 10,
    marginBottom: 10
  }
});

const CameraPreview = ({photo}) => {
  
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        flex: 1,
        width: '100%',
        height: '100%',
        marginBottom: 20
      }}
    >
      <ImageBackground
        source={{uri: photo && photo.uri}}
        style={{
          flex: 1
        }}
      >
      </ImageBackground>
    </View>
  )
}
