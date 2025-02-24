import { roundToNDecimal } from "./utils";

export enum TimePeriodUnit {
  Year,
  Month,
}

export enum InterestRateType {
  Yearly,
  Monthly,
}

export enum CompoundingFrequency {
  Yearly,
  SemiYearly,
  Quarterly,
  Monthly,
  Daily,
}

export class InterestCalculator {
  calculate(
    initialInvestment: number,
    periodicContribution: number,
    investmentDuration: number,
    timePeriodUnit: TimePeriodUnit,
    interestRate: number,
    interestRateType: InterestRateType,
    compoundingFrequency: CompoundingFrequency,
  ) {
    const investmentResult = new InvestmentResult();
    const annualInterestRate =
      interestRateType === InterestRateType.Monthly
        ? interestRate * 12
        : interestRate;
    const compoundingPeriodsPerYear =
      this.getCompoundingPeriodsPerYear(compoundingFrequency);
    let periodsPerContribution = Math.floor(12 / compoundingPeriodsPerYear);

    let periodicInterestRate = (annualInterestRate / 12) * 0.01;
    if (compoundingFrequency === CompoundingFrequency.Daily) {
      periodicInterestRate =
        Math.pow(1 + (annualInterestRate / 360) * 0.01, 30) - 1;
      periodsPerContribution = 1;
    }

    const totalPeriods =
      timePeriodUnit === TimePeriodUnit.Year
        ? 12 * investmentDuration
        : investmentDuration;
    let currentPrincipal = initialInvestment;
    let currentInterest = 0;
    let totalInterest = 0;
    investmentResult.contribution = [initialInvestment];
    investmentResult.totalInvestment = initialInvestment;
    investmentResult.endingBalances.push(roundToNDecimal(initialInvestment, 2));

    for (let period = 0; period < totalPeriods; period++) {
      if (period % periodsPerContribution === 0) {
        currentPrincipal += currentInterest;
        currentInterest = 0;
      }
      investmentResult.startingBalances.push(
        roundToNDecimal(currentPrincipal + currentInterest, 2),
      );
      const interestForPeriod = currentPrincipal * periodicInterestRate;
      currentInterest += interestForPeriod;
      totalInterest += interestForPeriod;
      investmentResult.endingBalances.push(
        roundToNDecimal(currentPrincipal + currentInterest, 2),
      );
      investmentResult.interestEarnedPerPeriod.push(
        roundToNDecimal(interestForPeriod, 2),
      );
      investmentResult.totalInterestEarned.push(
        roundToNDecimal(totalInterest, 2),
      );
      investmentResult.contribution.push(
        roundToNDecimal(
          investmentResult.contribution[
            investmentResult.contribution.length - 1
          ] + periodicContribution,
          2,
        ),
      );
      currentPrincipal += periodicContribution;
    }

    if (totalPeriods >= 2) {
      investmentResult.totalInvestment +=
        (totalPeriods - 1) * periodicContribution;
    }

    investmentResult.apy = roundToNDecimal(
      this.calculateAPY(annualInterestRate, compoundingFrequency),
      2,
    );

    return investmentResult;
  }

  getCompoundingPeriodsPerYear(compoundingFrequency: CompoundingFrequency) {
    switch (compoundingFrequency) {
      case CompoundingFrequency.Yearly:
        return 1;
      case CompoundingFrequency.SemiYearly:
        return 2;
      case CompoundingFrequency.Quarterly:
        return 4;
      case CompoundingFrequency.Monthly:
        return 12;
      case CompoundingFrequency.Daily:
        return 360;
    }
  }

  calculateAPY(
    annualInterestRate: number,
    compoundingFrequency: CompoundingFrequency,
  ) {
    const periodsPerYear =
      this.getCompoundingPeriodsPerYear(compoundingFrequency);
    const apy =
      (Math.pow(
        1 + (annualInterestRate / periodsPerYear) * 0.01,
        periodsPerYear,
      ) -
        1) *
      100;
    return apy;
  }
}

export class InvestmentResult {
  contribution: number[];
  startingBalances: number[];
  endingBalances: number[];
  interestEarnedPerPeriod: number[];
  totalInterestEarned: number[];
  totalInvestment: number;
  apy: number;

  constructor() {
    this.interestEarnedPerPeriod = [];
    this.totalInterestEarned = [];
    this.startingBalances = [];
    this.endingBalances = [];
    this.contribution = [];
    this.totalInvestment = 0;
    this.apy = 0;
  }
}
