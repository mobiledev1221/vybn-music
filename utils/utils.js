import { gql } from "apollo-boost";
import client from "../graphql/client";
import * as Config from '../config';
import axios from 'axios';

const DMCA_INTERVAL = 12000; // in seconds: 3 hours 20 minutes

export class PlayQueue {
    constructor(channel, mode = "ordered") {
        this.channel = channel;

        this.tierHeart = [];
        this.tier1 = [];
        this.tier2 = [];
        this.tierBinoculars = [];
        this.allTracks = [];

        this.addedPercent = [];  // when some tiers don't have tracks, keep recalculated percentages
        this.playedQueueTotal = []; // all tracks played from start

        this.initialize();
    }

    updateChannel = (uChannel) => {
        this.channel = uChannel;
        this.initialize();
    }

    // get addedPercent values from tier track numbers and frequency value
    initialize = () => {
        this.addedPercent = [];
        if (!this.channel) {
            this.tierHeart = [];
            this.tier1 = [];
            this.tier2 = [];
            this.tierBinoculars = [];
            this.allTracks = [];
            return;
        }

        this.tierHeart = this.channel.tierHeart.map(track => {
            return {
                ...track,
                tier: "Heart"
            };
        });
        this.tier1 = this.channel.tier1.map(track => {
            return {
                ...track,
                tier: "Tier1"
            };
        });
        this.tier2 = this.channel.tier2.map(track => {
            return {
                ...track,
                tier: "Tier2"
            };
        });
        this.tierBinoculars = this.channel.tierBinoculars.map(track => {
            return {
                ...track,
                tier: "Binoculars"
            };
        });
        this.allTracks = [...this.tierHeart, ...this.tier1, ...this.tier2, ...this.tierBinoculars];

        const {
            freHeart, freTier1, freTier2, freBinoculars
        } = this.channel;
    
        const percent = [
            this.tierHeart.length > 0 ? freHeart : 0,
            this.tier1.length > 0 ? freTier1 : 0,
            this.tier2.length > 0 ? freTier2 : 0,
            this.tierBinoculars.length > 0 ? freBinoculars : 0
        ];
    
        const totalPercent = percent.reduce((a, b) => a + b, 0);
        if (totalPercent == 0) {
            return [];
        }
        let sum = 0;
        for (let i = 0; i < 4; i ++) {
            sum += percent[i];
            this.addedPercent.push(sum / totalPercent);
        }
    };

    // initialize factors that affect selection of next song(except frequencies and exploreValue)
    initializeFactors = () => {
        this.playedQueueTotal = [];
    };

    // get next track to play
    getNextTrack = async (dmcaParams, setDMCAParams, track = null) => {
        if (!this.channel) {
            return null;
        }

        // release tracks played 3 hours ago from dmcaParams
        const time3 = Math.floor(new Date().getTime() / 1000) - DMCA_INTERVAL;
        const index = dmcaParams.playedTrackInfos3.findIndex(info => info.startTime >= time3);
        if (index > 1) {
            dmcaParams.playedTrackInfos3.splice(0, index - 1);
            setDMCAParams(dmcaParams);
        }

        if (track) {
            this.setConditionFactors(dmcaParams, setDMCAParams, track);
            return track;
        }
    
        const {
            exploreValue
        } = this.channel;

        const stationTrack = await this.getAlbumTitle(this.getStationTrack(dmcaParams));
        if (!stationTrack) {
            return null;
        }

        // If random number * 100 is less than exploreValue, then select a track from the station tracks
        // Else explore a track from the server.
        let nextTrack = stationTrack;
        if (Math.random() * 100 >= exploreValue && stationTrack.albumMnetId) {
            const exploredTrack = await this.exploreTrack(stationTrack.albumMnetId);
            if (exploredTrack) {
                // console.log("---Original Station Track: ", nextTrack);
                nextTrack = await this.getAlbumTitle(exploredTrack);
            }
        }
        
        // console.log("---Next Station Track: ", nextTrack);

        // If a proper next track is got, update condition factors
        this.setConditionFactors(dmcaParams, setDMCAParams, nextTrack);
        return nextTrack;
    };

    getAlbumTitle = async track => {
        if (!track || track.albumTitle) {
            return track;
        }
        try {
            const track_item = await axios.get(Config.GET_TRACK + "&mnetid=" + track.MnetId);
            if (track_item.data.Success) {
                const album = track_item.data.Track.Album;
                track.albumMnetId = album ? album.MnetId : "";
                track.albumTitle = album ? album.Title : "";
                track.label = album ? album.Label : "";
                track.labelOwnerId = album ? album.LabelOwnerId : 0;
                if (album) {
                    client.mutate({
                        mutation: UPDATE_TRACK_ALBUM_INFO,
                        variables: {
                            MnetId: track.MnetId,
                            albumMnetId: track.albumMnetId,
                            albumTitle: track.albumTitle,
                            label: track.label,
                            labelOwnerId: track.labelOwnerId
                        }
                    });
                }
                return track;
            } else {
                return track;
            }
        } catch (e) {
            console.log("Error in getting Track info: ", e);
            return track;
        }
    }

