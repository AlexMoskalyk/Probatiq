import { toast } from "sonner";

export const RATE_LIMIT_MESSAGE = "RATE_LIMIT";

export function errorToast(message: string) {
  if (message === RATE_LIMIT_MESSAGE) {
    toast.error("Woah! Slow down.", {
      description: "You are making too many requests. Please try again later.",
    });
    return;
  }

  toast.error(message);
}
