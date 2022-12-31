import Settings from "../../../source/settings";
import { AccessRequestResponse, ServerAuth } from "../../../source/logic/server/auth";
import { authApi } from "../../../source/logic/server/authApi";
import { emptyPromise, emptyPromiseWithValue } from "../../../source/logic/utils";
import { AccessRequestStatus, JsonResponseType } from "../../../source/logic/server/models";
import Mock = jest.Mock;

jest.mock("hymnbook2/source/logic/server/authApi", () => {
  return {
    authApi: {
      auth: {
        requestAccess: jest.fn(),
        retrieveAccess: jest.fn()
      }
    }
  };
});

describe("test authentication", () => {

  beforeEach(() => {
    (authApi.auth.requestAccess as Mock).mockClear();
    (authApi.auth.retrieveAccess as Mock).mockClear();
  });

  it("when authJwt is empty", () => {
    Settings.authJwt = "";
    expect(ServerAuth.isAuthenticated()).toBe(false);
  });
  it("when authJwt is undefined", () => {
    // @ts-ignore
    Settings.authJwt = undefined;
    expect(ServerAuth.isAuthenticated()).toBe(false);
  });
  it("when authJwt is specified", () => {
    Settings.authJwt = "123";
    expect(ServerAuth.isAuthenticated()).toBe(true);
  });

  it("get JWT from settings if specified", () => {
    Settings.authJwt = "123";
    expect(ServerAuth.getJwt()).toBe("123");
  });

  it("get JWT from settings if specified", () => {
    Settings.authJwt = "123";
    expect(ServerAuth.getJwt()).toBe("123");
  });

  it("successful request access fetches request ID", async () => {
    // Given
    Settings.authClientName = "authClientName";
    Settings.authJwt = ":/";

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.REQUESTED,
            "requestId",
            null,
            null)
        })
      } as Response)
    );

    // When
    const result = await ServerAuth._requestAccess();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.REQUESTED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("Denied access request returns empty", async () => {
    // Given
    Settings.authClientName = "authClientName";

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.DENIED,
            "requestId",
            "You're fat",
            null)
        })
      } as Response)
    );

    // When
    const result = await ServerAuth._requestAccess();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.DENIED);
    expect(Settings.authRequestId).toBe("");
    expect(Settings.authDeniedReason).toBe("You're fat");
  });

  it("request accepted access token JWT", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.REQUESTED;
    Settings.authJwt = "";

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            Settings.authRequestId,
            "",
            "jwt")
        })
      } as Response)
    );

    // When
    const result = await ServerAuth._retrieveAccessJWT();

    expect(result).toBe("jwt");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("request ID is empty while trying to fetch JWT", async () => {
    // Given
    Settings.authRequestId = "";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.REQUESTED;
    Settings.authJwt = "";

    // When
    const result = await ServerAuth._retrieveAccessJWT();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.REQUESTED);
    expect(Settings.authRequestId).toBe("");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server request access token when it's first time authenticating", async () => {
    // Given
    Settings.authRequestId = "";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.UNKNOWN;
    Settings.authJwt = "";

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.REQUESTED,
            "requestId",
            null,
            null)
        })
      } as Response)
    );


    // When
    const result = await ServerAuth.authenticate();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.REQUESTED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server request access token status when it's second time authenticating", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.REQUESTED;
    Settings.authJwt = "";

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.REQUESTED,
            Settings.authRequestId,
            "",
            null)
        })
      } as Response)
    );

    // When
    const result = await ServerAuth.authenticate();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.REQUESTED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server request access token status and JWT when it's second time authenticating", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.REQUESTED;
    Settings.authJwt = "";

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            Settings.authRequestId,
            "",
            "jwt")
        })
      } as Response)
    );

    // When
    const result = await ServerAuth.authenticate();

    expect(result).toBe("jwt");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server doesn't request access request status when JWT already obtained", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.APPROVED;
    Settings.authJwt = "jwt";

    // When
    const result = await ServerAuth.authenticate();

    expect(result).toBe("jwt");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server performs whole access request cycle", async () => {
    // Given
    Settings.authRequestId = "";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.UNKNOWN;
    Settings.authJwt = "";

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.REQUESTED,
            "requestId",
            null,
            null)
        })
      } as Response)
    );

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            Settings.authRequestId,
            "",
            "jwt")
        })
      } as Response)
    );

    // When
    let result = await ServerAuth.authenticate();

    expect(result).toBe("");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(Settings.authJwt).toBe("");
    expect(Settings.authStatus).toBe(AccessRequestStatus.REQUESTED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");

    // When
    result = await ServerAuth.authenticate();

    expect(result).toBe("jwt");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");

    // When
    result = await ServerAuth.authenticate();

    expect(result).toBe("jwt");
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server passes jwt to backend", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.APPROVED;
    Settings.authJwt = "jwt";

    const mockFetch = jest.fn()
      .mockReturnValueOnce((jwt: string) => emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue(jwt)
      } as Response));

    // When
    const result = await ServerAuth.fetchWithJwt((jwt) => (mockFetch()(jwt)));

    expect(mockFetch.mock.calls.length).toBe(1);
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(0);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(0);
    expect(result.status).toBe(200);
    expect(await result.json()).toBe("jwt");
    expect(Settings.authJwt).toBe("jwt");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server resets authentication if invalidated by backend", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.APPROVED;
    Settings.authJwt = "jwt";

    const mockFetch = jest.fn()
      .mockReturnValueOnce(() => emptyPromiseWithValue({
        ok: true,
        status: 401,
        json: () => emptyPromise()
      } as Response))
      .mockReturnValueOnce((jwt: string) => emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue(jwt)
      } as Response));

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            "requestId",
            null,
            null)
        })
      } as Response)
    );

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            "requestId",
            null,
            "jwt2")
        })
      } as Response)
    );

    // When
    const result = await ServerAuth.fetchWithJwt((jwt) => (mockFetch()(jwt)));

    expect(mockFetch.mock.calls.length).toBe(2);
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(result.status).toBe(200);
    expect(await result.json()).toBe("jwt2");
    expect(Settings.authJwt).toBe("jwt2");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });

  it("server stops authentication if invalidated twice by backend", async () => {
    // Given
    Settings.authRequestId = "requestId";
    Settings.authClientName = "authClientName";
    Settings.authStatus = AccessRequestStatus.APPROVED;
    Settings.authJwt = "jwt";

    const mockFetch = jest.fn()
      .mockReturnValueOnce(() => emptyPromiseWithValue({
        ok: true,
        status: 401,
        json: () => emptyPromise()
      } as Response))
      .mockReturnValueOnce((jwt: string) => emptyPromiseWithValue({
        ok: true,
        status: 401,
        json: () => emptyPromiseWithValue(jwt)
      } as Response));

    (authApi.auth.requestAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            "requestId",
            null,
            null)
        })
      } as Response)
    );

    (authApi.auth.retrieveAccess as Mock).mockReturnValueOnce(
      emptyPromiseWithValue({
        ok: true,
        status: 200,
        json: () => emptyPromiseWithValue({
          type: JsonResponseType.SUCCESS,
          content: new AccessRequestResponse(
            AccessRequestStatus.APPROVED,
            "requestId",
            null,
            "jwt2")
        })
      } as Response)
    );

    // When
    const result = await ServerAuth.fetchWithJwt((jwt) => (mockFetch()(jwt)));

    expect(mockFetch.mock.calls.length).toBe(2);
    expect((authApi.auth.requestAccess as Mock).mock.calls.length).toBe(1);
    expect((authApi.auth.retrieveAccess as Mock).mock.calls.length).toBe(1);
    expect(result.status).toBe(401);
    expect(Settings.authJwt).toBe("jwt2");
    expect(Settings.authStatus).toBe(AccessRequestStatus.APPROVED);
    expect(Settings.authRequestId).toBe("requestId");
    expect(Settings.authDeniedReason).toBe("");
  });
});
