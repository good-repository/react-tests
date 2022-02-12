import userEvent from "@testing-library/user-event";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

import { App } from "../../../App";
import { baseUrl, endpoints } from "../../../app/axios/constants";
import { handlers } from "../../../mocks/handlers";
import { server } from "../../../mocks/server";
import { getByRole, render, screen, waitFor } from "../../../test-utils";

test.each([
  ["/profile"],
  ["/tickets/0"],
  ["/confirm/0?holdId=123&seatCount=2"],
])(
  "Route %p does redirect to sign in screen when not authenticated",
  (routePath) => {
    render(<App />, { routeHistory: [routePath] });

    const heading = screen.getByRole("heading", { name: /sign in/i });
    expect(heading).toBeInTheDocument();
  }
);

test.each([["Sign in"], ["Sign up"]])(
  "successful %p flow",
  async (buttonName) => {
    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

    const emailField = screen.getByLabelText(/email/i);
    userEvent.type(emailField, "email@test.com");

    const passwordField = screen.getByLabelText(/email/i);
    userEvent.type(passwordField, "blablabla");

    const signInForm = screen.getByTestId("sign-in-form");
    const signInButton = getByRole(signInForm, "button", {
      name: buttonName,
    });
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
    });

    expect(history.entries).toHaveLength(1);
  }
);

const signInFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(401));
};
const serverError = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(500));
};
const signUpFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(400), ctx.json({ message: "Email is already in use" }));
};

test.each([
  {
    endpoint: endpoints.signIn,
    outcome: "failure",
    responseResolver: signInFailure,
    buttonNameRegex: /sign in/i,
  },
  {
    endpoint: endpoints.signIn,
    outcome: "server error",
    responseResolver: serverError,
    buttonNameRegex: /sign in/i,
  },
  {
    endpoint: endpoints.signUp,
    outcome: "failure",
    responseResolver: signUpFailure,
    buttonNameRegex: /sign up/i,
  },
  {
    endpoint: endpoints.signUp,
    outcome: "error",
    responseResolver: serverError,
    buttonNameRegex: /sign up/i,
  },
])(
  "$endpoint $outcome followed by success",
  async ({ endpoint, responseResolver, buttonNameRegex }) => {
    // reset the handler to respond unsuccessfully
    const errorHandler = rest.post(`${baseUrl}/${endpoint}`, responseResolver);
    server.resetHandlers(errorHandler);

    const { history } = render(<App />, { routeHistory: ["/tickets/0"] });

    // Sign in/up (after redirect)
    const emailField = screen.getByLabelText(/email address/i);
    userEvent.type(emailField, "test@test.com");

    const passwordField = screen.getByLabelText(/password/i);
    userEvent.type(passwordField, "test");

    const actionForm = screen.getByTestId("sign-in-form");
    const actionButton = getByRole(actionForm, "button", {
      name: buttonNameRegex,
    });
    userEvent.click(actionButton);

    // reset handlers to default to simulate a correct sign in/up
    server.resetHandlers();

    // no need to re-enter info, just click button
    userEvent.click(actionButton);

    await waitFor(() => {
      // Test for redirect back to initial protected page
      expect(history.location.pathname).toBe("/tickets/0");

      // with sign-in page removed from history
      expect(history.entries).toHaveLength(1);
    });
  }
);
