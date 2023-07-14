import { BackendError, HttpCode, HttpError, parseJscheduleResponse } from "../../../source/logic/apiUtils";
import { emptyPromiseWithValue } from "../../../source/logic/utils";
import { JsonResponseType } from "../../../source/logic/server/models";

describe("API utils", () => {
  it("parses API content when all is OK", async () => {
    const data = {
      type: JsonResponseType.SUCCESS,
      content: [1, 2, 3],
    };
    const response = {
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json;"]]),
      json: () => emptyPromiseWithValue(data),
    };

    const result = await parseJscheduleResponse(response);

    expect(result).toBe(data.content);
  });

  it("throws an error when JSON responds is of error type", async () => {
    const data = {
      type: JsonResponseType.ERROR,
      content: "error123",
    };
    const response = {
      ok: false,
      status: HttpCode.Im_a_teapot,
      headers: new Map([["content-type", "application/json;"]]),
      json: () => emptyPromiseWithValue(data),
    };

    try {
      await parseJscheduleResponse(response);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("Request failed. error123 (418 Im_a_teapot)");
      expect(e.constructor.name).toBe(BackendError.name)
    }
  });

  it("throws an error when JSON responds is of error type but server status is OK", async () => {
    const data = {
      type: JsonResponseType.ERROR,
      content: "error123",
    };
    const response = {
      ok: true,
      status: HttpCode.Ok,
      headers: new Map([["content-type", "application/json;"]]),
      json: () => emptyPromiseWithValue(data),
    };

    try {
      await parseJscheduleResponse(response);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("Request failed. error123 (200 Ok)");
      expect(e.constructor.name).toBe(BackendError.name)
    }
  });

  it("throws an error when JSON responds is of success type but server status is not OK", async () => {
    const data = {
      type: JsonResponseType.SUCCESS,
      content: [1, 2, 3],
    };
    const response = {
      ok: false,
      status: HttpCode.Im_a_teapot,
      headers: new Map([["content-type", "application/json;"]]),
      json: () => emptyPromiseWithValue(data),
    };

    try {
      await parseJscheduleResponse(response);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("Request failed. [1,2,3] (418 Im_a_teapot)");
      expect(e.constructor.name).toBe(HttpError.name)
    }
  });

  it("throws an error when server status is not OK", async () => {
    const response = {
      ok: false,
      status: HttpCode.Im_a_teapot,
      headers: new Map([]),
      text: () => emptyPromiseWithValue("error123"),
    };

    try {
      await parseJscheduleResponse(response);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("Request failed. error123 (418 Im_a_teapot)");
      expect(e.constructor.name).toBe(HttpError.name)
    }
  });

  it("throws an error when server status is not OK and cannot get content", async () => {
    const response = {
      ok: false,
      status: HttpCode.Im_a_teapot,
      headers: new Map([]),
      text: () => Promise.reject(new Error("error123")),
    };

    try {
      await parseJscheduleResponse(response);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe("Request failed. (418 Im_a_teapot)");
      expect(e.constructor.name).toBe(HttpError.name)
    }
  });
});
