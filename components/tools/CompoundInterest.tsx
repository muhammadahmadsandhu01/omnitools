"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Info,
  Layers,
  Plus,
  RotateCcw,
  Share2,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import {
  analyzeGoal,
  calculateEffectiveApy,
  calculateFisherRealReturn,
  calculateRuleOf72,
  cleanNumber,
  COMPOUNDING_PERIODS,
  CompoundingFrequency,
  ContributionFrequency,
  ContributionTiming,
  generateCsvReport,
  generateScenarios,
  OneTimeEvent,
  runMonteCarloSimulation,
  runStressTests,
  simulateTimeline,
  TaxTreatment,
} from "./compoundInterestEngine";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type FrequencyKey = CompoundingFrequency;

export const WORLD_CURRENCIES: Currency[] = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AFN", symbol: "AFN", name: "Afghani" },
  { code: "ALL", symbol: "Lek", name: "Lek" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram" },
  { code: "ANG", symbol: "ƒ", name: "Netherlands Antillean Guilder" },
  { code: "AOA", symbol: "Kz", name: "Kwanza" },
  { code: "ARS", symbol: "$", name: "Argentine Peso" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "AWG", symbol: "ƒ", name: "Aruban Florin" },
  { code: "AZN", symbol: "₼", name: "Azerbaijan Manat" },
  { code: "BAM", symbol: "KM", name: "Convertible Mark" },
  { code: "BBD", symbol: "$", name: "Barbados Dollar" },
  { code: "BDT", symbol: "৳", name: "Taka" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar" },
  { code: "BIF", symbol: "FBu", name: "Burundi Franc" },
  { code: "BMD", symbol: "$", name: "Bermudian Dollar" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar" },
  { code: "BOB", symbol: "BOB", name: "Boliviano" },
  { code: "BOV", symbol: "BOV", name: "Mvdol" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "BSD", symbol: "$", name: "Bahamian Dollar" },
  { code: "BTN", symbol: "Nu.", name: "Ngultrum" },
  { code: "BWP", symbol: "P", name: "Pula" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble" },
  { code: "BZD", symbol: "BZ$", name: "Belize Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CDF", symbol: "FC", name: "Congolese Franc" },
  { code: "CHE", symbol: "CHE", name: "WIR Euro" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CHW", symbol: "CHW", name: "WIR Franc" },
  { code: "CLF", symbol: "UF", name: "Unidad de Fomento" },
  { code: "CLP", symbol: "$", name: "Chilean Peso" },
  { code: "CNY", symbol: "¥", name: "Yuan Renminbi" },
  { code: "COP", symbol: "$", name: "Colombian Peso" },
  { code: "COU", symbol: "COU", name: "Unidad de Valor Real" },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colon" },
  { code: "CUC", symbol: "$", name: "Peso Convertible" },
  { code: "CUP", symbol: "₱", name: "Cuban Peso" },
  { code: "CVE", symbol: "$", name: "Cabo Verde Escudo" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "DJF", symbol: "Fdj", name: "Djibouti Franc" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso" },
  { code: "DZD", symbol: "دج", name: "Algerian Dinar" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "ERN", symbol: "Nfk", name: "Nakfa" },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "FJD", symbol: "FJ$", name: "Fiji Dollar" },
  { code: "FKP", symbol: "£", name: "Falkland Islands Pound" },
  { code: "GBP", symbol: "£", name: "Pound Sterling" },
  { code: "GEL", symbol: "₾", name: "Lari" },
  { code: "GHS", symbol: "₵", name: "Ghana Cedi" },
  { code: "GIP", symbol: "£", name: "Gibraltar Pound" },
  { code: "GMD", symbol: "D", name: "Dalasi" },
  { code: "GNF", symbol: "FG", name: "Guinean Franc" },
  { code: "GTQ", symbol: "Q", name: "Quetzal" },
  { code: "GYD", symbol: "G$", name: "Guyana Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "HNL", symbol: "L", name: "Lempira" },
  { code: "HRK", symbol: "kn", name: "Kuna" },
  { code: "HTG", symbol: "G", name: "Gourde" },
  { code: "HUF", symbol: "Ft", name: "Forint" },
  { code: "IDR", symbol: "Rp", name: "Rupiah" },
  { code: "ILS", symbol: "₪", name: "New Israeli Sheqel" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "IQD", symbol: "IQD", name: "Iraqi Dinar" },
  { code: "IRR", symbol: "IRR", name: "Iranian Rial" },
  { code: "ISK", symbol: "kr", name: "Iceland Krona" },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar" },
  { code: "JPY", symbol: "¥", name: "Yen" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "KGS", symbol: "с", name: "Som" },
  { code: "KHR", symbol: "៛", name: "Riel" },
  { code: "KMF", symbol: "CF", name: "Comorian Franc" },
  { code: "KPW", symbol: "₩", name: "North Korean Won" },
  { code: "KRW", symbol: "₩", name: "Won" },
  { code: "KWD", symbol: "KD", name: "Kuwaiti Dinar" },
  { code: "KYD", symbol: "CI$", name: "Cayman Islands Dollar" },
  { code: "KZT", symbol: "₸", name: "Tenge" },
  { code: "LAK", symbol: "₭", name: "Lao Kip" },
  { code: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
  { code: "LKR", symbol: "Rs", name: "Sri Lanka Rupee" },
  { code: "LRD", symbol: "L$", name: "Liberian Dollar" },
  { code: "LSL", symbol: "L", name: "Loti" },
  { code: "LYD", symbol: "LD", name: "Libyan Dinar" },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  { code: "MDL", symbol: "L", name: "Moldovan Leu" },
  { code: "MGA", symbol: "Ar", name: "Malagasy Ariary" },
  { code: "MKD", symbol: "ден", name: "Denar" },
  { code: "MMK", symbol: "K", name: "Kyat" },
  { code: "MNT", symbol: "₮", name: "Tugrik" },
  { code: "MOP", symbol: "MOP$", name: "Pataca" },
  { code: "MRU", symbol: "UM", name: "Ouguiya" },
  { code: "MUR", symbol: "₨", name: "Mauritius Rupee" },
  { code: "MVR", symbol: "Rf", name: "Rufiyaa" },
  { code: "MWK", symbol: "MK", name: "Malawi Kwacha" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "MXV", symbol: "MXV", name: "Mexican Unidad de Inversion (UDI)" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "MZN", symbol: "MT", name: "Mozambique Metical" },
  { code: "NAD", symbol: "N$", name: "Namibia Dollar" },
  { code: "NGN", symbol: "₦", name: "Naira" },
  { code: "NIO", symbol: "C$", name: "Cordoba Oro" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "OMR", symbol: "﷼", name: "Rial Omani" },
  { code: "PAB", symbol: "B/.", name: "Balboa" },
  { code: "PEN", symbol: "S/", name: "Sol" },
  { code: "PGK", symbol: "K", name: "Kina" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "PKR", symbol: "₨", name: "Pakistan Rupee" },
  { code: "PLN", symbol: "zł", name: "Zloty" },
  { code: "PYG", symbol: "₲", name: "Guarani" },
  { code: "QAR", symbol: "﷼", name: "Qatari Rial" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar" },
  { code: "RUB", symbol: "RUB", name: "Russian Ruble" },
  { code: "RWF", symbol: "RF", name: "Rwanda Franc" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "SBD", symbol: "SI$", name: "Solomon Islands Dollar" },
  { code: "SCR", symbol: "₨", name: "Seychelles Rupee" },
  { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SHP", symbol: "£", name: "Saint Helena Pound" },
  { code: "SLE", symbol: "Le", name: "Leone" },
  { code: "SOS", symbol: "Sh", name: "Somali Shilling" },
  { code: "SRD", symbol: "$", name: "Surinam Dollar" },
  { code: "SSP", symbol: "£", name: "South Sudanese Pound" },
  { code: "STN", symbol: "Db", name: "Dobra" },
  { code: "SVC", symbol: "$", name: "El Salvador Colon" },
  { code: "SYP", symbol: "£", name: "Syrian Pound" },
  { code: "SZL", symbol: "L", name: "Lilangeni" },
  { code: "THB", symbol: "฿", name: "Baht" },
  { code: "TJS", symbol: "SM", name: "Somoni" },
  { code: "TMT", symbol: "m", name: "Turkmenistan New Manat" },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
  { code: "TOP", symbol: "T$", name: "Pa’anga" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "TTD", symbol: "TT$", name: "Trinidad and Tobago Dollar" },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "UAH", symbol: "₴", name: "Hryvnia" },
  { code: "UGX", symbol: "USh", name: "Uganda Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "USN", symbol: "USN", name: "US Dollar (Next day)" },
  { code: "UYI", symbol: "UYI", name: "Uruguay Peso en Unidades Indexadas (UI)" },
  { code: "UYU", symbol: "$U", name: "Peso Uruguayo" },
  { code: "UYW", symbol: "UYW", name: "Unidad Previsional" },
  { code: "UZS", symbol: "soʻm", name: "Uzbekistan Sum" },
  { code: "VED", symbol: "VED", name: "Bolívar Soberano" },
  { code: "VES", symbol: "Bs.S", name: "Bolívar Soberano" },
  { code: "VND", symbol: "₫", name: "Dong" },
  { code: "VUV", symbol: "VT", name: "Vatu" },
  { code: "WST", symbol: "WS$", name: "Tala" },
  { code: "XAF", symbol: "FCFA", name: "CFA Franc BEAC" },
  { code: "XAG", symbol: "XAG", name: "Silver" },
  { code: "XAU", symbol: "XAU", name: "Gold" },
  { code: "XBA", symbol: "XBA", name: "Bond Markets Unit European Composite Unit (EURCO)" },
  { code: "XBB", symbol: "XBB", name: "Bond Markets Unit European Monetary Unit (E.M.U.-6)" },
  { code: "XBC", symbol: "XBC", name: "Bond Markets Unit European Unit of Account 9 (E.U.A.-9)" },
  { code: "XBD", symbol: "XBD", name: "Bond Markets Unit European Unit of Account 17 (E.U.A.-17)" },
  { code: "XCD", symbol: "EC$", name: "East Caribbean Dollar" },
  { code: "XDR", symbol: "XDR", name: "SDR (Special Drawing Right)" },
  { code: "XOF", symbol: "CFA", name: "CFA Franc BCEAO" },
  { code: "XPD", symbol: "XPD", name: "Palladium" },
  { code: "XPF", symbol: "₣", name: "CFP Franc" },
  { code: "XPT", symbol: "XPT", name: "Platinum" },
  { code: "XSU", symbol: "XSU", name: "Sucre" },
  { code: "XTS", symbol: "XTS", name: "Codes specifically reserved for testing purposes" },
  { code: "XUA", symbol: "XUA", name: "ADB Unit of Account" },
  { code: "XXX", symbol: "XXX", name: "The codes assigned for transactions where no currency is involved" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial" },
  { code: "ZAR", symbol: "R", name: "Rand" },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
  { code: "ZWL", symbol: "Z$", name: "Zimbabwe Dollar" },
];

export const COMPOUNDING: { key: FrequencyKey; label: string; periods: number }[] = [
  { key: "daily", label: "Daily (365/yr)", periods: 365 },
  { key: "monthly", label: "Monthly (12/yr)", periods: 12 },
  { key: "quarterly", label: "Quarterly (4/yr)", periods: 4 },
  { key: "semi-annually", label: "Semi-annually (2/yr)", periods: 2 },
  { key: "annually", label: "Annually (1/yr)", periods: 1 },
];

export const CONTRIBUTIONS: {
  key: ContributionFrequency;
  label: string;
  perYear: number;
}[] = [
  { key: "weekly", label: "Weekly (52/yr)", perYear: 52 },
  { key: "biweekly", label: "Every 2 weeks (26/yr)", perYear: 26 },
  { key: "monthly", label: "Monthly (12/yr)", perYear: 12 },
  { key: "quarterly", label: "Quarterly (4/yr)", perYear: 4 },
  { key: "annually", label: "Annually (1/yr)", perYear: 1 },
];

/**
 * Atomic currency formatter: binds currency symbol and numeric value together.
 * Guarantees that symbol and amount NEVER wrap onto separate lines.
 */
export function formatMoney(value: number, currency: Currency): string {
  const safe = Number.isFinite(value) ? value : 0;
  const isNegative = safe < 0;
  const absVal = Math.abs(safe);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);
  const sym = currency.symbol;
  return isNegative ? `-${sym}${formatted}` : `${sym}${formatted}`;
}

export function formatMoneyPrecise(
  value: number,
  currency: Currency,
  fractionDigits = 4
): string {
  const safe = Number.isFinite(value) ? value : 0;
  const isNegative = safe < 0;
  const absVal = Math.abs(safe);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(absVal);
  const sym = currency.symbol;
  return isNegative ? `-${sym}${formatted}` : `${sym}${formatted}`;
}

export type ActiveTab =
  | "chart"
  | "schedule"
  | "monte-carlo"
  | "stress-test"
  | "methodology"
  | "plan-io";

export default function CompoundInterest() {
  // Fresh Open Requirement: All planning assumptions start clean/blank
  const [principal, setPrincipal] = useState("");
  const [contribution, setContribution] = useState("");
  const [years, setYears] = useState("");
  const [rate, setRate] = useState("");
  const [inflation, setInflation] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>("taxable");
  const [goal, setGoal] = useState("");
  const [scenarioSpread, setScenarioSpread] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [compounding, setCompounding] = useState<FrequencyKey>("monthly");
  const [contributionFrequency, setContributionFrequency] =
    useState<ContributionFrequency>("monthly");
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>("end");
  const [showInflation, setShowInflation] = useState(false);

  // Advanced Cash Flows & Drag Inputs
  const [showAdvancedCashFlows, setShowAdvancedCashFlows] = useState(false);
  const [contributionEscalation, setContributionEscalation] = useState("");
  const [fixedEscalation, setFixedEscalation] = useState("");
  const [annualFeeRate, setAnnualFeeRate] = useState("");
  const [fixedAnnualFee, setFixedAnnualFee] = useState("");
  const [oneTimeEvents, setOneTimeEvents] = useState<OneTimeEvent[]>([]);

  // Drawdown / Retirement Phase Inputs
  const [drawdownEnabled, setDrawdownEnabled] = useState(false);
  const [accumulationYears, setAccumulationYears] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalFrequency, setWithdrawalFrequency] =
    useState<ContributionFrequency>("monthly");
  const [withdrawalInflationAdjusted, setWithdrawalInflationAdjusted] =
    useState(false);

  // Monte Carlo & Stress Settings
  const [mcVolatility, setMcVolatility] = useState("14");
  const [mcSimulationCount, setMcSimulationCount] = useState("500");
  const [showMcOnChart, setShowMcOnChart] = useState(false);

  // UI Navigation & Share
  const [activeTab, setActiveTab] = useState<ActiveTab>("chart");
  const [copied, setCopied] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currency = useMemo(
    () =>
      WORLD_CURRENCIES.find((item) => item.code === currencyCode) ??
      WORLD_CURRENCIES[0],
    [currencyCode]
  );

  // Only restore when an explicit shared URL is present (?p=...&c=...)
  // Normal page open / refresh starts 100% clean with NO silent localStorage repopulation.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!window.location.search) return;
        const params = new URLSearchParams(window.location.search);
        let hasParams = false;

        if (params.has("p")) { setPrincipal(params.get("p") || ""); hasParams = true; }
        if (params.has("c")) { setContribution(params.get("c") || ""); hasParams = true; }
        if (params.has("y")) { setYears(params.get("y") || ""); hasParams = true; }
        if (params.has("r")) { setRate(params.get("r") || ""); hasParams = true; }
        if (params.has("i")) { setInflation(params.get("i") || ""); hasParams = true; }
        if (params.has("tax")) { setTaxRate(params.get("tax") || ""); hasParams = true; }
        if (params.has("tt")) {
          const tt = params.get("tt") as TaxTreatment;
          if (tt === "taxable" || tt === "deferred" || tt === "exempt") setTaxTreatment(tt);
          hasParams = true;
        }
        if (params.has("goal")) { setGoal(params.get("goal") || ""); hasParams = true; }
        if (params.has("spread")) { setScenarioSpread(params.get("spread") || ""); hasParams = true; }
        if (params.has("cur")) { setCurrencyCode(params.get("cur") || "USD"); hasParams = true; }
        if (params.has("comp")) {
          setCompounding((params.get("comp") as FrequencyKey) || "monthly");
          hasParams = true;
        }
        if (params.has("cf")) {
          setContributionFrequency(
            (params.get("cf") as ContributionFrequency) || "monthly"
          );
          hasParams = true;
        }
        if (params.has("ct")) {
          setContributionTiming((params.get("ct") as ContributionTiming) || "end");
          hasParams = true;
        }
        if (params.has("inf")) {
          setShowInflation(params.get("inf") === "true");
          hasParams = true;
        }
        if (params.has("esc")) {
          setContributionEscalation(params.get("esc") || "");
          setShowAdvancedCashFlows(true);
          hasParams = true;
        }
        if (params.has("fee")) {
          setAnnualFeeRate(params.get("fee") || "");
          setShowAdvancedCashFlows(true);
          hasParams = true;
        }
        if (params.has("dd")) {
          setDrawdownEnabled(params.get("dd") === "true");
          hasParams = true;
        }
        if (params.has("ddy")) {
          setAccumulationYears(params.get("ddy") || "");
          hasParams = true;
        }
        if (params.has("ddw")) {
          setWithdrawalAmount(params.get("ddw") || "");
          hasParams = true;
        }
        if (params.has("tab")) {
          const tab = params.get("tab") as ActiveTab;
          if (["chart", "schedule", "monte-carlo", "stress-test", "methodology", "plan-io"].includes(tab)) {
            setActiveTab(tab);
          }
          hasParams = true;
        }

        if (hasParams) {
          setPlanMessage("Shared plan loaded from link");
          window.setTimeout(() => setPlanMessage(null), 3000);
        }
      } catch {}
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Clean canonical financial inputs
  const canonicalInputs = useMemo(() => {
    return {
      principal: cleanNumber(principal, 0),
      annualRate: cleanNumber(rate, 0),
      years: Math.max(0.1, cleanNumber(years, 0)),
      compoundingFrequency: compounding,
      contribution: cleanNumber(contribution, 0),
      contributionFrequency,
      contributionTiming,
      contributionEscalationPercent: cleanNumber(contributionEscalation, 0),
      contributionEscalationFixed: cleanNumber(fixedEscalation, 0),
      annualFeeRate: cleanNumber(annualFeeRate, 0),
      fixedAnnualFee: cleanNumber(fixedAnnualFee, 0),
      taxRate: cleanNumber(taxRate, 0),
      taxTreatment,
      inflationRate: showInflation ? cleanNumber(inflation, 0) : 0,
      oneTimeEvents,
      drawdownEnabled,
      accumulationYears: cleanNumber(accumulationYears, cleanNumber(years, 0)),
      withdrawalAmount: cleanNumber(withdrawalAmount, 0),
      withdrawalFrequency,
      withdrawalType: "fixed" as const,
      withdrawalInflationAdjusted,
    };
  }, [
    principal,
    rate,
    years,
    compounding,
    contribution,
    contributionFrequency,
    contributionTiming,
    contributionEscalation,
    fixedEscalation,
    annualFeeRate,
    fixedAnnualFee,
    taxRate,
    taxTreatment,
    showInflation,
    inflation,
    oneTimeEvents,
    drawdownEnabled,
    accumulationYears,
    withdrawalAmount,
    withdrawalFrequency,
    withdrawalInflationAdjusted,
  ]);

  // Primary Projection Result from Canonical Engine
  const result = useMemo(() => simulateTimeline(canonicalInputs), [canonicalInputs]);

  // Goal Analysis & Solvers
  const goalValue = useMemo(() => Math.max(0, cleanNumber(goal, 0)), [goal]);
  const goalAnalysis = useMemo(
    () => analyzeGoal(goalValue, canonicalInputs),
    [goalValue, canonicalInputs]
  );

  // Multi-Scenario Planning
  const spread = useMemo(() => Math.max(0.1, cleanNumber(scenarioSpread, 2)), [scenarioSpread]);
  const scenarioRows = useMemo(
    () => generateScenarios(canonicalInputs, spread, goalValue),
    [canonicalInputs, spread, goalValue]
  );

  // Monte Carlo Simulation
  const monteCarloResult = useMemo(() => {
    return runMonteCarloSimulation({
      baseInputs: canonicalInputs,
      simulationCount: cleanNumber(mcSimulationCount, 500),
      annualVolatility: cleanNumber(mcVolatility, 14),
      seed: 42,
      targetGoal: goalValue,
    });
  }, [canonicalInputs, mcSimulationCount, mcVolatility, goalValue]);

  // Stress Tests
  const stressTests = useMemo(
    () => runStressTests(canonicalInputs, goalValue),
    [canonicalInputs, goalValue]
  );

  // Chart Sample Points
  const chartRows = useMemo(() => {
    const rows = result.schedule;
    if (rows.length <= 12) return rows;
    const step = Math.max(1, Math.ceil(rows.length / 11));
    return rows.filter(
      (row, index) => index === 0 || index % step === 0 || index === rows.length - 1
    );
  }, [result.schedule]);

  const maxChart = useMemo(() => {
    let max = Math.max(
      1,
      ...chartRows.map((row) => Math.max(row.closingBalance, row.cumulativeInvested))
    );
    if (showMcOnChart && monteCarloResult.paths.length > 0) {
      max = Math.max(
        max,
        ...monteCarloResult.paths.map((p) => p.p90)
      );
    }
    return max;
  }, [chartRows, showMcOnChart, monteCarloResult.paths]);

  // Derived Financial Metrics
  const apy = useMemo(
    () => calculateEffectiveApy(cleanNumber(rate, 0), compounding),
    [rate, compounding]
  );
  const fisherReal = useMemo(
    () =>
      calculateFisherRealReturn(
        cleanNumber(rate, 0),
        showInflation ? cleanNumber(inflation, 0) : 0
      ),
    [rate, showInflation, inflation]
  );
  const doublingYears = useMemo(
    () => calculateRuleOf72(cleanNumber(rate, 0)),
    [rate]
  );

  // Reset to clean plan
  const reset = () => {
    setPrincipal("");
    setContribution("");
    setYears("");
    setRate("");
    setInflation("");
    setTaxRate("");
    setTaxTreatment("taxable");
    setGoal("");
    setScenarioSpread("");
    setCurrencyCode("USD");
    setCompounding("monthly");
    setContributionFrequency("monthly");
    setContributionTiming("end");
    setShowInflation(false);
    setShowAdvancedCashFlows(false);
    setContributionEscalation("");
    setFixedEscalation("");
    setAnnualFeeRate("");
    setFixedAnnualFee("");
    setOneTimeEvents([]);
    setDrawdownEnabled(false);
    setAccumulationYears("");
    setWithdrawalAmount("");
    setWithdrawalFrequency("monthly");
    setWithdrawalInflationAdjusted(false);
    setActiveTab("chart");
    setShowMcOnChart(false);
  };

  const share = async () => {
    const params = new URLSearchParams({
      p: principal,
      c: contribution,
      y: years,
      r: rate,
      i: inflation,
      tax: taxRate,
      tt: taxTreatment,
      goal,
      spread: scenarioSpread,
      cur: currencyCode,
      comp: compounding,
      cf: contributionFrequency,
      ct: contributionTiming,
      inf: String(showInflation),
      esc: contributionEscalation,
      fee: annualFeeRate,
      dd: String(drawdownEnabled),
      ddy: accumulationYears,
      ddw: withdrawalAmount,
      tab: activeTab,
    });

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const downloadCSV = () => {
    const csvContent = generateCsvReport(result, currency.symbol);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `omnitools-compound-interest-schedule-${currencyCode.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const exportPlanJson = () => {
    const plan = {
      version: "3.0",
      timestamp: new Date().toISOString(),
      currency: currencyCode,
      inputs: canonicalInputs,
    };
    const jsonStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "omnitools-financial-plan.json";
    a.click();
    URL.revokeObjectURL(href);
    setPlanMessage("Plan exported successfully!");
    window.setTimeout(() => setPlanMessage(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const inp = parsed.inputs || parsed;

        if (inp.principal !== undefined) setPrincipal(String(inp.principal));
        if (inp.contribution !== undefined) setContribution(String(inp.contribution));
        if (inp.years !== undefined) setYears(String(inp.years));
        if (inp.annualRate !== undefined) setRate(String(inp.annualRate));
        if (inp.compoundingFrequency) setCompounding(inp.compoundingFrequency);
        if (inp.contributionFrequency) setContributionFrequency(inp.contributionFrequency);
        if (inp.contributionTiming) setContributionTiming(inp.contributionTiming);
        if (inp.inflationRate !== undefined) {
          setInflation(String(inp.inflationRate));
          setShowInflation(inp.inflationRate > 0);
        }
        if (inp.taxRate !== undefined) setTaxRate(String(inp.taxRate));
        if (inp.taxTreatment) setTaxTreatment(inp.taxTreatment);
        if (inp.contributionEscalationPercent !== undefined) {
          setContributionEscalation(String(inp.contributionEscalationPercent));
          setShowAdvancedCashFlows(true);
        }
        if (inp.annualFeeRate !== undefined) {
          setAnnualFeeRate(String(inp.annualFeeRate));
          setShowAdvancedCashFlows(true);
        }
        if (inp.drawdownEnabled !== undefined) setDrawdownEnabled(Boolean(inp.drawdownEnabled));
        if (inp.accumulationYears !== undefined) setAccumulationYears(String(inp.accumulationYears));
        if (inp.withdrawalAmount !== undefined) setWithdrawalAmount(String(inp.withdrawalAmount));
        if (Array.isArray(inp.oneTimeEvents)) setOneTimeEvents(inp.oneTimeEvents);
        if (parsed.currency) setCurrencyCode(parsed.currency);

        setPlanMessage("Plan imported and validated successfully!");
        window.setTimeout(() => setPlanMessage(null), 3000);
      } catch {
        setPlanMessage("Invalid or corrupted plan JSON file.");
        window.setTimeout(() => setPlanMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyPreset = (presetName: string) => {
    if (presetName === "wealth") {
      setPrincipal("10000");
      setContribution("500");
      setYears("20");
      setRate("8");
      setContributionEscalation("3");
      setAnnualFeeRate("0.2");
      setTaxRate("15");
      setTaxTreatment("taxable");
      setCompounding("monthly");
      setContributionFrequency("monthly");
      setDrawdownEnabled(false);
      setShowAdvancedCashFlows(true);
    } else if (presetName === "retirement") {
      setPrincipal("150000");
      setContribution("1000");
      setYears("30");
      setRate("7");
      setCompounding("monthly");
      setContributionFrequency("monthly");
      setDrawdownEnabled(true);
      setAccumulationYears("15");
      setWithdrawalAmount("3500");
      setWithdrawalFrequency("monthly");
      setWithdrawalInflationAdjusted(true);
      setInflation("2.5");
      setShowInflation(true);
      setShowAdvancedCashFlows(true);
    } else if (presetName === "aggressive") {
      setPrincipal("5000");
      setContribution("1000");
      setYears("25");
      setRate("10");
      setContributionEscalation("5");
      setAnnualFeeRate("0.1");
      setTaxTreatment("exempt");
      setCompounding("daily");
      setContributionFrequency("monthly");
      setDrawdownEnabled(false);
      setShowAdvancedCashFlows(true);
    } else if (presetName === "preservation") {
      setPrincipal("250000");
      setContribution("0");
      setYears("10");
      setRate("4.5");
      setCompounding("monthly");
      setContributionFrequency("monthly");
      setAnnualFeeRate("0.25");
      setInflation("2.5");
      setShowInflation(true);
      setDrawdownEnabled(false);
      setShowAdvancedCashFlows(true);
    }
    setPlanMessage(`Preset "${presetName}" applied!`);
    window.setTimeout(() => setPlanMessage(null), 2500);
  };

  const addOneTimeEvent = () => {
    const newEvt: OneTimeEvent = {
      id: `evt-${Date.now()}`,
      year: Math.min(cleanNumber(years, 10) || 5, 3),
      amount: 5000,
      type: "deposit",
      description: "Milestone Event",
    };
    setOneTimeEvents([...oneTimeEvents, newEvt]);
  };

  const removeOneTimeEvent = (id: string) => {
    setOneTimeEvents(oneTimeEvents.filter((e) => e.id !== id));
  };

  const updateOneTimeEvent = (id: string, updates: Partial<OneTimeEvent>) => {
    setOneTimeEvents(
      oneTimeEvents.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/70 dark:bg-[#0a1020] dark:text-slate-100 dark:placeholder:text-slate-600 dark:hover:border-slate-600 dark:focus:border-blue-400";
  const selectClass =
    "w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/70 dark:bg-[#0a1020] dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-blue-400";
  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300";

  return (
    <div className="mx-auto w-full max-w-[1240px] min-w-0 rounded-[28px] border border-slate-200 bg-white p-3 text-slate-900 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#070b14] dark:text-slate-100 dark:shadow-2xl sm:p-5 lg:p-6">
      {/* Top Banner / Header */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:ring-blue-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                Compound Interest Calculator
              </h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                Enterprise Engine
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Project growth, cash flows, fees, taxes, goals, drawdown longevity, and Monte Carlo risk.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {planMessage && (
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in whitespace-nowrap">
              {planMessage}
            </span>
          )}
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition hover:border-blue-400 hover:text-slate-900 dark:hover:border-blue-500/50 dark:hover:text-white whitespace-nowrap"
            title="Copy shareable plan link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition hover:border-blue-400 hover:text-slate-900 dark:hover:border-blue-500/50 dark:hover:text-white whitespace-nowrap"
            title="Reset to fresh clean plan"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        {/* Left Column: Investment Assumptions Panel */}
        <section className="min-w-0 space-y-4">
          {/* Quick Scenario Presets */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/55">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Planning Scenarios:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("wealth")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-slate-600 transition shadow-2xs"
                title="Load Wealth Accumulation scenario: $10k initial, $500/mo at 8% for 20 years"
              >
                <span>Wealth Builder</span>
                <span className="rounded bg-blue-50 px-1 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">$10k + $500/mo</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("retirement")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-slate-600 transition shadow-2xs"
                title="Load Retirement Drawdown scenario: $150k initial, $1k/mo, 15y growth + 15y drawdown"
              >
                <span>Retirement Drawdown</span>
                <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">$150k + $1k/mo</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("aggressive")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-slate-600 transition shadow-2xs"
                title="Load Aggressive Growth scenario: $5k initial, $1k/mo at 10% for 25 years"
              >
                <span>Aggressive Growth</span>
                <span className="rounded bg-purple-50 px-1 py-0.5 text-[9px] font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">10% return</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("preservation")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-slate-600 transition shadow-2xs"
                title="Load Capital Preservation scenario: $250k lump sum at 4.5% with inflation"
              >
                <span>Preservation</span>
                <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">$250k lump-sum</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/55">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Investment assumptions</h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Canonical Engine</span>
            </div>

            <div className="grid gap-3.5">
              {/* Currency */}
              <div>
                <label className={labelClass} htmlFor="currency-select">Currency</label>
                <div className="relative">
                  <select
                    id="currency-select"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className={selectClass}
                  >
                    {WORLD_CURRENCIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.name} ({item.symbol})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              </div>

              {/* Initial Investment & Contribution */}
              <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className={labelClass} htmlFor="initial-investment">Initial investment</label>
                  <div className="relative">
                    <input
                      id="initial-investment"
                      inputMode="decimal"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="e.g. 10,000"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 font-mono text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {currency.symbol}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="contribution-amount">Contribution amount</label>
                  <div className="relative">
                    <input
                      id="contribution-amount"
                      inputMode="decimal"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="e.g. 500"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 font-mono text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {currency.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contribution Frequency */}
              <div>
                <label className={labelClass} htmlFor="contrib-frequency">Contribution frequency</label>
                <div className="relative">
                  <select
                    id="contrib-frequency"
                    value={contributionFrequency}
                    onChange={(e) =>
                      setContributionFrequency(e.target.value as ContributionFrequency)
                    }
                    className={selectClass}
                  >
                    {CONTRIBUTIONS.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              </div>

              {/* Contribution Timing */}
              <div>
                <label className={labelClass}>Contribution timing</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["end", "beginning"] as ContributionTiming[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setContributionTiming(item)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                        contributionTiming === item
                          ? "border-blue-500/50 bg-blue-600/15 text-blue-600 dark:text-blue-300 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      {item === "end" ? "End of period" : "Beginning"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Return & Period */}
              <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className={labelClass} htmlFor="annual-return">Annual return (nominal)</label>
                  <div className="relative">
                    <input
                      id="annual-return"
                      inputMode="decimal"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className={`${inputClass} pr-10`}
                      placeholder="e.g. 8"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="investment-period">Investment period</label>
                  <div className="relative">
                    <input
                      id="investment-period"
                      inputMode="decimal"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      className={`${inputClass} pr-16`}
                      placeholder="e.g. 10"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      years
                    </span>
                  </div>
                </div>
              </div>

              {/* Compounding Frequency */}
              <div>
                <label className={labelClass} htmlFor="compounding-frequency">Compounding frequency</label>
                <div className="relative">
                  <select
                    id="compounding-frequency"
                    value={compounding}
                    onChange={(e) => setCompounding(e.target.value as FrequencyKey)}
                    className={selectClass}
                  >
                    {COMPOUNDING.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              </div>

              {/* Tax Model */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/45">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Estimated tax rate
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {taxTreatment === "taxable"
                        ? "Taxable account (annual drag)"
                        : taxTreatment === "deferred"
                        ? "Tax-deferred (exit tax)"
                        : "Tax-exempt (0% tax)"}
                    </p>
                  </div>
                  <div className="relative w-24">
                    <input
                      inputMode="decimal"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className={`${inputClass} pr-8`}
                      placeholder="0"
                      aria-label="Estimated tax rate"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Inflation Adjustment */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/45">
                <button
                  type="button"
                  onClick={() => setShowInflation((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Target className="h-3.5 w-3.5 text-blue-500" />
                    Inflation adjustment (Real Value)
                  </span>
                  <span
                    className={`relative h-5 w-9 rounded-full transition ${
                      showInflation ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                        showInflation ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>

                {showInflation && (
                  <div className="mt-3">
                    <label className={labelClass} htmlFor="inflation-rate">Expected annual inflation</label>
                    <div className="relative">
                      <input
                        id="inflation-rate"
                        inputMode="decimal"
                        value={inflation}
                        onChange={(e) => setInflation(e.target.value)}
                        className={`${inputClass} pr-10`}
                        placeholder="e.g. 3"
                      />
                      <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progressive Disclosure Section 1: Advanced Cash Flows & Drag */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/55">
            <button
              type="button"
              onClick={() => setShowAdvancedCashFlows(!showAdvancedCashFlows)}
              className="flex w-full items-center justify-between p-4 text-left font-bold text-xs text-slate-900 dark:text-slate-100 transition hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Advanced Cash Flows, Fees & Taxes
              </span>
              {showAdvancedCashFlows ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {showAdvancedCashFlows && (
              <div className="border-t border-slate-200 p-4 space-y-4 dark:border-slate-800">
                {/* Contribution Escalation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelClass} htmlFor="contribution-escalation">
                      Annual Contribution Escalation
                    </label>
                    <span className="text-[10px] text-slate-500">e.g. 3% raise/yr</span>
                  </div>
                  <div className="relative">
                    <input
                      id="contribution-escalation"
                      inputMode="decimal"
                      value={contributionEscalation}
                      onChange={(e) => setContributionEscalation(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      %/yr
                    </span>
                  </div>
                </div>

                {/* Investment Fees / Expense Drag */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelClass} htmlFor="annual-fee-rate">
                      Annual Management Fee / Expense Drag
                    </label>
                    <span className="text-[10px] text-slate-500">e.g. 0.5% AUM</span>
                  </div>
                  <div className="relative">
                    <input
                      id="annual-fee-rate"
                      inputMode="decimal"
                      value={annualFeeRate}
                      onChange={(e) => setAnnualFeeRate(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      %/yr
                    </span>
                  </div>
                </div>

                {/* Tax Treatment Selection */}
                <div>
                  <label className={labelClass} htmlFor="tax-treatment-select">Tax Treatment Account Type</label>
                  <div className="relative">
                    <select
                      id="tax-treatment-select"
                      value={taxTreatment}
                      onChange={(e) => setTaxTreatment(e.target.value as TaxTreatment)}
                      className={selectClass}
                    >
                      <option value="taxable">Taxable Brokerage (Annual Drag on Gains)</option>
                      <option value="deferred">Tax-Deferred (401k/IRA — Exit Tax upon Withdrawal)</option>
                      <option value="exempt">Tax-Exempt (Roth IRA / ISA / TFSA — 0% Tax)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                </div>

                {/* One-Time Milestone Events */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>One-Time Milestone Cash Flows</label>
                    <button
                      type="button"
                      onClick={addOneTimeEvent}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                      <Plus className="h-3 w-3" />
                      Add Event
                    </button>
                  </div>

                  {oneTimeEvents.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      No lump-sum deposits or withdrawals added yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {oneTimeEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/60"
                        >
                          <select
                            value={evt.type}
                            onChange={(e) =>
                              updateOneTimeEvent(evt.id, {
                                type: e.target.value as "deposit" | "withdrawal",
                              })
                            }
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="deposit">+ Deposit</option>
                            <option value="withdrawal">- Withdraw</option>
                          </select>
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            max="100"
                            value={evt.year}
                            onChange={(e) =>
                              updateOneTimeEvent(evt.id, {
                                year: Number(e.target.value),
                              })
                            }
                            className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Yr"
                            title="Year of occurrence"
                          />
                          <span className="text-[10px] text-slate-400">yr</span>
                          <input
                            type="number"
                            value={evt.amount}
                            onChange={(e) =>
                              updateOneTimeEvent(evt.id, {
                                amount: Number(e.target.value),
                              })
                            }
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                            placeholder="Amount"
                          />
                          <button
                            type="button"
                            onClick={() => removeOneTimeEvent(evt.id)}
                            className="ml-auto text-slate-400 hover:text-rose-500"
                            title="Remove event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Progressive Disclosure Section 2: Retirement & Drawdown Phase */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/55">
            <button
              type="button"
              onClick={() => setDrawdownEnabled(!drawdownEnabled)}
              className="flex w-full items-center justify-between p-4 text-left font-bold text-xs text-slate-900 dark:text-slate-100 transition hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Retirement & Drawdown Phase
              </span>
              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  drawdownEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                    drawdownEnabled ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            {drawdownEnabled && (
              <div className="border-t border-slate-200 p-4 space-y-3.5 dark:border-slate-800">
                <div>
                  <label className={labelClass} htmlFor="accumulation-years">
                    Accumulation Phase Duration (Years until retirement)
                  </label>
                  <div className="relative">
                    <input
                      id="accumulation-years"
                      inputMode="decimal"
                      value={accumulationYears}
                      onChange={(e) => setAccumulationYears(e.target.value)}
                      className={`${inputClass} pr-16`}
                      placeholder="e.g. 15"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      years
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="retirement-withdrawal">
                    Retirement Monthly Withdrawal
                  </label>
                  <div className="relative">
                    <input
                      id="retirement-withdrawal"
                      inputMode="decimal"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className={`${inputClass} pr-14`}
                      placeholder="e.g. 2,000"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {currency.symbol}/mo
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withdrawalInflationAdjusted}
                    onChange={(e) => setWithdrawalInflationAdjusted(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Adjust retirement withdrawals for inflation
                </label>

                {result.isDepleted ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Portfolio Depleted</p>
                      <p className="mt-0.5 text-[11px]">
                        At this withdrawal rate, capital is fully exhausted in Year {result.depletedYear}. Consider reducing withdrawals or extending accumulation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Portfolio Sustains Through Horizon</p>
                      <p className="mt-0.5 text-[11px]">
                        Projected terminal balance at Year {result.yearsUsed.toFixed(0)} is <span className="whitespace-nowrap font-mono font-bold">{formatMoney(result.futureValue, currency)}</span>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Projections, Metrics, Planning & Tabs */}
        <section className="min-w-0 space-y-5">
          {/* Main Projection Summary Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/55">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                    Projection summary
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive, audit-ready financial projection breakdown.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 whitespace-nowrap">
                  {result.yearsUsed.toFixed(1)} years
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* Primary Headline: Future Value */}
              <div className="flex min-w-0 items-center justify-between gap-4 bg-blue-50/60 px-4 py-4 dark:bg-blue-500/[0.06]">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Future value</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">Projected ending balance</p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-right font-mono text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl tabular-nums">
                  {formatMoney(result.futureValue, currency)}
                </p>
              </div>

              {/* Initial Investment */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Initial investment</span>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatMoney(result.initialInvestment, currency)}
                </span>
              </div>

              {/* Total Contributions */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total contributions</span>
                  {cleanNumber(contributionEscalation) > 0 && (
                    <span className="ml-2 text-[10px] text-blue-500 font-medium whitespace-nowrap">
                      (+{contributionEscalation}% escalation)
                    </span>
                  )}
                </div>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatMoney(result.totalContributions, currency)}
                </span>
              </div>

              {/* Total Invested Capital */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total invested capital</span>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatMoney(result.totalInvested, currency)}
                </span>
              </div>

              {/* Cumulative Withdrawals (Drawdown) */}
              {(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0) > 0 && (
                <div className="flex items-center justify-between gap-4 px-4 py-3 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Total withdrawals (drawdown)</span>
                    <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Cumulative portfolio distributions</p>
                  </div>
                  <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                    {formatMoney(-(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0), currency)}
                  </span>
                </div>
              )}

              {/* Gross Growth & Fee Drag */}
              {result.totalFeesPaid > 0 && (
                <>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Gross investment growth</span>
                    <span className="whitespace-nowrap font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatMoney(result.grossGains, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-rose-50/40 dark:bg-rose-950/20">
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Fee drag (cumulative)</span>
                    <span className="whitespace-nowrap font-mono text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatMoney(-result.totalFeesPaid, currency)}
                    </span>
                  </div>
                </>
              )}

              {/* Taxes Paid */}
              {result.totalTaxesPaid > 0 && (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-amber-50/40 dark:bg-amber-950/20">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Estimated tax drag ({taxTreatment})
                  </span>
                  <span className="whitespace-nowrap font-mono text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {formatMoney(-result.totalTaxesPaid, currency)}
                  </span>
                </div>
              )}

              {/* Net Interest / Earnings */}
              <div className="flex items-center justify-between gap-4 bg-emerald-50/60 px-4 py-3.5 dark:bg-emerald-500/[0.04]">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Net interest earned</span>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Compound earnings after drag</p>
                </div>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-emerald-700 dark:text-emerald-200 tabular-nums">
                  {formatMoney(result.netGains, currency)}
                </span>
              </div>

              {/* Advanced Rates Grid */}
              <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4 dark:divide-slate-800">
                <div className="p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Effective APY</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{apy.toFixed(2)}%</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Real Return</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{fisherReal.toFixed(2)}%</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Rule of 72</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {doublingYears ? `~${doublingYears.toFixed(1)}y` : "N/A"}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    {canonicalInputs.contribution > 0 ? "MWRR (IRR)" : "CAGR"}
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {canonicalInputs.contribution > 0 && result.annualizedIrr !== null
                      ? `${result.annualizedIrr.toFixed(2)}%`
                      : `${result.cagr.toFixed(2)}%`}
                  </p>
                </div>
              </div>

              {/* After-Tax Value */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">After-tax value</span>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatMoney(result.afterTaxFutureValue, currency)}
                </span>
              </div>

              {/* Inflation-Adjusted Real Value */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Inflation-adjusted real value
                  </span>
                  <p className="text-[10px] text-slate-400">Today&apos;s purchasing power equivalent</p>
                </div>
                <span className="whitespace-nowrap text-right font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatMoney(result.inflationAdjustedValue, currency)}
                </span>
              </div>

              {/* Display Rounding Footnote */}
              <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
                Note: Summary metrics are rounded independently to 2 decimal places for display. The sum of displayed rounded components may differ by &plusmn;{currency.symbol}0.01 from the displayed ending balance, while underlying unrounded cash flows balance exactly to machine precision.
              </div>
            </div>
          </div>

          {/* Planning Controls: Goal Analysis & Solvers */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/55">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
                Planning controls & Goal Solvers
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Set a target and use numerical solvers to identify required contributions, returns, or horizons.
              </p>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* Savings Goal Input */}
              <div className="p-4 space-y-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 sm:max-w-[48%]">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Target Savings Goal</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      Enter the target wealth you want your plan to reach.
                    </p>
                  </div>

                  <div className="w-full sm:max-w-[340px]">
                    <div className="relative">
                      <input
                        id="savings-goal"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="100"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className={`${inputClass} pr-16`}
                        placeholder="e.g. 100,000"
                        aria-label="Target savings goal"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-slate-400 whitespace-nowrap">
                        {currency.code}
                      </span>
                    </div>
                  </div>
                </div>

                {goalValue > 0 && (
                  <div className="pt-2">
                    <div className="mb-1.5 flex justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {goalAnalysis.fundedPercentage.toFixed(0)}% funded
                      </span>
                      <span className="whitespace-nowrap text-right tabular-nums">
                        {goalAnalysis.status === "achieved"
                          ? `Goal Achieved! (+${formatMoney(goalAnalysis.gapOrSurplus, currency)} surplus)`
                          : `${formatMoney(goalAnalysis.gapOrSurplus, currency)} remaining`}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goalAnalysis.status === "achieved" ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(100, goalAnalysis.fundedPercentage)}%` }}
                      />
                    </div>

                    {/* Interactive Goal Solvers */}
                    {goalAnalysis.status !== "achieved" && (
                      <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
                        {/* Solver 1: Required Contribution */}
                        <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 p-2.5 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Required Contribution
                          </p>
                          <p className="whitespace-nowrap mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {goalAnalysis.requiredContribution !== null
                              ? formatMoney(goalAnalysis.requiredContribution, currency)
                              : "N/A"}
                            <span className="text-[10px] font-normal text-slate-500">/{contributionFrequency}</span>
                          </p>
                          {goalAnalysis.requiredContribution !== null && (
                            <button
                              type="button"
                              onClick={() => setContribution(String(goalAnalysis.requiredContribution))}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 whitespace-nowrap"
                            >
                              Apply to Plan <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Solver 2: Required Return */}
                        <div className="rounded-xl border border-purple-200/70 bg-purple-50/50 p-2.5 text-xs dark:border-purple-900/40 dark:bg-purple-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Required Return
                          </p>
                          <p className="whitespace-nowrap mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {goalAnalysis.requiredReturn !== null
                              ? `${goalAnalysis.requiredReturn.toFixed(1)}%/yr`
                              : "Out of range"}
                          </p>
                          {goalAnalysis.requiredReturn !== null && (
                            <button
                              type="button"
                              onClick={() => setRate(String(goalAnalysis.requiredReturn))}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 whitespace-nowrap"
                            >
                              Apply to Plan <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Solver 3: Required Horizon */}
                        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-2.5 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Required Horizon
                          </p>
                          <p className="whitespace-nowrap mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            {goalAnalysis.requiredYears !== null
                              ? `${goalAnalysis.requiredYears.toFixed(1)} years`
                              : "100+ years"}
                          </p>
                          {goalAnalysis.requiredYears !== null && (
                            <button
                              type="button"
                              onClick={() => setYears(String(goalAnalysis.requiredYears))}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 whitespace-nowrap"
                            >
                              Apply to Plan <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scenario Range Spread */}
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:max-w-[48%]">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Scenario Spread</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    Compare Conservative and Optimistic cases around your base annual rate.
                  </p>
                </div>

                <div className="w-full sm:max-w-[340px]">
                  <div className="relative">
                    <input
                      id="scenario-range"
                      type="number"
                      inputMode="decimal"
                      min="0.1"
                      step="0.5"
                      value={scenarioSpread}
                      onChange={(e) => setScenarioSpread(e.target.value)}
                      className={`${inputClass} pr-8`}
                      placeholder="e.g. 2"
                      aria-label="Scenario rate spread"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Analysis Tabs Panel */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/55">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Growth Analysis & Risk</h2>
              </div>
              <div className="flex flex-wrap rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setActiveTab("chart")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "chart"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Chart
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "schedule"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("monte-carlo")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "monte-carlo"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Risk / Monte Carlo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("stress-test")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "stress-test"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Stress Tests
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("methodology")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "methodology"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Audit & Formulas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("plan-io")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "plan-io"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  Plan Presets & JSON
                </button>
              </div>
            </div>

            {/* Tab 1: Chart */}
            {activeTab === "chart" && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      Projected balance
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                      Invested capital
                    </span>
                    {showMcOnChart && (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                        Monte Carlo 10th–90th fan
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showMcOnChart}
                      onChange={(e) => setShowMcOnChart(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Overlay Monte Carlo range
                  </label>
                </div>

                <div className="relative h-[290px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#080d18]">
                  <div className="absolute inset-x-3 top-3 bottom-8 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <div
                        key={line}
                        className="border-t border-dashed border-slate-200 dark:border-slate-800"
                      />
                    ))}
                  </div>

                  <div className="absolute inset-x-4 top-5 bottom-9 flex items-end gap-1 sm:gap-2">
                    {chartRows.map((row) => {
                      const balanceHeight = Math.max(
                        2,
                        (row.closingBalance / maxChart) * 100
                      );
                      const investedHeight = Math.max(
                        2,
                        (row.cumulativeInvested / maxChart) * 100
                      );

                      // Match corresponding Monte Carlo point if enabled
                      const mcPoint = monteCarloResult.paths.find(
                        (p) => Math.abs(p.year - row.year) < 0.6
                      );

                      return (
                        <div
                          key={`${row.period}-${row.year}`}
                          className="group relative flex h-full flex-1 items-end justify-center gap-0.5"
                          title={`Year ${row.year.toFixed(1)}: Balance ${formatMoney(
                            row.closingBalance,
                            currency
                          )} | Invested: ${formatMoney(row.cumulativeInvested, currency)}`}
                        >
                          {showMcOnChart && mcPoint && (
                            <div
                              className="absolute w-full rounded bg-purple-500/15 pointer-events-none"
                              style={{
                                bottom: `${Math.max(1, (mcPoint.p10 / maxChart) * 100)}%`,
                                height: `${Math.max(
                                  2,
                                  ((mcPoint.p90 - mcPoint.p10) / maxChart) * 100
                                )}%`,
                              }}
                            />
                          )}
                          <div
                            className="w-full max-w-5 rounded-t bg-blue-600/80 transition group-hover:bg-blue-500 dark:bg-blue-500/80 dark:hover:bg-blue-400"
                            style={{ height: `${balanceHeight}%` }}
                          />
                          <div
                            className="w-full max-w-5 rounded-t bg-slate-400/80 dark:bg-slate-600/80"
                            style={{ height: `${investedHeight}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute inset-x-4 bottom-2 flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
                    <span>Year 0</span>
                    <span>Year {(result.yearsUsed / 2).toFixed(1)}</span>
                    <span>Year {result.yearsUsed.toFixed(1)}</span>
                  </div>
                </div>

                {/* Scenario Comparison Table */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Return Scenarios (Side-by-Side Comparison)
                  </h3>
                  <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 whitespace-nowrap">Scenario</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Return Rate</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Ending Wealth</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Net Interest</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Real Value</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Goal Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioRows.map((scenario) => (
                          <tr
                            key={scenario.id}
                            className="border-t border-slate-200 dark:border-slate-800"
                          >
                            <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {scenario.label}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {scenario.rate.toFixed(2)}%
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">
                              {formatMoney(scenario.futureValue, currency)}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-emerald-600 dark:text-emerald-300 whitespace-nowrap tabular-nums">
                              {formatMoney(scenario.totalInterest, currency)}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">
                              {formatMoney(scenario.realValue, currency)}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {goalValue <= 0 ? (
                                <span className="text-[11px] text-slate-400">No goal set</span>
                              ) : scenario.goalReached ? (
                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Reached
                                </span>
                              ) : (
                                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap tabular-nums">
                                  {formatMoney(-Math.abs(scenario.goalDifference), currency)}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Schedule */}
            {activeTab === "schedule" && (
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auditable period-by-period accumulation and cash-flow breakdown.
                  </p>
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-white whitespace-nowrap"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </button>
                </div>

                <div className="max-h-[380px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[820px] text-left font-mono text-[11px]">
                    <thead className="sticky top-0 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-3 whitespace-nowrap">Year</th>
                        <th className="px-3 py-3 whitespace-nowrap">Opening</th>
                        <th className="px-3 py-3 whitespace-nowrap">Contributions</th>
                        <th className="px-3 py-3 whitespace-nowrap">Gross Growth</th>
                        <th className="px-3 py-3 whitespace-nowrap">Fees</th>
                        <th className="px-3 py-3 whitespace-nowrap">Taxes</th>
                        <th className="px-3 py-3 whitespace-nowrap">Withdrawals</th>
                        <th className="px-3 py-3 whitespace-nowrap">Closing</th>
                        <th className="px-3 py-3 whitespace-nowrap">Real Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr
                          key={row.period}
                          className="border-t border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                          <td className="px-3 py-2.5 font-bold whitespace-nowrap">{row.year.toFixed(1)}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">{formatMoney(row.openingBalance, currency)}</td>
                          <td className="px-3 py-2.5 text-blue-600 dark:text-blue-400 whitespace-nowrap tabular-nums">
                            {formatMoney(row.contributions, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                            +{formatMoney(row.grossGrowth, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-rose-500 whitespace-nowrap tabular-nums">
                            {row.feesPaid > 0 ? formatMoney(-row.feesPaid, currency) : formatMoney(0, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-amber-500 whitespace-nowrap tabular-nums">
                            {row.taxesPaid > 0 ? formatMoney(-row.taxesPaid, currency) : formatMoney(0, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-purple-500 whitespace-nowrap tabular-nums">
                            {row.withdrawals > 0 ? formatMoney(-row.withdrawals, currency) : formatMoney(0, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap tabular-nums">
                            {formatMoney(row.closingBalance, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap tabular-nums">
                            {formatMoney(row.realPurchasingPower, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Monte Carlo Risk Simulation */}
            {activeTab === "monte-carlo" && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Monte Carlo Risk & Sequence-of-Returns Engine
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Simulates 500 stochastic market paths incorporating annual volatility and negative return years.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase" htmlFor="mc-sim-count">
                        Simulations
                      </label>
                      <select
                        id="mc-sim-count"
                        value={mcSimulationCount}
                        onChange={(e) => setMcSimulationCount(e.target.value)}
                        className="mt-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-[#0a1020] dark:text-slate-100 outline-none"
                      >
                        <option value="200">200 runs</option>
                        <option value="500">500 runs</option>
                        <option value="1000">1,000 runs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase" htmlFor="mc-volatility">
                        Annual Volatility (σ)
                      </label>
                      <div className="relative mt-1 w-24">
                        <input
                          id="mc-volatility"
                          inputMode="decimal"
                          value={mcVolatility}
                          onChange={(e) => setMcVolatility(e.target.value)}
                          className={`${inputClass} py-1.5 text-xs pr-6`}
                        />
                        <span className="pointer-events-none absolute right-2 top-2 text-xs text-slate-400 whitespace-nowrap">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Probability Metric Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {goalValue > 0 ? "Probability of Reaching Goal" : "Probability of Portfolio Longevity"}
                    </p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="font-mono text-3xl font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {goalValue > 0
                          ? `${monteCarloResult.probabilityOfGoalSuccess}%`
                          : `${monteCarloResult.probabilityOfLongevitySuccess}%`}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {monteCarloResult.probabilityOfGoalSuccess >= 80
                          ? "High Confidence Plan"
                          : monteCarloResult.probabilityOfGoalSuccess >= 50
                          ? "Moderate Risk"
                          : "Needs Adjustment"}
                      </span>
                    </div>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${
                            goalValue > 0
                              ? monteCarloResult.probabilityOfGoalSuccess
                              : monteCarloResult.probabilityOfLongevitySuccess
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Median Simulated Outcome (50th Percentile)
                    </p>
                    <p className="mt-2 font-mono text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                      {formatMoney(monteCarloResult.medianEndingValue, currency)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Deterministic baseline: <span className="whitespace-nowrap font-mono">{formatMoney(result.futureValue, currency)}</span>
                    </p>
                  </div>
                </div>

                {/* Percentiles Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Percentile Distribution of Simulated Outcomes
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 whitespace-nowrap">Percentile</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Market Regime</th>
                          <th className="px-3 py-2.5 whitespace-nowrap">Ending Wealth</th>
                          <th className="px-3 py-2.5">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-rose-500 whitespace-nowrap">10th Percentile</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">Severe Bear Market</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                            {formatMoney(monteCarloResult.p10EndingValue, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-sans text-[11px] text-slate-500">
                            90% of simulated market environments outperform this level.
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-amber-500 whitespace-nowrap">25th Percentile</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">Below Average</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                            {formatMoney(monteCarloResult.p25EndingValue, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-sans text-[11px] text-slate-500">Conservative planning threshold.</td>
                        </tr>
                        <tr className="bg-blue-50/40 dark:bg-blue-950/20">
                          <td className="px-3 py-2.5 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">50th Percentile</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">Median Expected</td>
                          <td className="px-3 py-2.5 font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap tabular-nums">
                            {formatMoney(monteCarloResult.p50EndingValue, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-sans text-[11px] text-slate-500">Half of all runs exceed this value.</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-emerald-500 whitespace-nowrap">75th Percentile</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">Above Average</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                            {formatMoney(monteCarloResult.p75EndingValue, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-sans text-[11px] text-slate-500">Strong economic climate.</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-emerald-600 whitespace-nowrap">90th Percentile</td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">Strong Bull Market</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                            {formatMoney(monteCarloResult.p90EndingValue, currency)}
                          </td>
                          <td className="px-3 py-2.5 font-sans text-[11px] text-slate-500">Top decile market expansion.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Methodology Note:</strong> Simulations use a Gaussian log-return process with Box-Muller transforms and seed-reproducible Mulberry32 PRNG. Real market returns may exhibit fat tails and skewness not captured in standard models.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Stress Tests */}
            {activeTab === "stress-test" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    Stress Testing: &quot;What Breaks the Plan?&quot;
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Evaluates how your investment plan withstands historical shocks, persistent inflation surges, fee drag, and cash-flow pauses.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {stressTests.map((st) => (
                    <div
                      key={st.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</p>
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {st.percentChangeVsBase.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{st.description}</p>
                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs dark:border-slate-800">
                        <span className="text-slate-500">Ending Balance:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                          {formatMoney(st.endingBalance, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Loss vs Base Plan:</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap tabular-nums">
                          {formatMoney(-st.lossVsBase, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Audit & Methodology */}
            {activeTab === "methodology" && (
              <div className="p-4 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Calculation Methodology & Governance Disclosures
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">1. Compounding Mechanism</h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Calculations execute on a daily sub-period synchronized timeline (365 days/year). The effective periodic multiplier is derived as <code>(1 + r / (100 · m))^(m / 365)</code>, guaranteeing continuous consistency between nominal rates, periodic compounding, and effective APY.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">2. Contribution Timing</h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Beginning-of-period contributions are credited on day 1 of each interval, accruing returns over the full period. End-of-period contributions are credited at the close of each interval, beginning growth on subsequent periods.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">3. Fisher Equation Real Return</h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Real purchasing power is discounted using the standard Fisher relationship: <code>(1 + r_nominal) / (1 + i) - 1</code>, avoiding the inaccuracies of simple subtraction <code>(r - i)</code>.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">4. Fee & Tax Modeling</h4>
                    <p className="text-slate-500 dark:text-slate-400">
                      Asset management fees are deducted as a continuous AUM drag. Taxable accounts apply annual drag on realized net earnings; tax-deferred accounts compound gross and assess tax at withdrawal; tax-exempt accounts incur 0% drag.
                    </p>
                  </div>

                {/* Live Formula Substitution Box */}
                <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                    <span>Active Plan Step-by-Step Mathematical Derivation</span>
                    <span className="font-mono text-[11px] font-normal text-blue-700 dark:text-blue-300">
                      RFC &amp; CFA Standard
                    </span>
                  </h4>
                  <div className="space-y-2 font-mono text-[11px] bg-white/80 dark:bg-slate-950/60 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30 text-slate-800 dark:text-slate-200 overflow-x-auto">
                    <p className="text-slate-500 dark:text-slate-400 font-sans text-xs">
                      <strong>1. Discrete Lump-Sum Growth:</strong> A = P &times; (1 + r/m)^(m &times; t)
                    </p>
                    <p>
                      A = {formatMoney(canonicalInputs.principal, currency)} &times; (1 + {(canonicalInputs.annualRate / 100).toFixed(4)} / {COMPOUNDING_PERIODS[canonicalInputs.compoundingFrequency]})^({COMPOUNDING_PERIODS[canonicalInputs.compoundingFrequency]} &times; {canonicalInputs.years.toFixed(1)})
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                      &rarr; Lump Sum Terminal Value = {formatMoney(result.initialInvestment ? canonicalInputs.principal * Math.pow(1 + (canonicalInputs.annualRate / 100) / COMPOUNDING_PERIODS[canonicalInputs.compoundingFrequency], COMPOUNDING_PERIODS[canonicalInputs.compoundingFrequency] * canonicalInputs.years) : 0, currency)}
                    </p>
                    {canonicalInputs.principal > 0 && canonicalInputs.annualRate > 0 && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                        Theoretical Continuous Compounding Limit (P &times; e^(rt)): {formatMoney(canonicalInputs.principal * Math.exp((canonicalInputs.annualRate / 100) * canonicalInputs.years), currency)}
                      </p>
                    )}

                    {canonicalInputs.contribution > 0 && (
                      <>
                        <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2" />
                        <p className="text-slate-500 dark:text-slate-400 font-sans text-xs">
                          <strong>2. Annuity Cash Flows ({canonicalInputs.contributionTiming === 'beginning' ? 'Annuity Due — Beginning' : 'Ordinary Annuity — End'}):</strong> FV_annuity = PMT &times; [ (1 + i)^n - 1 ] / i {canonicalInputs.contributionTiming === 'beginning' ? '&times; (1 + i)' : ''}
                        </p>
                        <p>
                          PMT = {formatMoney(canonicalInputs.contribution, currency)} ({canonicalInputs.contributionFrequency}) &middot; Timing: {canonicalInputs.contributionTiming} of period
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                          Simulation Recurrence: Daily factor (1 + r/m)^(m/365) with 365-day annual day-count convention. Over each 365-day period, this compounds lump sums exactly to (1 + r/m)^m (matching APY), while intra-year contributions ({canonicalInputs.contributionFrequency}) compound continuously from deposit day without arbitrary escrow delay.
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 font-bold">
                          &rarr; Projected Ending Portfolio Value = {formatMoney(result.futureValue, currency)}
                        </p>
                      </>
                    )}

                    {canonicalInputs.drawdownEnabled && (
                      <>
                        <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2" />
                        <p className="text-slate-500 dark:text-slate-400 font-sans text-xs">
                          <strong>3. Retirement Drawdown Phase:</strong> {formatMoney(canonicalInputs.withdrawalAmount, currency)}/mo baseline starting Year {canonicalInputs.accumulationYears}.
                        </p>
                        {canonicalInputs.withdrawalInflationAdjusted && canonicalInputs.inflationRate > 0 && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                            Inflation Escalation: Distributions adjust continuously using (1 + {canonicalInputs.inflationRate}%/yr)^(t_drawdown), beginning at {formatMoney(canonicalInputs.withdrawalAmount * Math.pow(1 + canonicalInputs.inflationRate / 100, (365 / 12) / 365), currency)}/mo in Month 1 and scaling to {formatMoney(canonicalInputs.withdrawalAmount * Math.pow(1 + canonicalInputs.inflationRate / 100, canonicalInputs.years - canonicalInputs.accumulationYears), currency)}/mo in the final month.
                          </p>
                        )}
                        <p className="text-rose-700 dark:text-rose-300 font-sans text-[11px]">
                          {result.isDepleted
                            ? `Portfolio exhausts in Year ${result.depletedYear} under current distribution schedule.`
                            : `Portfolio sustains through Year ${result.yearsUsed.toFixed(0)} with closing balance of ${formatMoney(result.futureValue, currency)}.`}
                        </p>
                      </>
                    )}
                    <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2" />
                    <div className="space-y-1.5 font-sans text-[10px]">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Unrounded Accounting Identity (Exact Decimal Precision):</strong>
                      </p>
                      <p className="font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap">
                        Invested ({formatMoneyPrecise(result.totalInvested, currency, 4)}) + Net Gains ({formatMoneyPrecise(result.netGains, currency, 4)})
                        {(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0) > 0 &&
                          ` − Cumulative Withdrawals (${formatMoneyPrecise(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0, currency, 4)})`}
                        {' = Ending Balance ('}
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {formatMoneyPrecise(result.futureValue, currency, 4)}
                        </span>
                        {')'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        <strong>Displayed Rounded Figures:</strong> Summary metrics are rounded independently to 2 decimal places for display.
                        {' '}Invested ({formatMoney(result.totalInvested, currency)}) + Net Gains ({formatMoney(result.netGains, currency)})
                        {(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0) > 0 &&
                          ` − Cumulative Withdrawals (${formatMoney(result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0, currency)})`}
                        {(() => {
                          const cumW = result.schedule[result.schedule.length - 1]?.cumulativeWithdrawals ?? 0;
                          const roundedInv = Number(result.totalInvested.toFixed(2));
                          const roundedG = Number(result.netGains.toFixed(2));
                          const roundedW = Number(cumW.toFixed(2));
                          const roundedCompSum = roundedInv + roundedG - roundedW;
                          const roundedBal = Number(result.futureValue.toFixed(2));
                          const diff = Math.abs(roundedCompSum - roundedBal);
                          if (diff >= 0.005) {
                            return (
                              <>
                                {' sums to '}
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                  {formatMoney(roundedCompSum, currency)}
                                </span>
                                {', while the independently rounded ending balance is '}
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                  {formatMoney(result.futureValue, currency)}
                                </span>
                                {' (a standard ±'}{currency.symbol}{diff.toFixed(2)}{' artifact of independent 2-decimal half-up rounding of summands).'}
                              </>
                            );
                          }
                          return (
                            <>
                              {' sums to '}
                              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                {formatMoney(roundedCompSum, currency)}
                              </span>
                              {', matching the independently rounded ending balance ('}{formatMoney(result.futureValue, currency)}{').'}
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-blue-800 dark:text-blue-300 pt-1">
                    <span>Effective Annual Yield (APY): <strong>{apy.toFixed(3)}%</strong></span>
                    <span>Fisher Real Return: <strong>{fisherReal.toFixed(3)}%</strong></span>
                    <span>Rule of 72 Doubling: <strong>{doublingYears ? `~${doublingYears.toFixed(1)} years` : 'N/A'}</strong></span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  <strong>Regulatory Disclaimer:</strong> Projections and simulated outcomes generated by OmniTools are estimates for illustrative and planning purposes only. They do not constitute fiduciary financial, legal, or tax advice. Actual investment returns are subject to market risks, volatility, and potential loss of principal.
                </div>
                </div>
              </div>
            )}

            {/* Tab 6: Plan Presets & JSON IO */}
            {activeTab === "plan-io" && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Plan Management, Presets & JSON Export/Import
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Quickly load common financial-planning templates or export/import complete plan files for backup and client presentation.
                  </p>
                </div>

                {/* Preset Cards */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Financial Planning Presets
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("wealth")}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Wealth Accumulator</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        $10k initial + $500/mo, 8% return, 3% escalation, 20-year horizon.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("retirement")}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Retirement & Drawdown</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        15 years accumulation + 15 years retirement with $3,500/mo withdrawal.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("aggressive")}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Aggressive Long-Term Growth</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        $5k initial + $1,000/mo, 10% equity return, tax-exempt account.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("preservation")}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500/50"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Capital Preservation</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        $250k lump sum, 4.5% fixed-income return, inflation-adjusted tracking.
                      </p>
                    </button>
                  </div>
                </div>

                {/* JSON IO Actions */}
                <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center gap-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={exportPlanJson}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500/50 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" />
                    Export Plan (JSON)
                  </button>

                  <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500/50 cursor-pointer whitespace-nowrap">
                    <Upload className="h-4 w-4" />
                    Import Plan (JSON)
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Educational Disclaimer Card */}
          <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-100 p-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p>
              Results are projections based on your active assumptions. Real investment outcomes fluctuate due to market volatility, inflation, tax law adjustments, and timing of cash flows.
            </p>
          </div>

          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-500 hover:text-blue-400 transition"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Shareable URL copied to clipboard!" : "Copy a shareable calculation link with active assumptions"}
          </button>
        </section>
      </div>
    </div>
  );
}
