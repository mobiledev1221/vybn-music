import RNAdvertisingId from 'react-native-advertising-id';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
import * as Config from '../config';
import XMLParser from 'react-xml-parser';
import { axiosGet } from './axiosGet';

export const getAppGeneratedID = () => {
    let generatedId = '';
    try {
        generatedId =  'app:' + uuidv4();
    } catch (e) {
        console.log("error in getting uuidv4: ", e);
    }
    if (generatedId.length < 5) {
        generatedId = 'app:109156be-c4fb-41ea-b1b4-efe1671c5836';
    }
    // console.log("AD App-generated Id: " + generatedId);
    return generatedId;
};

export const getListenerId = (appId) => {
    return new Promise((resolve) => {
        try {
            RNAdvertisingId.getAdvertisingId()
                .then(response => {
                    if (response.isLimitAdTrackingEnabled) {
                        resolve(appId);
                        return;
                    }
                    if (response.advertisingId) {
                        if (Platform.OS == 'ios') {
                            resolve('idfa:' + response.advertisingId);
                            return;
                        } else if (Platform.OS == 'android') {
                            resolve('gaid:' + response.advertisingId);
                            return;
                        }
                    }
                    resolve(appId);
                })
                .catch(error => {
                    console.error(error);
                    resolve(appId);
                });
        } catch (e) {
            console.log("Error in getting advertising Id: ", e);
            resolve(appId);
        }
    });
};

export const getAdRequestEntryPoint = (listenerId) => {
    let endPoint = Config.AD_REQUEST_ENTRY_POINT + '&lsid=' + listenerId;
    if (Platform.OS == 'android') {
        endPoint += '&store-id=' + Config.GOOGLE_STORE_ID + '&store-url=' + encodeURI(Config.GOOGLE_STORE_URL);
    } else {
        endPoint += '&store-id=' + Config.APPLE_STORE_ID + '&store-url=' + encodeURI(Config.APPLE_STORE_URL);
    }
    return endPoint;
};

function getUriFromTagValue(value) {
    const index = value.indexOf('http');
    const pathSub = value.substr(index);
    const realPath = pathSub.replace(/[\]>]+/g, "").trim();
    return realPath;
}

export const getAndAnalyzeVAST = (endPoint, props) => {
    const result = {
        mediaUri: "",
        impressionUris: [],
        trackingUris: []
    };
    return new Promise((resolve) => {
        axiosGet(endPoint, props, { timeout: 5000, responseType: 'text' })
        // fetch(endPoint)
            // .then(response => response.text())
            .then(response => {
                var xml = new XMLParser().parseFromString(response.data);
                const mediafiles = xml.getElementsByTagName('MediaFile');
                if (mediafiles.length > 0) {
                    result.mediaUri = getUriFromTagValue(mediafiles[0].value);
                }
                const impressions = xml.getElementsByTagName("Impression");
                impressions.forEach(item => {
                    const path = getUriFromTagValue(item.value);
                    if (path) {
                        result.impressionUris.push(path);
                    }
                });
                // console.log("Ad Links: ", result);
                resolve(result);
            }).catch(e => {
                console.log('Error in getting ads uri ---> ', e);
                resolve(result);
            });
    });
};

export const getAdLinks = async (adAppId, props) => {
    const listenerId = await getListenerId(adAppId);
    console.log("Ad listener Id: " + listenerId);
    const links = await getAndAnalyzeVAST(getAdRequestEntryPoint(listenerId), props);
    return links;
};