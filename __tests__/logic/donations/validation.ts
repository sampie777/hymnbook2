import { describe, expect, it } from '@jest/globals';
import { Donations } from "../../../source/logic/donations";

describe("The donation validation function", () => {
  it("validates all available currencies as true", () => {
    Donations.currencies.forEach(it => {
      try {
        Donations.validateDonation(9999, it.code)
      } catch (error) {
        throw Error("Test failed for currency: " + it.code)
      }
    })
  })

  it("validates a non existing currency", () => {
      try {
        Donations.validateDonation(9999, "XXX")
        expect(false).toBe(true)
      } catch (error) {
      }
      try {
        Donations.validateDonation(9999, "X")
        expect(false).toBe(true)
      } catch (error) {
      }
  })

  it("validates all available currencies to have a minimum of 1 amount", () => {
    Donations.currencies.forEach(it => {
      try {
        Donations.validateDonation(0.9, it.code)
        throw Error("Test failed for currency: " + it.code)
      } catch (error) {
      }
    })
  })

  it("validates all available currencies to allow the minimum amount", () => {
    Donations.currencies.forEach(it => {
      try {
        Donations.validateDonation(it.increment ?? 1, it.code)
      } catch (error) {
        throw Error("Test failed for currency: " + it.code)
      }
    })
  })
})