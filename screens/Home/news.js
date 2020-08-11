import React from "react";
import { Text, View, ImageBackground, ScrollView, Dimensions, Linking } from "react-native";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
// import ReadMore from 'react-native-read-more-text';
import { NavigationEvents } from "react-navigation";
import HTML from 'react-native-render-html';
import ImageLoad from 'react-native-image-placeholder';

import Background from "../../assets/music/background.png";
import Loading from "../../components/Loading";
import HeadPlay from "../../components/HeadPlay";
import UserInactivityCheck from '../../components/UserInactivityCheck';
import showError from "../../utils/showError";

export class News extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReady: false,
      showhome: false,
      textToShow: "News",
      news: []
    };
  }

  newsList = () => {
    const { feeds } = this.props;

    return (
      <View style={{ flexDirection: "column", marginTop: 20 }}>
        {feeds.map((item, i) => {
          if(!item.image || item.image.startsWith('https://media.npr.org/include')) return;
          console.log('image -----> ', item.image);

          return (
            <View style={{ flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: "#000" }} key={i} >
              <ImageLoad
                style={{ width: 107, height: 74, marginRight: 5, alignSelf: 'center' }}
                loadingStyle={{ size: 'large', color: 'blue' }}
                placeholderSource={require('../../assets/placeholder.png')}
                source={{ uri: item.image }}
              /> 
              
              <View style={{flex: 1}}>
                <Text style={{ color: "#abaed0", marginBottom: 2, fontSize: 12 }}>{item.title[0]}</Text>
                {/* <ReadMore
                    numberOfLines={5}
                    renderTruncatedFooter={this._renderTruncatedFooter}
                    renderRevealedFooter={this._renderRevealedFooter}>
                    <Text style={{ color: "white", fontSize: 10 }} >{item.description[0]}</Text>
                </ReadMore> */}
                <HTML 
                  html={item.description[0]} 
                  imagesMaxWidth={Dimensions.get('window').width} 
                  baseFontStyle={{ color: "white", fontSize: 10 }}
                  onLinkPress = {(evt, href) =>  Linking.openURL(href)}
                  ignoredStyles={['font-family', 'display']}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={{color:'#7473FF', marginTop: 5}} onPress={handlePress}>
        Read more
      </Text>
    );
  }

  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={{color: '#7473FF', marginTop: 5}} onPress={handlePress}>
        Show less
      </Text>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={Background}
          style={{
            flex: 1,
            height: null,
            width: null
          }}
          resizeMode="cover" >
          <View style={{ margin: 15 }}>
            <HeadPlay
              navigation={this.props.navigation}
            />
            <ScrollView>
              <View style={{ marginBottom: 200 }}>
              { this.newsList(this.state) }
              </View>
            </ScrollView>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

export default function NewsScreen(props) {
  const { loading, error, data, refetch, networkStatus } = useQuery(
    GET_FEEDS,
    {
      notifyOnNetworkStatusChange: true
    }
  );

  if (error) {
    console.log('error message: ', error.message);
    showError("Error in getting news");
  }

  return (
    <UserInactivityCheck navigation={props.navigation}>
      <View style={{ flex: 1 }}>
        {(loading || networkStatus === 4) && <Loading />}
        <NavigationEvents
          onWillFocus={() => {
            refetch();
          }}
        />
        <News feeds={data && data.feeds ? data.feeds : []} navigation={props.navigation} />
      </View>
    </UserInactivityCheck>
  );
}

const GET_FEEDS = gql`
  query {
    feeds {
      type,
      image,
      title, 
      description,
      pubDate
    }
  }
`;