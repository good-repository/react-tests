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
) => res(ctx.status(401));

test("unsuccessful signin followed by successful signin", async () => {
  const errorHandler = rest.post(
    `${baseUrl}/${endpoints.signIn}`,
    signInFailure
  );

  server.resetHandlers(errorHandler);

  const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

  const emailField = screen.getByLabelText(/email/i);
  userEvent.type(emailField, "email@test.com");

  const passwordField = screen.getByLabelText(/email/i);
  userEvent.type(passwordField, "blablabla");

  const signInForm = screen.getByTestId("sign-in-form");
  const signInButton = getByRole(signInForm, "button", { name: /sign in/i });
  userEvent.click(signInButton);

  server.resetHandlers();
  userEvent.click(signInButton);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/tickets/1");
  });

  expect(history.entries).toHaveLength(1);
});
