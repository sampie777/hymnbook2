import {describe, expect, it} from "@jest/globals";
import {isLocalhostServer} from "../../../source/logic/api";

describe("isLocalhostServer", () => {
  it("detects localhost URLs", () => {
    expect(isLocalhostServer("http://localhost:8080")).toBe(true);
    expect(isLocalhostServer("http://localhost:8080/api/v1")).toBe(true);
    expect(isLocalhostServer("http://localhost")).toBe(true);
    expect(isLocalhostServer("https://localhost:3000")).toBe(true);
    expect(isLocalhostServer("localhost")).toBe(true);
  });

  it("detects loopback IP addresses", () => {
    expect(isLocalhostServer("http://127.0.0.1:8080")).toBe(true);
    expect(isLocalhostServer("http://127.0.0.1:8080/api/v1")).toBe(true);
    expect(isLocalhostServer("http://[::1]:8080")).toBe(true);
  });

  it("detects Android emulator host loopback", () => {
    expect(isLocalhostServer("http://10.0.2.2:8080")).toBe(true);
    expect(isLocalhostServer("http://10.0.2.2:8080/api/v1")).toBe(true);
  });

  it("detects local LAN development IPs", () => {
    expect(isLocalhostServer("http://192.168.1.100:3000/api/v1")).toBe(true);
    expect(isLocalhostServer("http://10.0.0.5:8080")).toBe(true);
    expect(isLocalhostServer("http://my-machine.local:8080")).toBe(true);
  });

  it("returns false for production and remote servers", () => {
    expect(isLocalhostServer("https://jschedule.sajansen.nl")).toBe(false);
    expect(isLocalhostServer("https://jschedule.sajansen.nl/api/v1")).toBe(false);
    expect(isLocalhostServer("https://hymnbook.sajansen.nl")).toBe(false);
    expect(isLocalhostServer("https://database.sajansen.nl")).toBe(false);
    expect(isLocalhostServer("https://api.example.com")).toBe(false);
  });

  it("handles empty input gracefully", () => {
    expect(isLocalhostServer("")).toBe(false);
  });
});
