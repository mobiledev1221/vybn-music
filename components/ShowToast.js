import { Toast } from "native-base";

export default function ShowToast(message) {
  Toast.show({
    text: message,
    buttonText: "Okay",
    duration: 3000,
    position: "top"
  });
}
