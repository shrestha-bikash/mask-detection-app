import {Dimensions} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native';
import {Base64Binary} from './utils';

// const {height: DEVICE_HEIGHT, width: DEVICE_WIDTH} = Dimensions.get('window');

// got the dimension from the trained data of the *Teachable Machine*; pixel resolution conversion (8x)
export const BITMAP_DIMENSION = 224;

const modelJson = require("./assets/model/model.json");
const modelWeights = require("./assets/model/weights.bin");

export const resizeImage = async (imageUrl, width, height) => {
    const actions = [{
      resize: {
        width,
        height
      },
    }];
    const saveOptions = {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    };
    const res = await ImageManipulator.manipulateAsync(imageUrl, actions, saveOptions);
    return res;
}

export const imageToTensor = async (base64) => {
  try {
    const uIntArray = Base64Binary.decode(base64);
    // decode a JPEG-encoded image to a 3D Tensor of dtype
    const decodedImage = decodeJpeg(uIntArray, 3).div(tf.scalar(255));
    console.log(decodedImage)
    // reshape Tensor into a 4D array

    const tensorData = decodedImage.reshape([1, BITMAP_DIMENSION, BITMAP_DIMENSION, 3,]);

    return tensorData;
  } catch (error) {
    console.log('Could not convert base64 string to tesor', error);
  }
}

export const getModel = async () => {
    try {
      // wait until tensorflow is ready
      await tf.ready();
      // load the trained model
      return await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    } catch (error) {
      console.log('Could not load model', error);
    }
};