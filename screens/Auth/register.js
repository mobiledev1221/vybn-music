import React, { useState } from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
// import Error from "../../components/Error";
import LoadingModal from "../../components/Loading";
import keyimage from "../../assets/passwordicon.png";
import { connect } from 'react-redux';
import * as actions from '../../redux/actions';

import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  AsyncStorage,
  Keyboard,
  Dimensions
} from "react-native";
import {
  AuthText,
  Dash,
  InputComponent,
  ButtonWithoutScroll
} from "../../components/Form";
import background from "../../assets/background5.png";
import side from "../../assets/email.png";
import emailimageicon from "../../assets/emailicon.png";
import ShowToast from "../../components/ShowToast";
import client from "../../graphql/client";
import showError from "../../utils/showError";

function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  const [keyboardshow, setKeyboardshow] = useState(false);

  let keyboardShowListener, keyboardHideListener;
  React.useEffect(() => {
    keyboardShowListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardshow(true)
    );
    keyboardHideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardshow(false)
    );
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleSubmit = async createUser => {
    if (email == "") {
      ShowToast("Email is required");
      return;
    }

    if (password == "" || cpassword == "") {
      if (password == "") {
        ShowToast("Password cannot be empty");
        return;
      }
      if (cpassword == "") {
        ShowToast("Confirm Password cannot be empty");
        return;
      }
    }
    if (password != cpassword) {
      ShowToast("Password do not match");
      return;
    }

    await client.resetStore();
    try {
      const res = await createUser();
      console.log(res);
      props.setAuthStatus("SIGNUP");
      await AsyncStorage.setItem("authtoken1", res.data.createUser2.token);
      await AsyncStorage.setItem("authscreen", "emailconfirm");
      props.navigation.navigate("Confirmemail");
    } catch(e) {
      console.log(e);
      if (e.message) {
        showError(e.message);
      } else {
        showError("Something went wrong.");
      }
    }
  };

  const sHeight = Dimensions.get("window").height;
  const fMarginTop = Math.floor(sHeight * 0.27 - 60);
  let mTopTitle = 55, mTopIcon = 10;
  if (fMarginTop > 75) {
    mTopIcon = (fMarginTop - 65) / 2;
    mTopTitle = mTopIcon + 45;
  }
  let buttonHeight = sHeight - mTopTitle - 120 - mTopIcon - 300;
  buttonHeight = buttonHeight < 60 ? 60 : buttonHeight;

  return (
    <Mutation mutation={REGISTER_MUTATION} variables={{ email, password }}>
      {(createUser, { loading, error }) => {
        if (loading) {
          console.debug("loading");
        }
        if (error) {
          console.log(error);
        }
        return (
          <ImageBackground
            source={background}
            style={{
              flex: 1,
              width: "100%"
            }}
            resizeMode="stretch"
          >
            {loading && <LoadingModal />}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Droidsans",
                  fontSize: 21,
                  fontWeight: "400",
                  lineHeight: 20,
                  marginTop: keyboardshow? 55 : mTopTitle
                }}
              >
                JUST ONE MORE STEP
              </Text>
              <Image
                source={side}
                style={{
                  width: 140,
                  height: 120,
                  marginBottom: keyboardshow ? 10 : 20,
                  marginTop: keyboardshow ? 10 : mTopIcon
                }}
              />
              <AuthText
                text="EMAIL AND PASSWORD"
                style={{
                  marginTop: keyboardshow ? 10 : 30,
                  textAlign: "center"
                }}
                textstyle={{
                  fontFamily: "Droidsans",
                  color: "#FFFFFF",
                  fontSize: 23,
                  fontWeight: "400"
                }}
              />
              <View style={{ marginBottom: 10, marginTop: 15 }}>
                <Dash />
              </View>
              <View style={{ width: 300 }}>
                <InputComponent
                  value={email}
                  onChange={text => setEmail(text)}
                  icon={emailimageicon}
                  icontype="image"
                  placeholder="Enter your email"
                />
                <InputComponent
                  secure
                  value={password}
                  onChange={text => setPassword(text)}
                  icon={keyimage}
                  icontype="image"
                  placeholder="Enter Password"
                />
                <InputComponent
                  secure
                  value={cpassword}
                  onChange={text => setCpassword(text)}
                  icon={keyimage}
                  icontype="image"
                  placeholder="Confirm Your password"
                />
              </View>

              <View
                style={{
                  marginBottom: 22,
                  justifyContent: "flex-end",
                  flexDirection: "column",
                  width: 300,
                  height: keyboardshow ? 60 : buttonHeight
                }}
              >
                <View style={{ marginBottom: 10, marginTop: 10 }}>
                  <Dash />
                </View>
                <View
                  style={{
                    height: 40,
                    width: "100%"
                  }}
                >
                  <ButtonWithoutScroll
                    loading={loading}
                    onPress={() => handleSubmit(createUser)}
                    style={{ marginBottom: 8 }}
                    text="Confirm Email and Password"
                  />
                </View>
              </View>
            </View>
          </ImageBackground>
        );
      }}
    </Mutation>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop: 65,
    width: 170,
    height: 170,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  }
});

const REGISTER_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    createUser2(email: $email, password: $password) {
      token
    }
  }
`;

const mapStateToProps = (state) => {
  return {
      state: state.app
  }
};

export default connect(state => (mapStateToProps), actions)(Register);