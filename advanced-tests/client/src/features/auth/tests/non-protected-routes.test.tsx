import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

// will interpolate when https://github.com/facebook/jest/pull/11388 is realeased
// test.each([{ routeName: "Home", routePath: "/", headingMatch: /welcome/i }])(
//   "$routeName page does not redirect to login screen",
//   ({ routePath, headingMatch }) => {
//     render(<App />, { routeHistory: [routePath] });

//     const homeHeading = screen.getByRole("heading", { name: headingMatch });
//     expect(homeHeading).toBeInTheDocument();
//   }
// );
test.each([
  ["/", /welcome/i],
  ["/bands/1", /joyous/i],
  ["/shows", /upcoming shows/i],
])(
  "Route %p does not redirect to login screen",
  async (routePath, headingMatch) => {
    render(<App />, { routeHistory: [routePath] });

    const heading = await screen.findByRole("heading", {
      name: headingMatch,
    });
    expect(heading).toBeInTheDocument();
  }
);
