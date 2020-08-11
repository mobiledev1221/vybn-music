import React, { useState } from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Grid, Row } from "native-base";
import { connect } from 'react-redux';
import * as actions from '../../redux/actions';
import LoadingModal from "../../components/Loading";
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  AsyncStorage,
  Keyboard
} from "react-native";
import {
  AuthText,
  Dash,
  InputComponent,
  SecondaryText,
  ButtonWithoutScroll
} from "../../components/Form";
import background from "../../assets/background5.png";
import email from "../../assets/email.png";
import keyimage from "../../assets/passwordicon.png";
import showError from "../../utils/showError";

function OtpVerification(props) {
  const [otp, setOtp] = useState("");
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
  const handleSubmit = async verifyEmail => {
    if (otp == "") {
      showError("OTP is required");
      return;
    } else {
      try {
        const res = await verifyEmail();
        console.log(res);
        if (props.state.authStatus == "FORGOT") {
          await AsyncStorage.setItem("authscreen", "createpassword");
          props.navigation.navigate("CreatePassword");
        } else {
          await AsyncStorage.setItem("loggedIn", "true");
          if (props.state.authStatus == "LOGIN") {
            props.navigation.navigate("App");
          } else {
            props.navigation.navigate("CreateChannel");
          }
        }
      } catch (error) {
        if (error.message) {
          showError(error.message);
        } else {
          showError("Something went wrong.");
        }
      }
    }
  };
  return (
    <Mutation mutation={VERIFY_OTP} variables={{ otp }}>
      {(verifyEmail, { loading, error }) => {
        if (loading) {
          console.debug("loading");
        }
        if (error) {
          console.log(error);
        }
        return (
          <Grid>
            {loading && <LoadingModal />}
            <Row>
              <ImageBackground
                source={background}
                style={{
                  flex: 1,
                  height: "100%",
                  width: "100%"
                }}
                resizeMode="cover"
              >
                <Row size={keyboardshow ? 40 : 60}>
                  <View style={{ flex: 1, flexDirection: "column" }}>
                    <View
                      style={{
                        flex: 4,
                        alignItems: "center",
                        justifyContent: "space-around"
                      }}
                    >
                      <Text
                        style={{
                          // Style for "JUST A MOR"

                          color: "#ffffff",
                          fontFamily: "Droidsans",
                          fontSize: 21,
                          fontWeight: "700",
                          lineHeight: 20,
                          marginTop: 10
                        }}
                      >
                        JUST ONE MORE STEP
                      </Text>
                      <Image
                        source={email}
                        style={{
                          // Style for "Mail copy"

                          width: 140,
                          height: 120,
                          marginBottom: 20
                        }}
                      />
                    </View>
                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                      <AuthText
                        text="OTP VERIFICATION"
                        style={{ marginTop: 16, marginBottom: 5, textAlign: "center" }}
                      />
                      <View style={{ marginBottom: 20 }}>
                        <Dash />
                      </View>
                    </View>
                  </View>
                </Row>

                <Row size={keyboardshow ? 30 : 50}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <View>
                      <View style={{ width: 300 }}>
                        <InputComponent
                          icon={keyimage}
                          icontype="image"
                          value={otp}
                          onChange={text => setOtp(text)}
                          placeholder="Enter OTP"
                        />
                        <SecondaryText
                          containerStyle={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 16
                          }}
                          text={`Enter the otp sent to your registered mobile number
                    `}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginBottom: 16,

                        justifyContent: "flex-end",
                        flexDirection: "column",
                        width: 300
                      }}
                    >
                      <View style={{ marginBottom: 20 }}>
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
                          onPress={() => handleSubmit(verifyEmail)}
                          style={{ marginBottom: 8 }}
                          text="Confirm Email"
                        />
                      </View>
                    </View>
                  </View>
                </Row>
                {keyboardshow ? <Row size={30} /> : null}
              </ImageBackground>
            </Row>
          </Grid>
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

const VERIFY_OTP = gql`
  mutation($otp: String!) {
    verifyEmail(otp: $otp)
  }
`;

const mapStateToProps = (state) => {
  return {
      state: state.app
  }
};

export default connect(state => (mapStateToProps), actions)(OtpVerification);