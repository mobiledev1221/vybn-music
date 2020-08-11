import React, { Component } from 'react';
import {
  Text, Image, ImageBackground, View, StyleSheet, TouchableOpacity, AsyncStorage, Easing
} from "react-native";
import { Audio } from 'expo-av';
import TextTicker from 'react-native-text-ticker';

import { CustomPicker } from 'react-native-custom-picker';
import { Triangle } from "react-native-shapes";
import HeaderLeft from "../assets/music/musci_play_header_left.png";
import ProfileEmpty from "../assets/profile.png";
import HeaderMiddleBackground from "../assets/music/music_play_header_middle_background.png";
import HeaderTimeTracker from "../assets/music/header-time-tracker.png";
import PlayButton from "../assets/music/play_button.png";
// import PauseButton from "../assets/music/pause_button.png";
import MuteButton from "../assets/music/mute_button.png";
import NormalSoundButton from "../assets/music/normal_sound_button.png";
import PlayButtonSide from "../assets/music/play_button_side.png";
// import DownloadButton from "../assets/music/play_button_download.png";
// import UpArrow from "../assets/music/play_button_up_arrow.png";
import TrackNameBackground from "../assets/music/track_name_background.png";
import TrackNameBottomShadow from "../assets/music/track_name_bottom_shadow.png";
import ButtonBack from "../assets/emptyboxcheckmark.png";
import Heart from "../assets/tracks_levels/heart.png";
import IImage from "../assets/I.png";
import IIImage from "../assets/II.png";
import Binoculars from "../assets/tracks_levels/binoculars.png";
import CancelBtn from "../assets/music/cancel-btn.png";
import * as Config from '../config';

import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import md5 from "react-native-md5";
import axios from 'axios';
import { PlayQueue } from '../utils/utils';
import { Mutation } from 'react-apollo';
import { gql } from "apollo-boost";
import client from "../graphql/client";
import showError from "../utils/showError";
import LoadingModal from "./Loading";
import Menu, { MenuItem } from 'react-native-material-menu';
import { GET_CHANNEL } from '../graphql/queries';
import { getAppGeneratedID, getAdLinks } from '../utils/advertising';
import { axiosGet } from '../utils/axiosGet';

class HeadPlay extends Component {

    constructor(props) {
      super(props);

      this.state = {
        loggedIn: "",
        stationIndex: props.state.selectedChannelIndex,
        channelLoading: false,
        emptyCount: "",
        statusString: "",
        count: 0,
      };

      this.updateTrackTier = async () => {};
      this._menu = React.createRef();
      this._unsubscribeFocus = null;

      this.toggleAudioPlayback = this.toggleAudioPlayback.bind(this);
      this.playNextSong = this.playNextSong.bind(this);
      // this.playPrevSong = this.playPrevSong.bind(this);
      this.selectChannel = this.selectChannel.bind(this);
    }

    async componentDidMount() {
      this._unsubscribeFocus = this.props.navigation.addListener('willFocus', () => {
        this.props.setActivePlayRoute(this.props.navigation.state.routeName);
      });
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      this.setState({ loggedIn });
    }

    componentWillUnmount() {
      if (this._unsubscribeFocus && this._unsubscribeFocus.remove instanceof Function) {
        this._unsubscribeFocus.remove();
      }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
      if (
        this.props.state.activePlayRoute == this.props.navigation.state.routeName &&
        this.props.state.selectedTrack != newProps.state.selectedTrack
      ) {
        if (this.props.state.initializingPlay) {
          this.props.setQueued(true)
        } else {
          this.props.setQueued(false)
          this.playTrack(newProps.state.selectedTrack);
        }
      }
      if (this.props.state.selectedChannelIndex != newProps.state.selectedChannelIndex) {
        this.setState({
          stationIndex: newProps.state.selectedChannelIndex
        });
      }
    }

