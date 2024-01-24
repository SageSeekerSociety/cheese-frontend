import { toast } from "vuetify-sonner";

type MessageType = "success" | "warning" | "info" | "error";
export default function eMessage(
  message: string,
  type: MessageType = "success"
) {
  toast(message, {
    cardProps: {
      color: type,
    },
  });
}

export function messageSucceed(message: string) {
  eMessage(message);
}
export function messageFailed(message: string) {
  eMessage(message, "error");
}

export function messageWaring(message: string) {
  eMessage(message, "warning");
}
