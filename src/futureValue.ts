import { Chart } from "chart.js/auto";
import {
  TimePeriodUnit,
  InterestRateType,
  CompoundingFrequency,
  InterestCalculator,
  InvestmentResult,
} from "./calculator";

let futureValueChart: Chart | null = null;

const INTEREST_RATE_TYPE_MAP: Record<string, InterestRateType> = {
  yearly: InterestRateType.Yearly,
  monthly: InterestRateType.Monthly,
};

const TIME_PERIOD_UNIT_MAP: Record<string, TimePeriodUnit> = {
  year: TimePeriodUnit.Year,
  month: TimePeriodUnit.Month,
};

const COMPOUNDING_FREQUENCY_MAP: Record<string, CompoundingFrequency> = {
  yearly: CompoundingFrequency.Yearly,
  semiyearly: CompoundingFrequency.SemiYearly,
  quarterly: CompoundingFrequency.Quarterly,
  monthly: CompoundingFrequency.Monthly,
  daily: CompoundingFrequency.Daily,
};

const getFormattedValue = (value: string): number => {
  return Number(value.replace(/,/g, ""));
};

const getFormattedPercentage = (value: string): number => {
  return Number(value.replace(/%/g, ""));
};

const addFormat = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement;
  let value = target.value.replace(/,/g, "");
  if (!isNaN(Number(value)) && value.trim() !== "") {
    target.value = Number(value).toLocaleString();
  }
};

const removeFormat = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement;
  target.value = target.value.replace(/,/g, "");
};

const addPercentSign = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement;
  let value = target.value.replace(/%/g, "");
  if (!isNaN(Number(value)) && value.trim() !== "") {
    target.value += "%";
  }
};

const removePercentSign = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement;
  target.value = target.value.replace(/%/g, "");
};

const getInputValue = (selector: string): HTMLInputElement => {
  return document.querySelector(selector) as HTMLInputElement;
};

const presentValueInput = getInputValue("#fv-present-value");
const monthlyContributionInput = getInputValue("#fv-monthly-contribution");
const interestRateInput = getInputValue("#fv-interest-rate");
const timePeriodInput = getInputValue("#fv-time-period");
const compoundingFrequencySelect = document.querySelector(
  "#fv-compounding-frequency",
) as HTMLSelectElement;

presentValueInput.addEventListener("blur", addFormat);
presentValueInput.addEventListener("focus", removeFormat);
monthlyContributionInput.addEventListener("blur", addFormat);
monthlyContributionInput.addEventListener("focus", removeFormat);
interestRateInput.addEventListener("blur", addPercentSign);
interestRateInput.addEventListener("focus", removePercentSign);

document
  .querySelector<HTMLButtonElement>("#futureValueCalculate")
  ?.addEventListener("click", () => {
    const interestRateUnitChecked = document.querySelector(
      'input[name="fv-interest-rate-unit"]:checked',
    ) as HTMLInputElement;

    const timePeriodUnitChecked = document.querySelector(
      'input[name="fv-time-period-unit"]:checked',
    ) as HTMLInputElement;

    let presentValue = getFormattedValue(presentValueInput.value);
    let monthlyContribution = getFormattedValue(monthlyContributionInput.value);
    let interestRateType =
      INTEREST_RATE_TYPE_MAP[interestRateUnitChecked.value];
    let interestRate = getFormattedPercentage(interestRateInput.value);
    let timePeriodUnit = TIME_PERIOD_UNIT_MAP[timePeriodUnitChecked.value];
    let timePeriod = Number(timePeriodInput.value);
    let compoundingFrequency =
      COMPOUNDING_FREQUENCY_MAP[compoundingFrequencySelect.value];

    const calculator = new InterestCalculator();
    const result = calculator.calculate(
      presentValue,
      monthlyContribution,
      timePeriod,
      timePeriodUnit,
      interestRate,
      interestRateType,
      compoundingFrequency,
    );

    const totalInterestEarned =
      result.totalInterestEarned[result.totalInterestEarned.length - 1];
    const totalBalance =
      result.endingBalances[result.endingBalances.length - 1];

    document.getElementById("principal")!.textContent = (
      totalInterestEarned - totalBalance
    ).toFixed(2);
    document.getElementById("earning")!.textContent =
      totalInterestEarned.toFixed(2);
    document.getElementById("total")!.textContent = totalBalance.toFixed(2);

    const ctx = document
      .querySelector<HTMLCanvasElement>("#futureValueChart")
      ?.getContext("2d")!;

    if (futureValueChart) {
      futureValueChart.destroy();
    }

    futureValueChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: getFutureDates(timePeriod, timePeriodUnit),
        datasets: [
          {
            label: "Principals",
            data: getChartValues(result, timePeriodUnit),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
        },
      },
    });
  });

const getChartValues = (
  result: InvestmentResult,
  timePeriodUnit: TimePeriodUnit,
) => {
  return timePeriodUnit === TimePeriodUnit.Year
    ? result.endingBalances.filter((_, index) => index % 12 === 0)
    : result.endingBalances;
};

const getFutureDates = (
  N: number,
  timePeriodUnit: TimePeriodUnit,
): Array<string> => {
  let currentDate = new Date();
  let dates: Array<string> = [];

  for (let i = 0; i <= N; i++) {
    let nextDate = new Date(currentDate);
    if (timePeriodUnit === TimePeriodUnit.Year) {
      nextDate.setFullYear(currentDate.getFullYear() + i);
    } else {
      nextDate.setMonth(currentDate.getMonth() + i);
    }

    dates.push(nextDate.toISOString().split("T")[0]);
  }

  return dates;
};
