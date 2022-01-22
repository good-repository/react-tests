import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import { logErrorToast, logErrorToasts } from "./LogErrorToastSaga";

const errorToastOptions: ToastOptions = {
  title: "It's time to panic!!!",
  status: "error",
};

const infoToastOptions: ToastOptions = {
  title: "Info toast",
  status: "info",
};

const errorToastAction = {
  type: "test",
  payload: errorToastOptions,
};

const infoToastAction = {
  type: "test",
  payload: infoToastOptions,
};

test("saga calls analytics when it receives error toast", () => {
  return expectSaga(logErrorToasts, errorToastAction)
    .call(logErrorToast, "It's time to panic!!!")
    .run();
});

test("saga not calls analytics when it receives info toast", () => {
  return expectSaga(logErrorToasts, infoToastAction)
    .not.call.fn(logErrorToast)
    .run();
});
