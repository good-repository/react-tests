import { rest } from "msw";

import { bandUrl } from "../features/band/redux/bandApi";
import { showsUrl } from "../features/tickets/redux/showApi";
import { bands, shows } from "../test-utils/fake-data";

export const handlers = [
  rest.get(showsUrl, (req, res, ctx) => {
    return res(ctx.json({ shows }));
  }),
  rest.get(`${bandUrl}/:bandId`, (req, res, ctx) => {
    const { bandId } = req.params;
    // bandIn is convenient the index in the bands array
    return res(ctx.json({ band: bands[bandId] }));
  }),
];
