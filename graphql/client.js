import { ApolloClient } from "apollo-client";
import { AsyncStorage } from "react-native";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as Config from '../config';
import { from } from "apollo-link";

const httpLink = createHttpLink({
  uri: Config.SERVER_URL
  //uri: "http://192.168.1.109:3000/graphql"
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem("authtoken1");
  //console.log('authtoken1: ' + token);
  // return the headers to the context so httpLink can read them
  // console.log("oldToken --> ", token);
  return {
    headers: {
      ...headers,
      "x-auth-token": token ? `${token}` : ""
    }
  };
});

const afterLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const { response: { headers } } = operation.getContext();
    if (headers) {
      const token = headers.get("newToken");

      if (token) {
        // console.log("newToken --> ", token)
        AsyncStorage.setItem("authtoken1", token);
      }
    }

    return response;
  });
});

const client = new ApolloClient({
  link: afterLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache()
});

export default client;