    getStationTrack = (dmcaParams) => {
        const tracks = [this.tierHeart, this.tier1, this.tier2, this.tierBinoculars];
        let index = 0;

        // get tier index according to random number and addedPercent values
        const pickVal = Math.random();
        if (pickVal < this.addedPercent[0]) {
            index = 0;
        } else if (pickVal < this.addedPercent[1]) {
            index = 1;
        } else if (pickVal < this.addedPercent[2]) {
            index = 2;
        } else {
            index = 3;
        }

        // get tracks that meets DMCA requirements from the tier selected above
        let selectableTracks = tracks[index].filter(track => this.conditionCheck(dmcaParams, track));
        // If it fails, get tracks from all tracks in a station
        if (selectableTracks.length < 1) {
            selectableTracks = this.allTracks.filter(track => this.conditionCheck(dmcaParams, track));
        }

        if (selectableTracks.length < 1) {
            return null;
        }

        // get a random index for selecting next track
        const count = selectableTracks.length;
        let num = Math.floor(Math.random() * count);
        if (num >= count) {
            num = count - 1;
        }

        return selectableTracks[num];
    };

    conditionCheck = (dmcaParams, track) => {
        // if track was played, return false.
        if (this.playedQueueTotal.findIndex(item => item.MnetId == track.MnetId) > -1) {
            return false;
        }

        // DMCA parameters
        const {
            playedTrackInfos3
        } = dmcaParams;

        if (playedTrackInfos3.length < 2) {
            return true;
        }
        
        // Last track played.
        const lastIndex = playedTrackInfos3.length - 1;

        // number of tracks from the same album as the track in 3 hours
        let count = playedTrackInfos3.filter(info => info.albumMnetId == track.albumMnetId).length;

        // condition check: No more than 3 songs in 3 hours from the same album
        if (count >= 3) {
            return false;
        }

        // condition check: No more than 2 songs in a row in 3 hours from the same album
        if (
            track.albumMnetId == playedTrackInfos3[lastIndex].albumMnetId &&
            track.albumMnetId == playedTrackInfos3[lastIndex - 1].albumMnetId
        ) {
            return false;
        }

        // number of tracks from the same artist as track in 3 hours
        count = playedTrackInfos3.filter(info => info.artistMnetId == track.artistMnetId).length;
        
        // condition check: No more than 4 songs in 3 hours from the same artist
        if (count >= 4) {
            return false;
        }

        // condition check: No more than 3 songs in a row in 3 hours from the same artist
        if (
            playedTrackInfos3.length > 2 &&
            track.artistMnetId == playedTrackInfos3[lastIndex].artistMnetId &&
            track.artistMnetId == playedTrackInfos3[lastIndex - 1].artistMnetId &&
            track.artistMnetId == playedTrackInfos3[lastIndex - 2].artistMnetId
        ) {
            return false;
        }
        return true;
    };

    // when track is played, change the factors that affects selecting next tracks
    setConditionFactors = (dmcaParams, setDMCAParams, track) => {
        // push track to played track list.
        this.playedQueueTotal.push(track);

        // push track to 3 hours played track info list.
        dmcaParams.playedTrackInfos3.push({
            MnetId: track.MnetId,
            albumMnetId: track.albumMnetId,
            artistMnetId: track.artistMnetId,
            startTime: Math.floor(new Date().getTime() / 1000)
        });

        setDMCAParams(dmcaParams);
    };

    // get track duration as seconds
    getSeconds = (track) => {
        if (!track.duration) {
            return 0;
        }
        const minSec = track.duration.split(":");
        if (minSec.length == 1) {
            return parseInt(minSec[0]) || 0;
        } else if (minSec.length == 2) {
            return (parseInt(minSec[0]) || 0) * 60 + (parseInt(minSec[1]) || 0);
        } else if (minSec.length == 3) {
            return (parseInt(minSec[0]) || 0) * 3600 + (parseInt(minSec[1]) || 0) * 60 + (parseInt(minSec[2]) || 0);
        } else {
            return 0;
        }
    };

    // explore a track from the server
    exploreTrack = async (albumMnetId) => {
        try {
            const { data, error } = await client.mutate({
                mutation: EXPLORE_TRACK,
                variables: {
                    position: Math.random(),
                    channelId: this.channel.id,
                    albumMnetId,
                    playedTrackMnetIds: this.playedQueueTotal.map(track => track.MnetId)
                }
            });
            if (!error) {
                if (data.exploreTrack.MnetId == "") {
                    return null;
                } else {
                    return {
                        ...data.exploreTrack,
                        tier: "Explore"
                    };
                }
            } else {
                return null;
            }
        } catch (e) {
            console.log("Error in getting Random Track: ", e);
            return null;
        }
    };
};

const GET_RANDOM_TRACK = gql`
  query($position: Float!, $albums: [String]!, $artists: [String]!) {
    randomTrack(position: $position, albums: $albums, artists: $artists) {
      MnetId
      title
      name
      imgsource
      imgsource150
      duration
      albumMnetId
      artistMnetId
      albumTitle
      label
      labelOwnerId
    }
  }
`;

const EXPLORE_TRACK = gql`
  mutation($position: Float!, $channelId: Int!, $albumMnetId: String!, $playedTrackMnetIds: [String]) {
    exploreTrack(position: $position, channelId: $channelId, albumMnetId: $albumMnetId, playedTrackMnetIds: $playedTrackMnetIds) {
      MnetId
      title
      name
      imgsource
      imgsource150
      duration
      albumMnetId
      artistMnetId
      albumTitle
      label
      labelOwnerId
    }
  }
`;

const UPDATE_TRACK_ALBUM_INFO = gql`
  mutation($MnetId: String, $albumMnetId: String, $albumTitle: String, $label: String, $labelOwnerId: Int) {
    updateTrackAlbumInfo(
        MnetId: $MnetId,
        albumMnetId: $albumMnetId,
        albumTitle: $albumTitle,
        label: $label,
        labelOwnerId: $labelOwnerId
    )
  }
`;