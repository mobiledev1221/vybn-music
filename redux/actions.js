import types from './types';
import _ from 'lodash';

export const saveSelectedChannel = params => {
    return {
        type: types.SAVE_SELECTEDCHANNEL,
        payload: params
    }
};

export const savePlayState = params => {
    return {
        type: types.SAVE_PLAYSTATE,
        payload: params
    }
};

export const saveIsMuted = params => {
    return {
        type: types.SAVE_ISMUTED,
        payload: params
    }
};

export const savePlayQueue = params => {
    return {
        type: types.SAVE_PLAYQUEUE,
        payload: params
    }
}

export const saveSelectedTrack = params => {
    return {
        type: types.SAVE_SELECTEDTRACK,
        payload: params
    }
};

export const saveSelectedTrackIndex = params => {
    return {
        type: types.SAVE_SELECTEDTRACKINDEX,
        payload: params
    }
};

export const saveSoundObject = params => {
    return {
        type: types.SAVE_SOUNDOBJECT,
        payload: params
    }
};

export const saveMyChannels = params => {
    return {
        type: types.SAVE_MYCHANNELS,
        payload: params
    }
};

export const addChannel = params => {
    return {
        type: types.ADD_CHANNEL,
        payload: params
    }
};

export const saveSelectedChannelIndex = params => {
    return {
        type: types.SAVE_SELECTEDCHANNELINDEX,
        payload: params
    }
};

export const initializeStations = () => {
    return {
        type: types.INITIALIZE_STATIONS
    }
};

export const saveProfile = params => {
    return {
        type: types.SAVE_PROFILE,
        payload: params
    }
};

export const setComments = params => {
    return {
        type: types.SET_COMMENTS,
        payload: params
    }
};

export const setComment = params => {
    return {
        type: types.SET_COMMENT,
        payload: params
    }
};

export const addComment = params => {
    return {
        type: types.ADD_COMMENT,
        payload: params
    }
};

export const setMyComments = params => {
    return {
        type: types.SET_MY_COMMENTS,
        payload: params
    }
};

export const setConversations = params => {
    return {
        type: types.SET_CONVERSATIONS,
        payload: params
    }
};

export const addMessage = params => {
    return {
        type: types.ADD_MESSAGE,
        payload: params
    }
};

export const setSocket = params => {
    return {
        type: types.SET_SOCKET,
        payload: params
    }
};

export const saveGenres = params => {
    return {
        type: types.SAVE_GENRES,
        payload: params
    };
};

export const saveSelectedGenre = params => {
    return {
        type: types.SAVE_SELECTEDGENRE,
        payload: params
    }
}

export const setAdPlayCount = params => {
    return {
        type: types.SET_AD_PLAY_COUNT,
        payload: params
    };
};

export const setTotalPlayTime = params => {
    return {
        type: types.SET_TOTAL_PLAY_TIME,
        payload: params
    };
};

export const setPlayAd = params => {
    return {
        type: types.SET_PLAY_AD,
        payload: params
    };
};

export const setAdAppId = params => {
    return {
        type: types.SET_AD_APP_ID,
        payload: params
    };
};

export const saveTimeTrackerWidth = params => {
    return {
        type: types.SAVE_TIMETRACKERWIDTH,
        payload: params
    };
}

export const saveUpdateTrackerWidth = params => {
    return {
        type: types.SAVE_UPDATETRACKERWIDTH,
        payload: params
    };
}

export const saveSkipCancelTimes = params => {
    return {
        type: types.SAVE_SKIPCANCELTIMES,
        payload: params
    };
}

export const saveInactiveLongTime = params => {
    return {
        type: types.SAVE_INACTIVELONGTIME,
        payload: params
    };
};

export const saveIsWaiting = params => {
    return {
        type: types.SAVE_ISWAITING,
        payload: params
    };
};

export const setActivePlayRoute = params => {
    return {
        type: types.SET_ACTIVE_PLAY_ROUTE,
        payload: params
    };
};

export const setDMCAParams = params => {
    return {
        type: types.SET_DMCA_PARAMS,
        payload: params
    };
};

export const setInitializingPlay = params => {
    return {
        type: types.SET_INITIALIZING_PLAY,
        payload: params
    };
};

export const setQueued = params => {
    return {
        type: types.SET_QUEUED,
        payload: params
    };
};

export const setBackTimer = params => {
    return {
        type: types.SET_BACK_TIMER,
        payload: params
    };
};

export const setAxiosToken = params => {
    return {
        type: types.SET_AXIOS_TOKEN,
        payload: params
    };
};

export const setAxiosGetting = params => {
    return {
        type: types.SET_AXIOS_GETTING,
        payload: params
    };
};

export const setRefreshingPlay = params => {
    return {
        type: types.SET_REFRESHING_PLAY,
        payload: params
    };
};

export const setAuthStatus = params => {
    return {
        type: types.SET_AUTH_STATUS,
        payload: params
    };
};