import { DeepLinking } from "../../../source/logic/deeplinking";

describe("deeplinking", () => {
  it("parses url to route object", () => {
    expect(DeepLinking.parseUrl("https://my.domain.com/open/my/path///")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/open/my/path",
    });
    expect(DeepLinking.parseUrl("https://my.domain.com/open/my/path/")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/open/my/path",
    });
    expect(DeepLinking.parseUrl("https://my.domain.com/open/my/path")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/open/my/path",
    });
    expect(DeepLinking.parseUrl("https://my.domain.com/open/my/path?s=https://my.domain.com/open")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/open/my/path?s=https://my.domain.com/open",
    });
    expect(DeepLinking.parseUrl("https://my.domain.com/")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/",
    });
    expect(DeepLinking.parseUrl("https://my.domain.com")).toStrictEqual({
      scheme: "https",
      host: "my.domain.com",
      path: "/",
    });
    expect(DeepLinking.parseUrl("myscheme://open/my/path/")).toStrictEqual({
      scheme: "myscheme",
      host: undefined,
      path: "/open/my/path",
    });
    expect(DeepLinking.parseUrl("myscheme://open/my/path")).toStrictEqual({
      scheme: "myscheme",
      host: undefined,
      path: "/open/my/path",
    });
    expect(DeepLinking.parseUrl("myscheme://")).toStrictEqual({
      scheme: "myscheme",
      host: undefined,
      path: "/",
    });
  });

  it("finds matching callback for given paths", () => {
    const callbackAB = () => null;
    const callbackABC = () => null;
    const callbackABCD = () => null;
    const callbackABCid = () => null;
    const callbackABCname = () => null;
    const callbackABCnameId = () => null;
    const callbackDE = () => null;
    DeepLinking.registerRoute("/a/b", callbackAB);
    DeepLinking.registerRoute("/a/b/c", callbackABC);
    DeepLinking.registerRoute("/a/b/c/d", callbackABCD);
    DeepLinking.registerRoute("/a/b/c/:id", callbackABCid);
    DeepLinking.registerRoute("/a/b/:name/d", callbackABCname);
    DeepLinking.registerRoute("/a/b/:name/:id", callbackABCnameId);
    DeepLinking.registerRoute("/d/:e", callbackDE);

    expect(DeepLinking.findCallback("/a/b")?.callback).toBe(callbackAB);
    expect(DeepLinking.findCallback("/a/b/c")?.callback).toBe(callbackABC);
    expect(DeepLinking.findCallback("/a/b/c/d")?.callback).toBe(callbackABCD);
    expect(DeepLinking.findCallback("/a/b/c/1")?.callback).toBe(callbackABCid);
    expect(DeepLinking.findCallback("/a/b/charlie/d")?.callback).toBe(callbackABCname);
    expect(DeepLinking.findCallback("/a/b/charlie/1")?.callback).toBe(callbackABCnameId);
    expect(DeepLinking.findCallback("/d/1/extra")?.callback).toBe(callbackDE);
    expect(DeepLinking.findCallback("/a")).toBe(null);
    expect(DeepLinking.findCallback("/a/b/2")).toBe(null);
  });

  it("extracts path variables from path", () => {
    expect(DeepLinking.populateRouteWithPathVariables("/a/b", "/a/b")).toStrictEqual({});
    expect(DeepLinking.populateRouteWithPathVariables("/a/:id", "/a/1")).toStrictEqual({ id: "1" });
    expect(DeepLinking.populateRouteWithPathVariables("/a/:name/:id", "/a/charlie/1")).toStrictEqual({
      name: "charlie",
      id: "1",
    });
    expect(DeepLinking.populateRouteWithPathVariables("/a/:name", "/a/charlie/1")).toStrictEqual({
      name: "charlie",
    });
  });

  it("handles paths by calling the correct handler with the correct arguments", () => {
    // Given
    const callbackAB = jest.fn();
    const callbackABC = jest.fn();
    const callbackABCD = jest.fn();
    const callbackABCid = jest.fn();
    const callbackABCname = jest.fn();
    const callbackABCnameId = jest.fn();
    DeepLinking.registerRoute("/a/b", callbackAB);
    DeepLinking.registerRoute("/a/b/c", callbackABC);
    DeepLinking.registerRoute("/a/b/c/d", callbackABCD);
    DeepLinking.registerRoute("/a/b/c/:id", callbackABCid);
    DeepLinking.registerRoute("/a/b/:name/d", callbackABCname);
    DeepLinking.registerRoute("/a/b/:name/:id", callbackABCnameId);

    // When
    DeepLinking.handle("myscheme://a/b", false);
    DeepLinking.handle("myscheme://a/b/c", false);
    DeepLinking.handle("myscheme://a/b/c/d", false);
    DeepLinking.handle("myscheme://a/b/c/1", false);
    DeepLinking.handle("myscheme://a/b/charlie/d", false);
    DeepLinking.handle("myscheme://a/b/charlie/1", false);
    DeepLinking.handle("myscheme://a", false);
    DeepLinking.handle("myscheme://a/b/2", false);

    // Expect
    expect(callbackAB).toBeCalledTimes(1);
    expect(callbackAB).toBeCalledWith({
      scheme: "myscheme",
      host: undefined,
      path: "/a/b",
    }, {});
    expect(callbackABC).toBeCalledTimes(1);
    expect(callbackABCD).toBeCalledTimes(1);
    expect(callbackABCid).toBeCalledTimes(1);
    expect(callbackABCname).toBeCalledTimes(1);
    expect(callbackABCnameId).toBeCalledTimes(1);
    expect(callbackABCnameId).toBeCalledWith({
      scheme: "myscheme",
      host: undefined,
      path: "/a/b/charlie/1",
    }, {
      name: "charlie",
      id: "1",
    });
  });
});
