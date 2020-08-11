import React from 'react';
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { View } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from 'react-redux';
import * as actions from '../../redux/actions';

import CommentScreen from './comment';
import UserInactivityCheck from '../../components/UserInactivityCheck';
import showError from '../../utils/showError';

function CommentList(props) {
  const { loading, error, data, refetch, networkStatus } = useQuery(
      GET_CONVERSATIONS,
      {
        notifyOnNetworkStatusChange: true
      }
  );

  // React.useEffect(() => {
  //   const unsubscribe = props.navigation.addListener('willFocus', () => {
  //     console.log('comment list')
  //   });

  //   return unsubscribe.remove;
  // }, [props.navigation]);

  if (error) {
    console.log('error message: ', error.message);
    showError("Error in getting conversations");
  }

  if (data) {
    props.setConversations(data.conversations);
  }

  return (
    <UserInactivityCheck navigation={props.navigation}>
      <View style={{ flex: 1 }}>
        <NavigationEvents
          onWillFocus={() => {
              refetch();
          }}
        />
        <CommentScreen
          navigation={props.navigation}
          loading={loading || networkStatus === 4}
        />
      </View>
    </UserInactivityCheck>
  );
}

export default connect(state => ({}), actions)(CommentList);

const GET_CONVERSATIONS = gql`
  query {
    conversations {
      comment,
      commentId,
      mine,
      trackName,
      profilePic,
      conversation {
        content 
        sender, 
        commentId,
        originalComment,
        originalUserId,
        userId,
        email,
        profilePic
      }
    }
  }
`;