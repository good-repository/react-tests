import { createMockTask } from "@redux-saga/testing-utils";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

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

const signUpRequestPayload: SignInDetails = {
  email: "some@email.com",
  password: "123456",
  action: "signUp",
};

const authServerResponse: LoggedInUser = {
  email: "some@email.com",
  token: "12345",
  id: 123,
};

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

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
  test("sucessfull sign-up", () => {
    return expectSaga(signInFlow)
      .provide(networkProviders)
      .dispatch(signInRequest(signUpRequestPayload))
      .fork(authenticateUser, signUpRequestPayload)
      .put(startSignIn())
      .call(authServerCall, signUpRequestPayload)
      .put(signIn(authServerResponse))
      .put(
        showToast({
          title: "Signed in as some@email.com",
          status: "info",
        })
      )
      .put(endSignIn())
      .silentRun();
  });
  test("canceled sign-in", () => {
    return expectSaga(signInFlow)
      .provide({
        call: async (effect, next) => {
          if (effect.fn === authServerCall) {
            await sleep(500);
          }
          next();
        },
      })
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .dispatch(cancelSignIn())
      .put(showToast({ title: "Sign in canceled", status: "warning" }))
      .put(signOut())
      .put(endSignIn())
      .silentRun(25);
  });
  test("sign-in error", () => {
    return expectSaga(signInFlow)
      .provide([
        [
          matchers.call.fn(authServerCall),
          throwError(new Error("something gone wrong")),
        ],
      ])
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .put(startSignIn())
      .put(
        showToast({
          title: "Sign in failed: something gone wrong",
          status: "warning",
        })
      )
      .put(endSignIn())
      .silentRun(25);
  });
});

describe("unit tests for fork cancellation", () => {
  test("saga cancel flow", () => {
    const task = createMockTask();
    const saga = testSaga(signInFlow);
    saga.next().take(signInRequest.type);
    saga
      .next({ type: "test", payload: signInRequestPayload })
      .fork(authenticateUser, signInRequestPayload);
    saga.next(task).take([cancelSignIn.type, endSignIn.type]);
    saga.next(cancelSignIn()).cancel(task);
  });
});
