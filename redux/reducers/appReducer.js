import types from '../types';

const initState = {
    selectedChannel: null,
    selectedChannelIndex: 0,
    playQueue: null,
    selectedTrack: null,
    selectedTrackIndex: 0,
    soundObject: null,
    myChannels: null,
    playstate: false,
    isMuted: false,
    profile: null,
    comments: [],
    myComments: [],
    conversations: [],
    socket: null,
    genres: [],
    selectedGenre: "",
    playAd: false,
    totalPlayTime: 0,
    adPlayCount: 0,
    adAppId: '',
    timeTrackerWidth: 0,
    updateTrackerWidth: false,
    skipCancelTimes: [],
    inactiveLongTime: false,
    isWaiting: false,
    activePlayRoute: "",
    // DMCA rule parameters
    dmcaParams: {
        playedTrackInfos3: [], // information of played tracks during last 3 hours
    },
    initializingPlay: false,
    queued: false,
    backTimer: null,
    axiosToken: null,
    axiosGetting: false,
    refreshingPlay: false,
    authStatus: ""
};

export const reducer = (state = initState, action) => {
    const { type, payload } = action;

    switch ( type ) {
        case types.SAVE_SELECTEDCHANNEL: {
            return {
                ...state,
                selectedChannel: payload
            }
        }
        case types.SAVE_PLAYSTATE: {
            return {
                ...state,
                playstate: payload,
                isMuted: false
            }
        }
        case types.SAVE_ISMUTED: {
            return {
                ...state,
                isMuted: payload
            }
        }
        case types.SAVE_PLAYQUEUE: {
            return {
                ...state,
                playQueue: payload
            }
        }
        case types.SAVE_SELECTEDTRACK: {
            if (state.selectedTrack == payload) {
                return {
                    ...state,
                    selectedTrack: payload
                };
            }
            return {
                ...state,
                selectedTrack: payload,
                timeTrackerWidth: 0,
                updateTrackerWidth: false
            }
        }
        case types.SAVE_SELECTEDTRACKINDEX: {
            return {
                ...state,
                selectedTrackIndex: payload,
            }
        }
        case types.SAVE_SOUNDOBJECT: {
            return {
                ...state,
                soundObject: payload,
            }
        }
        case types.ADD_CHANNEL: {
            const {myChannels: beforeAdd} = state;
            const myChannels = [...beforeAdd, payload];
            return {
                ...state,
                myChannels,
            }
        }
        case types.SAVE_MYCHANNELS: {
            return {
                ...state,
                myChannels: payload,
            }
        }
        case types.SAVE_SELECTEDCHANNELINDEX: {
            return {
                ...state,
                selectedChannelIndex: payload,
            }
        }
        case types.INITIALIZE_STATIONS: {
            if (state.soundObject) {
                state.soundObject.unloadAsync();
            }
            return {
                ...state,
                soundObject: null,
                playstate: false,
                isMuted: false,
                selectedTrackIndex: 0,
                selectedTrack: null,
                selectedChannelIndex: 0,
                selectedChannel: null,
                playQueue: null,
                myChannels: null,
                timeTrackerWidth: 0,
                updateTrackerWidth: false,
                totalPlayTime: 0,
                adPlayCount: 0,
                playAd: false,
                dmcaParams: {
                    playedTrackInfos3: []
                }
            }
        }
        case types.SAVE_PROFILE: {
            return {
                ...state,
                profile: payload,
            }
        }
        case types.SET_COMMENTS: {
            return {
                ...state,
                comments: payload
            }
        }
        case types.ADD_COMMENT: {
            const { comments } = state;
            return {
                ...state,
                comments: [...comments, payload]
            }
        }
        case types.SET_COMMENT: {
            let comments = state.comments;
            comments[payload.index] = payload.value;
            return {
                ...state,
                comments: comments
            }
        }
        case types.SET_MY_COMMENTS: {
            return {
                ...state,
                myComments: payload
            }
        }
        case types.SET_CONVERSATIONS: {
            // console.log('set conversations --------------------->');
            return {
                ...state,
                conversations: payload
            }
        }
        case types.ADD_MESSAGE: {
            const commentId = payload.commentId;
            let conversations = state.conversations;
            let conversation = conversations.filter(item => item.commentId == commentId);
            let indexArray = conversations.map(item => item.commentId);
            let index = indexArray.indexOf(commentId);

            conversation[0].conversation.push(payload);
            conversations[index] = conversation[0];

            // console.log('---------------------------', conversations);
            return {
                ...state,
                conversations: conversations
            }
        }
        case types.SET_SOCKET: {
            return {
                ...state,
                socket: payload
            }
        }
        case types.SAVE_GENRES: {
            return {
                ...state,
                genres: payload
            };
        }
        case types.SAVE_SELECTEDGENRE: {
            return {
                ...state,
                selectedGenre: payload
            };
        }
        case types.SET_AD_PLAY_COUNT: {
            return {
                ...state,
                adPlayCount: payload
            };
        }
        case types.SET_TOTAL_PLAY_TIME: {
            return {
                ...state,
                totalPlayTime: payload
            };
        }
        case types.SET_PLAY_AD: {
            return {
                ...state,
                playAd: payload
            }
        }
        case types.SET_AD_APP_ID: {
            return {
                ...state,
                adAppId: payload
            };
        }
        case types.SAVE_TIMETRACKERWIDTH: {
            return {
                ...state,
                timeTrackerWidth: payload
            };
        }
        case types.SAVE_UPDATETRACKERWIDTH: {
            return {
                ...state,
                updateTrackerWidth: payload
            };
        }
        case types.SAVE_SKIPCANCELTIMES: {
            return {
                ...state,
                skipCancelTimes: payload
            };
        }
        case types.SAVE_INACTIVELONGTIME: {
            return {
                ...state,
                inactiveLongTime: payload
            };
        }
        case types.SAVE_ISWAITING: {
            return {
                ...state,
                isWaiting: payload
            };
        }
        case types.SET_ACTIVE_PLAY_ROUTE: {
            return {
                ...state,
                activePlayRoute: payload
            };
        }
        case types.SET_DMCA_PARAMS: {
            return {
                ...state,
                dmcaParams: payload
            };
        }
        case types.SET_INITIALIZING_PLAY: {
            return {
                ...state,
                initializingPlay: payload
            };
        }
        case types.SET_QUEUED: {
            return {
                ...state,
                queued: payload
            };
        }
        case types.SET_BACK_TIMER: {
            return {
                ...state,
                backTimer: payload
            };
        }
        case types.SET_AXIOS_TOKEN: {
            return {
                ...state,
                axiosToken: payload
            };
        }
        case types.SET_AXIOS_GETTING: {
            return {
                ...state,
                axiosGetting: payload
            };
        }
        case types.SET_REFRESHING_PLAY: {
            return {
                ...state,
                refreshingPlay: payload
            };
        }
        case types.SET_AUTH_STATUS: {
            return {
                ...state,
                authStatus: payload
            };
        }
        default: {
            return state;
        }
    }
}
