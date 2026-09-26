"use client";

import { FormEvent, useState } from "react";

type FormData = {
  age: string;
  job: string;
  marital: string;
  education: string;
  default: string;
  balance: string;
  housing: string;
  loan: string;
  contact: string;
  day_of_week: string;
  month: string;
  campaign: string;
  pdays: string;
  previous: string;
  poutcome: string;
};

type PredictionResult = {
  prediction: number;
  probability?: number;
  threshold?: number;
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const initialForm: FormData = {
  age: "",
  job: "",
  marital: "",
  education: "",
  default: "",
  balance: "",
  housing: "",
  loan: "",
  contact: "",
  day_of_week: "",
  month: "",
  campaign: "",
  pdays: "",
  previous: "",
  poutcome: "",
};

const exampleForm: FormData = {
  age: "35",
  job: "management",
  marital: "married",
  education: "secondary",
  default: "no",
  balance: "1500.50",
  housing: "yes",
  loan: "no",
  contact: "cellular",
  day_of_week: "15",
  month: "may",
  campaign: "1",
  pdays: "-1",
  previous: "0",
  poutcome: "other",
};

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setResult(null);
    setError("");
  }

  function tryExample() {
    setForm(exampleForm);
    setResult(null);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      age: Number(form.age),
      job: form.job || null,
      marital: form.marital || null,
      education: form.education || null,
      default: form.default || null,
      balance: Number(form.balance),
      housing: form.housing || null,
      loan: form.loan || null,
      contact: form.contact || null,
      day_of_week: Number(form.day_of_week),
      month: form.month || null,
      campaign: Number(form.campaign),
      pdays: Number(form.pdays),
      previous: Number(form.previous),
      poutcome: form.poutcome || null,
    };

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.details) {
          const messages = data.details
            .map(
              (item: { field: string; message: string }) =>
                `${item.field}: ${item.message}`
            )
            .join(" • ");

          throw new Error(messages);
        }

        throw new Error(data?.message || "Prediction failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the prediction service."
      );
    } finally {
      setLoading(false);
    }
  }

  const probability =
    result?.probability !== undefined
      ? result.probability <= 1
        ? result.probability * 100
        : result.probability
      : null;

  const isPositive = result?.prediction === 1;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 10h18" />
                <path d="M5 10v8" />
                <path d="M9 10v8" />
                <path d="M15 10v8" />
                <path d="M19 10v8" />
                <path d="M2 18h20" />
                <path d="M12 3l10 5H2l10-5Z" />
              </svg>
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                BankMarketer
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                ML Decision Support
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#predict" className="transition hover:text-blue-800">
              Prediction
            </a>
            <a href="#dataset" className="transition hover:text-blue-800">
              Dataset
            </a>
            <a href="#model" className="transition hover:text-blue-800">
              Model
            </a>
            <a
              href="https://github.com/LochanJangid/bank-marketing"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-800"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              XGBoost Classification System
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Predict customer interest in{" "}
              <span className="text-blue-800">term deposits.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              BankMarketer uses customer, financial and campaign information
              to estimate the likelihood of a customer subscribing to a term
              deposit.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#predict"
                className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Start prediction
              </a>

              <button
                onClick={tryExample}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Try example
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Prediction overview
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Binary classification
                </p>
              </div>

              <div className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                Production API
              </div>
            </div>

            <div className="space-y-4">
              <StatRow label="Customer data" value="15 inputs" />
              <StatRow label="Original features" value="16" />
              <StatRow label="Records" value="45,211" />
              <StatRow label="Model" value="XGBoost" />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs leading-5 text-slate-500">
                The interface excludes call duration because it represents
                information that is not available before the campaign
                interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DATASET */}
      <section id="dataset" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
            Dataset
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            What the model learns from
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            The Bank Marketing dataset contains customer and campaign
            information used to model term-deposit subscription behavior.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard number="45,211" label="Customer records" />
          <InfoCard number="16" label="Original features" />
          <InfoCard number="2" label="Prediction classes" />
          <InfoCard number="XGBoost" label="Classification model" />
        </div>
      </section>

      {/* PREDICTION */}
      <section id="predict" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
              Customer prediction
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Evaluate a customer
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Enter the information available about the customer and campaign.
              The model returns a predicted class and probability.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* CUSTOMER */}
              <FormSection
                title="Customer profile"
                description="Basic demographic information"
              >
                <Input
                  label="Age"
                  value={form.age}
                  onChange={(v) => updateField("age", v)}
                  type="number"
                  required
                />

                <Select
                  label="Job"
                  value={form.job}
                  onChange={(v) => updateField("job", v)}
                  options={[
                    "admin.",
                    "blue-collar",
                    "entrepreneur",
                    "housemaid",
                    "management",
                    "retired",
                    "self-employed",
                    "services",
                    "student",
                    "technician",
                    "unemployed",
                  ]}
                />

                <Select
                  label="Marital status"
                  value={form.marital}
                  onChange={(v) => updateField("marital", v)}
                  options={["married", "single", "divorced"]}
                />

                <Select
                  label="Education"
                  value={form.education}
                  onChange={(v) => updateField("education", v)}
                  options={["primary", "secondary", "tertiary"]}
                />
              </FormSection>

              {/* FINANCIAL */}
              <FormSection
                title="Financial profile"
                description="Customer financial information"
              >
                <Input
                  label="Account balance"
                  value={form.balance}
                  onChange={(v) => updateField("balance", v)}
                  type="number"
                  step="0.01"
                  required
                />

                <Select
                  label="Credit default"
                  value={form.default}
                  onChange={(v) => updateField("default", v)}
                  options={["no", "yes"]}
                />

                <Select
                  label="Housing loan"
                  value={form.housing}
                  onChange={(v) => updateField("housing", v)}
                  options={["no", "yes"]}
                />

                <Select
                  label="Personal loan"
                  value={form.loan}
                  onChange={(v) => updateField("loan", v)}
                  options={["no", "yes"]}
                />
              </FormSection>

              {/* CAMPAIGN */}
              <FormSection
                title="Campaign information"
                description="Current campaign contact details"
              >
                <Select
                  label="Contact type"
                  value={form.contact}
                  onChange={(v) => updateField("contact", v)}
                  options={["cellular", "telephone"]}
                />

                <Input
                  label="Day"
                  value={form.day_of_week}
                  onChange={(v) => updateField("day_of_week", v)}
                  type="number"
                  min="1"
                  max="31"
                  required
                />

                <Select
                  label="Month"
                  value={form.month}
                  onChange={(v) => updateField("month", v)}
                  options={[
                    "jan",
                    "feb",
                    "mar",
                    "apr",
                    "may",
                    "jun",
                    "jul",
                    "aug",
                    "sep",
                    "oct",
                    "nov",
                    "dec",
                  ]}
                />

                <Input
                  label="Campaign contacts"
                  value={form.campaign}
                  onChange={(v) => updateField("campaign", v)}
                  type="number"
                  min="1"
                  required
                />
              </FormSection>

              {/* HISTORY */}
              <FormSection
                title="Previous campaign"
                description="Historical campaign information"
              >
                <Input
                  label="Days since previous contact"
                  value={form.pdays}
                  onChange={(v) => updateField("pdays", v)}
                  type="number"
                  min="-1"
                  required
                />

                <Input
                  label="Previous contacts"
                  value={form.previous}
                  onChange={(v) => updateField("previous", v)}
                  type="number"
                  min="0"
                  required
                />

                <Select
                  label="Previous outcome"
                  value={form.poutcome}
                  onChange={(v) => updateField("poutcome", v)}
                  options={["failure", "other", "success"]}
                />
              </FormSection>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Prediction error</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Running model..." : "Predict subscription"}
              </button>

              <button
                type="button"
                onClick={tryExample}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fill example
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Reset
              </button>
            </div>
          </form>

          {/* RESULT */}
          {result && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <div
                className={`p-8 ${
                  isPositive ? "bg-emerald-50" : "bg-slate-50"
                }`}
              >
                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                      Prediction result
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-950">
                      {isPositive
                        ? "Likely to subscribe"
                        : "Unlikely to subscribe"}
                    </h3>

                    <p className="mt-2 max-w-xl text-slate-600">
                      {result.message ||
                        "The prediction is based on the customer and campaign information provided."}
                    </p>
                  </div>

                  {probability !== null && (
                    <div className="min-w-[180px] rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Probability
                      </p>

                      <p className="mt-2 text-4xl font-bold text-blue-900">
                        {probability.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                {probability !== null && (
                  <div className="mt-8">
                    <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                      <span>Subscription likelihood</span>
                      <span>{probability.toFixed(1)}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          isPositive ? "bg-emerald-500" : "bg-blue-700"
                        }`}
                        style={{
                          width: `${Math.min(Math.max(probability, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid border-t border-slate-200 bg-white sm:grid-cols-2">
                <ResultMetric
                  label="Predicted class"
                  value={String(result.prediction)}
                />

                <ResultMetric
                  label="Decision threshold"
                  value={
                    result.threshold !== undefined
                      ? String(result.threshold)
                      : "API default"
                  }
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODEL */}
      <section id="model" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
            Machine learning pipeline
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            From customer data to prediction
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <PipelineCard
            number="01"
            title="Customer data"
            description="Demographic, financial and campaign information."
          />

          <PipelineCard
            number="02"
            title="Preprocessing"
            description="Feature transformation and engineered variables."
          />

          <PipelineCard
            number="03"
            title="XGBoost"
            description="Gradient-boosted classification model."
          />

          <PipelineCard
            number="04"
            title="Prediction"
            description="Class and subscription probability returned by API."
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <TechCard
            title="FastAPI"
            text="Serves the trained model through a validated prediction endpoint."
          />

          <TechCard
            title="Next.js"
            text="Provides the customer-facing prediction interface."
          />

          <TechCard
            title="Docker"
            text="Packages the inference service into a reproducible environment."
          />
        </div>
      </section>

      {/* PROJECT */}
      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
                About the project
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                An end-to-end ML application
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                This project goes beyond training a classifier. It connects
                data preprocessing, model inference, API validation,
                containerization and a production frontend into one workflow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DarkStat value="Python" label="ML" />
              <DarkStat value="XGBoost" label="Model" />
              <DarkStat value="FastAPI" label="Backend" />
              <DarkStat value="Next.js" label="Frontend" />
              <DarkStat value="Docker" label="Containerization" />
              <DarkStat value="Vercel + Render" label="Deployment" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-950">Lochan Jangid</p>
            <p className="mt-1 text-sm text-slate-500">
              Machine Learning Engineer
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-600">
            <a
              href="https://github.com/LochanJangid"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-800"
            >
              GitHub
            </a>

            <a
              href="https://lochan.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-800"
            >
              Portfolio
            </a>

            <a
              href="https://www.linkedin.com/in/lochan-jangid/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-800"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
          BankMarketer · Machine Learning Project
        </div>
      </footer>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function InfoCard({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-2xl font-bold text-slate-950">{number}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-6">
        <h3 className="font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-blue-700">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Not specified</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PipelineCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="text-xs font-bold text-blue-700">{number}</span>
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function TechCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function DarkStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}