// adapted from https://redux-saga.js.org/docs/advanced/NonBlockingCalls/
import { SagaIterator } from "redux-saga";
import { call, cancel, cancelled, fork, put, take } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider } from "redux-saga-test-plan/providers";

import { showToast } from "../../toast/redux/toastSlice";
import { authServerCall } from "../api";
import { LoggedInUser, SignInDetails } from "../types";
import {
  cancelSignIn,
  endSignIn,
  signIn,
  signInRequest,
  signOut,
  startSignIn,
} from "./authSlice";
import { authenticateUser, signInFlow } from "./signInSaga";

const signInRequestPayload: SignInDetails = {
  email: "some@email.com",
  password: "123456",
  action: "signIn",
};

const authServerResponse: LoggedInUser = {
  email: "some@email.com",
  token: "12345",
  id: 123,
};

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(authServerCall), authServerResponse],
];

describe("signInFlow saga", () => {
  test("successful sign-in", () => {
    return (
      expectSaga(signInFlow)
        .provide(networkProviders)
        .dispatch(signInRequest(signInRequestPayload))
        .fork(authenticateUser, signInRequestPayload)
        .put(startSignIn())
        .call(authServerCall, signInRequestPayload)
        .put(signIn(authServerResponse))
        // .put.actionType(signIn.type) this way still passes but is not the better
        .put(
          showToast({
            title: "Signed in as some@email.com",
            status: "info",
          })
        )
        // .put.actionType(showToast.type) this way still passes but is not the better
        .put(endSignIn())
        .silentRun(25)
    );
  });
  test.todo("sucessfull sign-up");
  test.todo("canceled sign-in");
  test.todo("sign-in error");
});
