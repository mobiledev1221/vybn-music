import { Toast } from "native-base";

export default function(props) {
  let message = props.message.replace("GraphQL Error:", "").trim();
  message = message.replace("GraphQL error:", "").trim();
  // if (error) {
    Toast.show({
      text: message,
      buttonText: "Okay",
      duration: 3000,
      position: "top"
    });
    // showerror(false);
  // }

  return null;
}
