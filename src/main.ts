// import { Chart } from "chart.js/auto";
// import { getFutureDates } from "./utils";

// let futureValueChart: Chart | null = null;

document
  .querySelector<HTMLButtonElement>("#futureValueCalculate")
  ?.addEventListener("click", () => {
    let presentValue = Number(
      document.querySelector<HTMLInputElement>("#futureValue_presentValue")
        ?.value,
    );
    let annualRate = Number(
      document.querySelector<HTMLInputElement>("#futureValue_annualRate")
        ?.value,
    );
    let monthlyContribution = Number(
      document.querySelector<HTMLInputElement>(
        "#futureValue_monthlyContribution",
      )?.value,
    );
    let totalYears = Number(
      document.querySelector<HTMLInputElement>("#futureValue_totalYears")
        ?.value,
    );

    let futureValues = calculateFutureValue(
      presentValue,
      annualRate,
      monthlyContribution,
      totalYears,
    );
  });

document
  .querySelector<HTMLButtonElement>("#investmentPeriodCalculate")
  ?.addEventListener("click", () => {
    let presentValue = document.querySelector<HTMLInputElement>(
      "#investmentPeriod_presentValue",
    )?.value;
    let futureValue = document.querySelector<HTMLInputElement>(
      "#investmentPeriod_futureValue",
    )?.value;
    let annualRate = document.querySelector<HTMLInputElement>(
      "#investmentPeriod_annualRate",
    )?.value;
    let monthlyContribution = document.querySelector<HTMLInputElement>(
      "#investmentPeriod_monthlyContribution",
    )?.value;

    console.log(
      calculateInvestmentPeriod(
        Number(presentValue),
        Number(futureValue),
        Number(annualRate),
        Number(monthlyContribution),
      ),
    );
  });

document
  .querySelector<HTMLButtonElement>("#returnRateCalculate")
  ?.addEventListener("click", () => {
    let presentValue = document.querySelector<HTMLInputElement>(
      "#returnRate_presentValue",
    )?.value;
    let futureValue = document.querySelector<HTMLInputElement>(
      "#returnRate_futureValue",
    )?.value;
    let monthlyContribution = document.querySelector<HTMLInputElement>(
      "#returnRate_monthlyContribution",
    )?.value;
    let totalYears = document.querySelector<HTMLInputElement>(
      "#returnRate_totalYears",
    )?.value;

    console.log(
      calculateAnnualReturnRate(
        Number(presentValue),
        Number(futureValue),
        Number(monthlyContribution),
        Number(totalYears),
      ),
    );
  });

function calculateFutureValue(
  presentValue: number,
  annualRate: number,
  monthlyContribution: number,
  totalYears: number,
): {
  principals: Array<number>;
  simpleInterestFVs: Array<number>;
  compoundInterestFVs: Array<number>;
} {
  let monthlyRate = annualRate / 12;
  let principals: Array<number> = [roundToNDecimal(presentValue)];
  let simpleInterestFVs: Array<number> = [roundToNDecimal(presentValue)];
  let compoundInterestFVs: Array<number> = [roundToNDecimal(presentValue)];

  for (let year = 0; year < totalYears; year++) {
    let compoundInterestFV = compoundInterestFVs[year] * (1 + annualRate);

    for (let k = 0; k < 12; k++) {
      compoundInterestFV +=
        monthlyContribution * Math.pow(1 + monthlyRate, 12 - k);
    }

    principals.push(
      roundToNDecimal(principals[year] + monthlyContribution * 12),
    );
    simpleInterestFVs.push(
      roundToNDecimal(principals[year + 1] * (1 + annualRate * (year + 1))),
    );
    compoundInterestFVs.push(roundToNDecimal(compoundInterestFV));
  }

  return {
    principals,
    simpleInterestFVs,
    compoundInterestFVs,
  };
}

function calculateInvestmentPeriod(
  presentValue: number,
  futureValue: number,
  annualRate: number,
  monthlyContribution: number,
): number {
  let monthlyRate = annualRate / 12;
  let years: number = 0;

  if (monthlyContribution === 0) {
    years =
      Math.log(futureValue / presentValue) / (12 * Math.log(1 + monthlyRate));
  } else {
    function equation(years: number): number {
      return (
        presentValue * Math.pow(1 + monthlyRate, 12 * years) +
        (monthlyContribution * (Math.pow(1 + monthlyRate, 12 * years) - 1)) /
          monthlyRate -
        futureValue
      );
    }

    years = solve(equation, 100);
  }

  return roundToNDecimal(years, 1);
}

function calculateAnnualReturnRate(
  presentValue: number,
  futureValue: number,
  monthlyContribution: number,
  totalYears: number,
): number {
  function equation(rate: number): number {
    const totalMonths = totalYears * 12;
    return (
      presentValue * Math.pow(1 + rate, totalYears) +
      (monthlyContribution * (Math.pow(1 + rate / 12, totalMonths) - 1)) /
        (rate / 12) -
      futureValue
    );
  }

  return roundToNDecimal(solve(equation), 4);
}

function solve(equation: Function, upper: number = 1): number {
  let lower: number = 0;
  let mid: number = 0;
  let tol: number = 1e-6;

  while (upper - lower > tol) {
    mid = (lower + upper) / 2;
    if (equation(mid) > 0) {
      upper = mid;
    } else {
      lower = mid;
    }
  }

  return (lower + upper) / 2;
}

function roundToNDecimal(num: number, decimal: number = 2): number {
  const D = Math.pow(10, decimal);
  return Math.round((num + Number.EPSILON) * D) / D;
}
