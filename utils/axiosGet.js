import axios from 'axios';
import BackgroundTimer from './BackgroundTimer';
import * as Config from '../config';

export const axiosGet = async (url, props, options = {}) => {
  // console.log("axiosToken: ", props.state.axiosToken);
  BackgroundTimer.clearInterval(props.state.backTimer);
  // console.log("axios get");
  props.setAxiosGetting(true);
  const timer = BackgroundTimer.setInterval(
    () => {
      // console.log("axios get interval");
      props.state.axiosToken.cancel(`Timeout of ${Config.AXIOS_TIMEOUT}ms.`);
      BackgroundTimer.clearInterval(props.state.backTimer);
      props.setAxiosGetting(false);
    },
    Config.AXIOS_TIMEOUT
  );
  // console.log("axios back timer: ", timer);
  await props.setBackTimer(timer);
  return axios
    .get(url, { cancelToken: props.state.axiosToken.token, ...options })
    .then(response => {
      BackgroundTimer.clearInterval(props.state.backTimer);
      props.setAxiosGetting(false);
      return response;
    });
};