    initPlayer = () => {
      if (!this.props.state.soundObject) {
        const soundObject = new Audio.Sound();

        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });

        soundObject.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            // console.log("********** The current song has just been finished. About to play the next song **********");
            const totalPlayTime = this.props.state.totalPlayTime;
            const adPlayCount = this.props.state.adPlayCount;
            const shouldPlayAd = !this.props.state.profile || this.props.state.profile.plan_type == "free";
            const playAd = this.props.state.playAd;
            // console.log("totalPlayTime: ", totalPlayTime, " adPlayCount: ", adPlayCount);
            if (shouldPlayAd && !playAd && totalPlayTime / Config.AD_INTERVAL >= adPlayCount + 1) {
              this.props.setPlayAd(true);
              this.props.saveSelectedTrack({...this.props.state.selectedTrack});
            } else {
              this.props.setPlayAd(false);
              if (this.props.state.playQueue) {
                const nextTrack = await this.props.state.playQueue.getNextTrack(
                  this.props.state.dmcaParams,
                  this.props.setDMCAParams
                );
                this.props.saveSelectedTrackIndex(this.props.saveSelectedTrackIndex + 1);
                this.props.saveSelectedTrack(nextTrack);
              } else {
                this.props.saveSelectedTrackIndex(0);
                this.props.saveSelectedTrack(null);
              }
            }
          } else if (status.isLoaded && this.props.state.updateTrackerWidth && this.props.state.playstate) {
            const tWidth = Math.round(98 * status.positionMillis / status.durationMillis);
            if (this.props.state.timeTrackerWidth != tWidth) {
              this.props.saveTimeTrackerWidth(tWidth);
            }
          }
        });
        this.props.saveSoundObject(soundObject);
        return soundObject;
      }
      return this.props.state.soundObject;
    };

    addTrackId = async (trackId) => {
      // console.log('addTrackId ------------------> ');
      try {
        const result = await client.mutate({
          mutation: ADD_CURRENT_TRACK_ID,
          variables: { trackId: trackId }
        })
  
        // console.log(result);
      } catch(error) {
        console.log('addTrackId error : ', error);
      }
    }

    playTrack = async (track) => {
      this.props.setInitializingPlay(true);
      this.setState({
        statusString: "Initializing"
      });
      const soundObject = this.initPlayer();
      this.setState({
        statusString: "Initializing: after initPlayer"
      });
      if (!track) {
        soundObject.unloadAsync();
        // this.props.setDuration(0);
        if (this.props.state.playQueue) {
          this.props.state.playQueue.initializeFactors();
          const nextTrack = await this.props.state.playQueue.getNextTrack(
            this.props.state.dmcaParams,
            this.props.setDMCAParams
          );
          this.props.saveSelectedTrackIndex(0);
          this.props.saveSelectedTrack(nextTrack);
        }
        this.props.savePlayState(false);
        this.props.saveTimeTrackerWidth(0);

        this.props.setInitializingPlay(false);
        if (this.props.state.queued) {
          this.props.setQueued(false);
          this.playTrack(this.props.state.selectedTrack);
        }
        this.setState({
          statusString: "Initialized: null"
        });
        return;
      } else {
        // console.log('trackid ----------------------------->', track.MnetId);
        this.addTrackId(track.MnetId);

        const trackCount = this.state.count + 1;
        this.setState({
          statusString: "Initializing: before getting uri",
          count: trackCount
        });
        let trackUri = '';
        let adLinks = {};
        const abortToken = axios.CancelToken.source();
        await this.props.setAxiosToken(abortToken);
        if (this.props.state.playAd) {
          let adAppId = this.props.state.adAppId;
          if (!adAppId) {
            adAppId = getAppGeneratedID();
            this.props.setAdAppId(adAppId);
          }
          this.setState({
            statusString: "Initializing: before getting uri - AD " + trackCount
          });
          adLinks = await getAdLinks(adAppId, this.props);
          
          trackUri = adLinks.mediaUri;
        } else {
          try {
            this.setState({
              statusString: "Initializing: before getting uri - track " + trackCount
            });
            const signature = md5.hex_hmac_md5(Config.SHARED_SECRET, Config.RADIO_GETMEDIALOCATION + track.MnetId);
            const locationUrl = Config.MNDIGITAL_BASE + Config.RADIO_GETMEDIALOCATION + track.MnetId + "&signature=" + signature;
            const res = axiosGet(locationUrl, this.props, { timeout: 5000 });
            const { data } = await res;
            trackUri = data.Location;
          } catch (e) {
            console.log("Error in getting track location: ", e);
            // this.props.setInitializingPlay(false);
            // if (this.props.state.queued) {
            //   this.props.setQueued(false);
            //   this.playTrack(this.props.state.selectedTrack);
            // } else {
            //   this.props.savePlayState(false);
            // }
            // this.setState({
            //   statusString: "Initialized: Failed in getting trackuri"
            // });
            // return;
            trackUri = "";
          }
        }
        
        if (this.props.state.queued) {
          this.props.setQueued(false);
          this.props.setInitializingPlay(false);
          this.playTrack(this.props.state.selectedTrack);
          this.setState({
            statusString: "Initialized: play queued track"
          });
          this.props.setRefreshingPlay(false);
          return;
        }

        try {
          await soundObject.unloadAsync();
        } catch (e) {
          console.log("Error in unloading sound object: ", e);
          this.state.saveSoundObject(null);
          if (this.props.state.queued) {
            this.props.setQueued(false);
          }
          this.props.setInitializingPlay(false);
          this.props.saveSelectedTrack({...this.props.state.selectedTrack});
          this.playTrack(this.props.state.selectedTrack);
          this.setState({
            statusString: "Initialized: unload failed"
          });
          this.props.setRefreshingPlay(false);
          return;
        }
          
        if (!trackUri) {
          console.log("Error: empty track location.");
          this.props.setPlayAd(false);
          this.props.setInitializingPlay(false);
          if (this.state.emptyCount < 2) {
            this.setState({
              emptyCount: this.state.emptyCount + 1
            });
            if (this.props.state.refreshingPlay) {
              this.props.setRefreshingPlay(false);
              this.props.saveSelectedTrack({...this.props.selectedTrack});
            } else {
              const index = this.props.state.selectedTrackIndex + 1;
              const nextTrack = await this.props.state.playQueue.getNextTrack(
                this.props.state.dmcaParams,
                this.props.setDMCAParams
              );
              this.props.saveSelectedTrackIndex(index);
              this.props.saveSelectedTrack(nextTrack);
            }
          } else {
            this.props.savePlayState(false);
            this.props.saveTimeTrackerWidth(0);
          }
          this.setState({
            statusString: "Initialized: empty track location -> next track"
          });
          return;
        } else {
          this.setState({
            emptyCount: 0
          });
        }

        this.setState({
          statusString: "Initializing: before loading"
        });

        try {
          await soundObject.loadAsync({ uri: trackUri });
          this.setState({
            statusString: "Initializing: before playing"
          });
          this.props.saveUpdateTrackerWidth(true);
          soundObject.setIsLoopingAsync(false);
          if (this.props.state.playstate) {
            await soundObject.playAsync();
            soundObject.setIsMutedAsync(this.props.state.isMuted);
          }
          this.setState({
            statusString: "Initialized: success"
          });
          this.props.setInitializingPlay(false);
          if (this.props.state.queued) {
            this.props.setQueued(false);
            this.playTrack(this.props.state.selectedTrack);
            return;
          }
          
          const shouldPlayAd = !this.props.state.profile || this.props.state.profile.plan_type == "free";
          if (shouldPlayAd && !this.props.state.playAd) {
            const duration = this.props.state.playQueue.getSeconds(track);
            this.props.setTotalPlayTime(this.props.state.totalPlayTime + duration);
          } else if (shouldPlayAd && this.props.state.playAd) {
            const adPlayCount = this.props.state.adPlayCount;
            this.props.setAdPlayCount(adPlayCount + 1);
            if (adLinks.impressionUris && adLinks.impressionUris.length > 0) {
              adLinks.impressionUris.forEach(item => {
                fetch(item)
                  .catch(e => console.log("error in calling impression: ", e));
                  // .then(() => console.log("impression called"))
              });
            }
          }
        } catch (e) {
          console.log(`Error in loading and playing track: `, e);
          this.props.setPlayAd(false);
          this.props.setInitializingPlay(false)
          if (this.props.state.queued) {
            this.props.setQueued(false);
            this.playTrack(this.props.state.selectedTrack);
          } else {
            this.props.savePlayState(false);
          }
          this.setState({
            statusString: "Initialized: Failed in loading and playing track"
          });
        }
      }
    };

    async playNextSong() {
      if (!this.checkSkipCancelTimes()) {
        showError("Track skip limit exceeded.");
        return;
      }
      var index = this.props.state.selectedTrackIndex + 1;
      const nextTrack = await this.props.state.playQueue.getNextTrack(
        this.props.state.dmcaParams,
        this.props.setDMCAParams
      );
      this.props.saveSelectedTrackIndex(index);
      this.props.saveSelectedTrack(nextTrack);
      // if ( this.props.musicHeader != null ) {
      //   this.props.refreshTracksSliderPosition(index);
      // }
    }

    async toggleAudioPlayback() {
      if (!this.props.state.selectedTrack) {
        return;
      }
      const playState = this.props.state.playstate;
      const isMuted = this.props.state.isMuted;
      const soundObject = this.props.state.soundObject;
      if (!soundObject) {
        return;
      }
      const loadState = await soundObject.getStatusAsync();
      if (!playState) {
        this.props.savePlayState(!playState);
        if (!loadState.isLoaded) {
          this.props.saveSelectedTrack({...this.props.state.selectedTrack});
        } else {
          try {
            await soundObject.playAsync();
          } catch (e) {
            console.log("Error in play button click");
            this.state.saveSoundObject(null);
            setTimeout(() => {
              if (this.props.state.queued) {
                this.props.setQueued(false);
              }
              this.props.saveSelectedTrack({...this.props.state.selectedTrack});
            }, 100);
          }
        }
      } else {
        // if (loadState.isLoaded) {
        //   soundObject.pauseAsync();
        // }
        if (!loadState.isLoaded && !this.props.state.initializingPlay) {
          this.props.saveSelectedTrack({...this.props.state.selectedTrack});
        } else if (loadState.isLoaded) {
          try {
            await soundObject.setIsMutedAsync(!isMuted);
          } catch (e) {
            console.log('Error in setting Mute: ', e);
          }
        }
        this.props.saveIsMuted(!isMuted);
      }
    }

    async selectChannel(val) {
      const channelArr = this.props.state.myChannels;
      if (!channelArr || channelArr.length < val + 1 || val < 0) {
        return;
      }
      this.setState({
        channelLoading: true
      });
      const id = channelArr[val].id;
      try {
        const { data } = await client.query({
            query: GET_CHANNEL,
            variables: {
              id
            }
        });
        
        const myChannels = channelArr.map(channel => {
          return channel.id == id ? data.getChannel : channel;
        });
        
        this.props.saveMyChannels(myChannels);
        this.props.saveSelectedChannelIndex(val);

        const playQueue = new PlayQueue(data.getChannel);
        this.props.savePlayQueue(playQueue);
        this.props.saveSelectedChannel(data.getChannel);
        const nextTrack = await this.props.state.playQueue.getNextTrack(
          this.props.state.dmcaParams,
          this.props.setDMCAParams
        );
        this.props.setPlayAd(false);
        this.props.saveSelectedTrackIndex(0);
        this.props.saveSelectedTrack(nextTrack);
      } catch (error) {
        console.log('Error in get channel: ', error.message);
      }
      this.setState({
        channelLoading: false
      });
    }

    stationPickerSelect = () => {
      const myChannels = this.props.state.myChannels ? [...this.props.state.myChannels] : [];
      myChannels.push({
        id: 0,
        stationName: "Premade Stations"
      });

      return (
        <View style={{ height: 40, justifyContent: "center" }} >
          <CustomPicker
            placeholder={'Select a station'}
            options={myChannels}
            getLabel={item => item.stationName}
            fieldTemplate={this.renderField}
            optionTemplate={this.renderOption}
            value={myChannels.length > 0 ? myChannels[this.state.stationIndex] : null}
            onValueChange={value => {
              if (value.id == 0) {
                this.props.initializeStations();
                this.props.navigation.navigate("Guest");
              }
              const index = myChannels.findIndex(channel => {
                return channel.id == value.id;
              });
              if (index == this.state.stationIndex) {
                return;
              }
              this.setState({
                stationIndex: index
              });
              this.selectChannel(index);
              console.log('Selected Item', value ? JSON.stringify(value.stationName) : 'No item were selected!')
            }}
            modalStyle={{
              backgroundColor: "#2D2E37"
            }}
          />
        </View>
      );
    }

    renderField = settings => {
      const { selectedItem, defaultText, getLabel, clear } = settings
      return (
        <View style={styles.container}>
          <View style={{ flex: 1}}>
            <Text style={styles.text}>{ selectedItem ? getLabel(selectedItem) : defaultText}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Triangle size={1.3} color="#abaed0" rotate={180} type="isosceles" />
          </View>
        </View>
      )
    };
   
    renderOption = settings => {
      const { item, getLabel } = settings
      return (
        <View style={styles.optionContainer}>
          <Text style={styles.text}>{getLabel(item)}</Text>
        </View>
      );
    };

    moveTrackToTier = async (tierNum) => {
      const sChannel = this.props.state.selectedChannel;
      const sTrack = this.props.state.selectedTrack;

      if (!sTrack) {
        showError("No track is selected.");
        return;
      }

      if (!sChannel) {
        showError("No channel is selected.");
        return;
      }

      const { loggedIn } = this.state;
      const { isGuest } = this.props;

      if (isGuest) {
        if (loggedIn == "true") {
          showError("Can't update stations in GuestListener. Please go to Now Playing.");
        } else {
          showError("Create a free account to update stations");
        }
        return;
      }

      const originalTier = sTrack.tier;
      let cancelLimitExceeded = false;
      if (tierNum == -1 && !this.checkSkipCancelTimes()) {
        cancelLimitExceeded = true;
      }

      try {
        const { data } = await this.updateTrackTier({
            variables: {
              channelId: this.props.state.selectedChannel.id,
              trackId: parseInt(this.props.state.selectedTrack.MnetId),
              tierNum: tierNum
            },
            update: (store) => {
              const data = store.readQuery({
                query: GET_CHANNEL,
                variables: {
                  id: sChannel.id
                }
              });

              if (originalTier == "Heart") {
                data.getChannel.tierHeart = data.getChannel.tierHeart.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Tier1") {
                data.getChannel.tier1 = data.getChannel.tier1.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Tier2") {
                data.getChannel.tier2 = data.getChannel.tier2.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Binoculars") {
                data.getChannel.tierBinoculars = data.getChannel.tierBinoculars.filter(t => t.MnetId != sTrack.MnetId);
              }
    
              if (tierNum == 0) {
                data.getChannel.tierHeart.push(sTrack);
              } else if (tierNum == 1) {
                data.getChannel.tier1.push(sTrack);
              } else if (tierNum == 2) {
                data.getChannel.tier2.push(sTrack);
              } else if (tierNum == 3) {
                data.getChannel.tierBinoculars.push(sTrack);
              }

              store.writeQuery({
                query: GET_CHANNEL,
                variables: {
                  id: sChannel.id
                },
                data
              });
            }
        });

        if (data.updateTrackTier) {
          if (originalTier == "Heart") {
            sChannel.tierHeart = sChannel.tierHeart.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Tier1") {
            sChannel.tier1 = sChannel.tier1.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Tier2") {
            sChannel.tier2 = sChannel.tier2.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Binoculars") {
            sChannel.tierBinoculars = sChannel.tierBinoculars.filter(t => t.MnetId != sTrack.MnetId);
          }

          if (tierNum == 0) {
            sTrack.tier = "Heart";
            sChannel.tierHeart.push(sTrack);
          } else if (tierNum == 1) {
            sTrack.tier = "Tier1";
            sChannel.tier1.push(sTrack);
          } else if (tierNum == 2) {
            sTrack.tier = "Tier2";
            sChannel.tier2.push(sTrack);
          } else if (tierNum == 3) {
            sTrack.tier = "Binoculars";
            sChannel.tierBinoculars.push(sTrack);
          } else {
            sTrack.tier = "Explore"
          }

          this.props.saveSelectedTrack(sTrack);
          this.props.state.playQueue.updateChannel(sChannel);

          if (tierNum == -1) {
            if (cancelLimitExceeded) {
              showError("Track skip limit exceeded. We've removed the track from your station.");
            } else {
              const index = this.props.state.selectedTrackIndex + 1;
              const nextTrack = await this.props.state.playQueue.getNextTrack(
                this.props.state.dmcaParams,
                this.props.setDMCAParams
              );
              this.props.saveSelectedTrackIndex(index);
              this.props.saveSelectedTrack(nextTrack);
            }
          }
        } else {
          showError("Updating Track Tier Failed");
        }
      } catch (error) {
        if (error.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
          await AsyncStorage.removeItem("authtoken1");
          await AsyncStorage.removeItem("loggedIn");
          showError("Session timeout. Please login again");
          this.props.navigation.navigate("Auth");
          this.props.saveProfile(null);
          this.props.initializeStations();
        } else {
          showError(error.message);
        }
      }
    };

    checkSkipCancelTimes = () => {
      const times = this.props.state.skipCancelTimes;
      const currentTime = Math.floor(new Date().getTime() / 1000);
      const updatedTimes = times.filter(time => time >= currentTime - 3600);
      let valid = false;
      if (updatedTimes.length < 6) {
        updatedTimes.push(currentTime);
        valid = true;
      }
      this.props.saveSkipCancelTimes(updatedTimes);
      return valid;
    };

    gotoNowPlaying = () => {
      this._menu.hide();
      this.props.initializeStations();
      this.props.navigation.navigate("Music");
    };

    gotoProfile = () => {
      this._menu.hide();
      this.props.navigation.navigate("Profile");
    };

    gotoLogin = () => {
      this._menu.hide();
      this.props.initializeStations();
      this.props.navigation.navigate("Auth");
    };

    logout = async () => {
      this._menu.hide();
      await AsyncStorage.removeItem("authtoken1");
      await AsyncStorage.removeItem("loggedIn");
      this.props.navigation.navigate("Auth");
      this.props.saveProfile(null);
      this.props.initializeStations();
    };

    gotoSignup = () => {
      this._menu.hide();
      this.props.navigation.navigate("Register");
      this.props.initializeStations();
    };

    render() {
        var profileImg = '';
        if ( this.props.state.profile != null && this.props.state.profile.profilePic ) {
          profileImg = Config.STATIC_URL+'/'+this.props.state.profile.profilePic;
        }

        const selectedTrack = this.props.state.selectedTrack;
        const selectedTrackTitle = selectedTrack != null
          ? selectedTrack.title + ", " + selectedTrack.name + ", " + selectedTrack.albumTitle
          : "";
        var selectedTrackTier = selectedTrack ? selectedTrack.tier : "Explore";
        const playState = this.props.state.playstate;
        const isMuted = this.props.state.isMuted;
        const { loggedIn } = this.state;
        const { isGuest } = this.props;
        const trackerWidth = this.props.state.timeTrackerWidth;

        const playAd = this.props.state.playAd;

        return (
          <Mutation mutation={UDPATE_TRACK_TIER}>
            {(updateTrackTier, {loading}) => {
              this.updateTrackTier = updateTrackTier;

              return (
                <View>
                  {(loading || this.state.channelLoading) && <LoadingModal />}
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",  marginTop: 30}} >
                    <View style={{ marginRight: 10, marginTop: 5 }}>
                      <Image style={{ width: 50, height: 50 }} source={HeaderLeft} />
                    </View>
                    <View style={{ flex: 1, marginTop: 9, flexDirection: "column"}} >
                      <ImageBackground
                        imageStyle={{
                          shadowColor: "#4d4f5e",
                          shadowOffset: { width: 2, height: 0 },
                          shadowRadius: 0,
                        }}
                        style={{
                          height: 30,
                          width: "100%",
                          position: "relative"
                        }}
                        source={HeaderMiddleBackground}
                        resizeMode="stretch"
                      >
                        <Image
                          source={HeaderTimeTracker}
                          style={{
                            position: "absolute",
                            top: 6,
                            left: "1%",
                            height: 18,
                            width: `${trackerWidth}%`,
                            borderRadius: 9
                          }}
                          resizeMode="cover"
                        />
                        <View style={{ height: 30, justifyContent: "center", position: "relative", paddingHorizontal: 10 }} >
                          <TextTicker
                            style={{ fontSize: 14, color: "#abaed0", fontWeight: "bold" }}
                            scrollSpeed={350}
                            easing={Easing.linear}
                            loop
                            bounce={false}
                            repeatSpacer={50}
                            marqueeDelay={1000}
                          >
                            {selectedTrackTitle}
                          </TextTicker>
                        </View>
                      </ImageBackground>
                      <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", justifyContent: 'center' }} >
                        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 7 }} >
                            <TouchableOpacity onPress={this.toggleAudioPlayback}>
                              {
                                !playState
                                  ? <Image source={PlayButton} />
                                  : isMuted ? <Image source={NormalSoundButton} /> : <Image source={MuteButton} />
                              }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.playNextSong} disabled={playAd}>
                              <Image source={PlayButtonSide} style={{ marginLeft: -5, marginTop: 4 }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(0)}
                          disabled={playAd || selectedTrackTier == "Heart"}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Heart" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={Heart} style={{ height: null, width: 18, aspectRatio: 14 / 13 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(1)}
                          disabled={playAd || selectedTrackTier == "Tier1"}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Tier1" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={IImage} style={{ height: 14.5, width: null, aspectRatio: 5 / 22 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(2)}
                          disabled={playAd || selectedTrackTier == "Tier2"}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Tier2" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={IIImage} style={{ height: 14.5, width: null, aspectRatio: 15 / 22 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(3)}
                          disabled={playAd || selectedTrackTier == "Binoculars"}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Binoculars" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={Binoculars} style={{ height: null, width: 20, aspectRatio: 18 / 11 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(-1)}
                          disabled={playAd}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={styles.iconWrapper}
                            >
                              <Image source={CancelBtn} style={{ height: null, width: 16, aspectRatio: 1, marginTop: 2 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                          onPress={this.upgradeTrack}
                          disabled={loggedIn != "true" || selectedTrackTier == "Explore" || selectedTrackTier == "Heart"}
                        >
                          <Image source={UpArrow} style={{ marginRight: 7 }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.downgradeTrack}
                          disabled={loggedIn != "true" || selectedTrackTier == "Explore" || selectedTrackTier == "Binoculars"}
                          // onPress={this.playNextSong}
                        >
                          <Image source={DownloadButton} style={{ marginRight: 7 }} />
                        </TouchableOpacity> */}
                      </View>
                      {/* <View>
                        <Text style={{color: 'white'}}>{this.state.statusString}</Text>
                      </View> */}
                    </View>
                    <View style={{ marginTop: 9, marginLeft: 12 }}>
                      <Menu
                        ref={ ref => this._menu = ref }
                        button={ 
                          <TouchableOpacity
                            onPress={() => this._menu.show()}
                          >
                            { profileImg != ''
                              ? <Image style={{ width: 33, height: 34, borderRadius: 7 }} source={{ uri: profileImg }} />
                              : <Image style={{ width: 33, height: 34, borderRadius: 7 }} source={ProfileEmpty} />
                            }
                          </TouchableOpacity>
                        }
                      >
                        <MenuItem
                          onPress={
                            loggedIn == "true"
                              ? (isGuest ? this.gotoNowPlaying : this.gotoProfile)
                              : this.gotoLogin
                          }
                          style={ styles.menuItem }
                          textStyle={ styles.menuItemText }
                        >
                          { loggedIn == "true" ? (isGuest ? "Now Playing" : "Profile") : "Login" }
                        </MenuItem>
                        <MenuItem
                          onPress={ loggedIn == "true" ? this.logout : this.gotoSignup }
                          style={ styles.menuItem }
                          textStyle={ styles.menuItemText }
                        >
                          { loggedIn == "true" ? "Logout" : "Signup" }
                        </MenuItem>
                      </Menu>
                    </View>
                  </View>
                  {
                    !this.props.hideChannelSelect &&
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <View style={{ flex: 1, flexDirection: "column", zIndex: 1 }} >
                          <ImageBackground imageStyle={{ shadowColor: "#4d4f5e", shadowOffset: { width: 2, height: 0 }, shadowRadius: 0, borderColor: "#202024", borderWidth: 1, borderRadius: 5 }}
                              style={{ height: null, width: null }}
                              source={TrackNameBackground} >
                              {this.stationPickerSelect()}
                          </ImageBackground>
                          <View style={{ position: "absolute", left: -20, right: -25, top: 10, zIndex: -1 }} >
                            <Image source={TrackNameBottomShadow} style={{ width: "100%", height: 60 }} resizeMode="stretch" />
                          </View>
                        </View>
                        {/*<Image source={TrackNameSide} />*/}
                    </View>
                  }
                </View>
              );
            }}
          </Mutation>
        );
    }
}

