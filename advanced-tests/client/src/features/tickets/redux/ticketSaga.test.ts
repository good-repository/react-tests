import axios from "axios";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import {
  holdReservation,
  purchasePayload,
  purchaseReservation,
} from "../../../test-utils/fake-data";
import { showToast } from "../../toast/redux/toastSlice";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  cancelTransaction,
  generateErrorToastOptions,
  purchaseTickets,
  ticketFlow,
} from "./ticketSaga";
import {
  endTransaction,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";

const holdAction = {
  type: "test",
  payload: holdReservation,
};

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

test("cancelTransation cancels hold and reset transaction", () => {
  return expectSaga(cancelTransaction, holdReservation)
    .call(releaseServerCall, holdReservation)
    .provide(networkProviders)
    .put(resetTransaction())
    .run();
});

describe("commom to all flows", () => {
  test("starts with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: "Abort! Abort!",
        })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });
  test("show error toast and clean up after server error", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.fn(reserveTicketServerCall),
          throwError(new Error("it did not work")),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .put(
        showToast(
          generateErrorToastOptions("it did not work", TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });
});

describe("purchase flow", () => {
  test("network error on purchase shows toast and cancels transation", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.like({
            fn: reserveTicketServerCall,
            args: [purchaseReservation],
          }),
          throwError(new Error("it did not work")),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .dispatch(startTicketPurchase(purchasePayload))
      .call.fn(cancelPurchaseServerCall)
      .put(
        showToast(
          generateErrorToastOptions("it did not work", TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });

  test("abort purchase while call to server is running", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide([
        ...networkProviders,
        {
          race: () => ({ abort: true }),
        },
      ])
      .call(cancelSource.cancel)
      .call(cancelPurchaseServerCall, purchaseReservation)
      .put(showToast({ title: "purchase canceled", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .not.put(showToast({ title: "tickets purchased", status: "success" }))
      .run();
  });

  test("successful purchase flow", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide(networkProviders)
      .call(reserveTicketServerCall, purchaseReservation, cancelSource.token)
      .put(showToast({ title: "tickets purchased", status: "success" }))
      .call(releaseServerCall, holdReservation)
      .put(endTransaction())
      .not.call.fn(cancelSource.cancel)
      .not.call.fn(cancelPurchaseServerCall)
      .not.put(showToast({ title: "purchase canceled", status: "warning" }))
      .run();
  });
});

describe("hold cancellations", () => {
  // will interpolate when https://github.com/facebook/jest/pull/11388 is realeased
  // test.each([
  //   { name: "cancel", actionCreator: startTicketRelease },
  //   { name: "abort", actionCreator: startTicketAbort },
  // ])(
  //   "cancel hold and reset ticket transaction on $name",
  //   ({ actionCreator }) => {
  test.each([[startTicketRelease], [startTicketAbort]])(
    `cancel hold and reset ticket transaction on %s`,
    (actionCreator) => {
      return expectSaga(ticketFlow, holdAction)
        .provide(networkProviders)
        .call.fn(reserveTicketServerCall)
        .dispatch(
          actionCreator({ reservation: holdReservation, reason: "test" })
        )
        .put(showToast({ title: "test", status: "warning" }))
        .call(cancelTransaction, holdReservation)
        .run();
    }
  );
});
