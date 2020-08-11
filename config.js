// export const 
//    HTTP_URL = "http://42b41da9.ngrok.io/",
//    SOCKET_URL = "http://0a8ffbd4.ngrok.io",
export const HTTP_URL = "http://34.219.148.207:3000/",
    SOCKET_URL = 'http://34.219.148.207:3001',
// export const HTTP_URL = "http://10.0.2.2:3000/",
//     SOCKET_URL = "http://10.0.2.2:3001",
    SERVER_URL = HTTP_URL + "graphql/",
    STATIC_URL = HTTP_URL + "images",
    UPLOAD_URL = HTTP_URL + "uploadfile",
    PERSPECTIVE_API_URL = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyA-7I258ft0u18VGhilxunOTir_PEepoho",
    //PAYPAL_CLIENT_ID = 'AWhegKmME_334aU5C4H6C8BjKY-VnaoY_cIINWq-1D7TRZj1Tfm4g9S1pE38DG4rtae9dkQR1miiM00N';
    STRIPE_API_KEY = "pk_test_VodJCIivcu1Nnd3chKjnBgKJ00ldvSIQyg",
    //STRIPE_API_KEY = 'pk_test_0WXs0SQRWkyrk18oAQ7YFXbZ00P9EluclG';
    //PAYPAL_CLIENT_ID = "AZh9bRXw8EYIEiELcPmf9XoYI5PwEWGkTeW4l8F_KYZN7Uxj0kqk3p1UUbubUqM3WtsonIWNhGrvgHMf";
    PAYPAL_CLIENT_TEST_ID = "Acha0twjkCU1O4zc5tI-sg0QxvcyUMAsVGC0PTtkSfe7IbVOBcHTYK16VSgx_JEdOD_A1hD7ntL57iw_";

//export const MNDIGITAL_BASE = 'http://ie-api.mndigital.com/?',  //IE
export const MNDIGITAL_BASE = 'http://api.mndigital.com/?',      //PROD
    //API_KEY = 'Xwbxm2C7oNvfOtQH5A3pItIVQ',    //IE
    API_KEY = 'aGTrhbeubSEus5FXORMhhJgtW',    //PROD
    //SHARED_SECRET = 'H20ymFG8pem',            //IE
    SHARED_SECRET = 'Lbt6wH5elj0',            //PROD
    GET_TRACK = MNDIGITAL_BASE + "method=track.get&rights=purchase&format=json&includeExplicit=false&apiKey="+API_KEY,
    SEARCH_GETTRACKS = MNDIGITAL_BASE + "method=search.gettracks&rights=purchase&format=json&includeExplicit=false&apiKey="+API_KEY,
    SEARCH_GETALBUMS = MNDIGITAL_BASE + "method=search.getalbums&rights=purchase&format=json&includeExplicit=false&page=1&pageSize=20&apiKey="+API_KEY+"&title=",
    SEARCH_GETARTISTS = MNDIGITAL_BASE + "method=search.getartists&rights=purchase&format=json&includeExplicit=false&page=1&pageSize=20&apiKey="+API_KEY+"&name=",
    RADIO_GETMEDIALOCATION = "method=Radio.GetMediaLocation&format=json&assetCode=014&protocol=http&userIP=45.58.62.161&apiKey="+API_KEY+"&trackID=",
    RADIO_SEARCHTRACKS = MNDIGITAL_BASE + "method=Radio.SearchTracks&format=json&includeExplicit=false&apiKey="+API_KEY;

// constants related to Advertising
export const AD_REQUEST_ENTRY_POINT = 'http://cmod826.live.streamtheworld.com/ondemand/ars?version=1.7.1&banners=none&bundle-id=com.vybn.vybn&type=midroll&fmt=vast&stid=415793&at=audio&cntnr=mp3,adts&acodec=mp3,aac_lc&maxdur=15',
    GOOGLE_STORE_ID = 'com.vybn.vybn',
    APPLE_STORE_ID = 'app_store_id',
    GOOGLE_STORE_URL = 'https://play.google.com/store/apps/details?id=com.vybn.vybn',
    APPLE_STORE_URL = 'app_store_url',
    AD_INTERVAL = 900; // in seconds, twice in 15 minutes;

export const AXIOS_TIMEOUT = 5000;