const styles = StyleSheet.create({
  buttonBack: {
    width: 27,
    height: 29,
    marginRight: 5
  },
  iconWrapper: {
    width: 25,
    height: 25,
    marginTop: 1,
    marginLeft: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperSelected: {
    width: 27,
    height: 27,
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#C457BE",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C457BE23"
  },
  container: {
    height: "100%",
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center"
  },
  iconContainer: {
    width: 30,
    alignItems: "center"
  },
  text: {
    fontSize: 16,
    color: '#abaed0'
  },
  headerFooterContainer: {
    padding: 10,
    alignItems: 'center'
  },
  optionContainer: {
    padding: 10
  },
  menuItem: {
    backgroundColor: "#3D3E47"
  },
  menuItemText: {
    fontSize: 16,
    color: '#abaed0'
  }
});

const ADD_CURRENT_TRACK_ID = gql`
  mutation($trackId: String) {
    addCurrentTrackId(trackId: $trackId)
  }
`;

const UDPATE_TRACK_TIER = gql`
  mutation($channelId: Int, $trackId: Int, $tierNum: Int) {
    updateTrackTier(
      channelId: $channelId
      trackId: $trackId
      tierNum: $tierNum
    )
  }
`;

const mapStateToProps = (state) => {
    return {
        state: state.app
    }
}

export default connect(state => (mapStateToProps), actions)(HeadPlay);
