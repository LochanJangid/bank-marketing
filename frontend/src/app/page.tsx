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

type PredictionResponse = {
  prediction: number;
  probability: number;
  threshold: number;
  message: string;
};

type ApiError = {
  error?: string;
  message?: string;
  details?: {
    field: string;
    message: string;
  }[];
};

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
  age: "32",
  job: "management",
  marital: "single",
  education: "tertiary",
  default: "no",
  balance: "2500.50",
  housing: "no",
  loan: "no",
  contact: "cellular",
  day_of_week: "15",
  month: "mar",
  campaign: "1",
  pdays: "-1",
  previous: "0",
  poutcome: "success",
};

const jobs = [
  "blue-collar",
  "management",
  "technician",
  "admin.",
  "services",
  "retired",
  "self-employed",
  "entrepreneur",
  "unemployed",
  "housemaid",
  "student",
];

const months = [
  "may",
  "jul",
  "aug",
  "jun",
  "nov",
  "apr",
  "feb",
  "jan",
  "oct",
  "sep",
  "mar",
  "dec",
];

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function tryExample() {
    setForm(exampleForm);
    setResult(null);
    setError("");
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    // Required numeric fields
    if (
      form.age === "" ||
      form.balance === "" ||
      form.day_of_week === "" ||
      form.campaign === "" ||
      form.pdays === "" ||
      form.previous === ""
    ) {
      setError(
        "Please fill all required fields: age, balance, day, campaign, pdays and previous."
      );
      setLoading(false);
      return;
    }

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
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: PredictionResponse | ApiError = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;

        if (apiError.details?.length) {
          const messages = apiError.details
            .map(
              (item) =>
                `${item.field || "field"}: ${item.message}`
            )
            .join("\n");

          throw new Error(messages);
        }

        throw new Error(
          apiError.message ||
            apiError.error ||
            `Request failed with status ${response.status}`
        );
      }

      setResult(data as PredictionResponse);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Could not connect to the API. Make sure the Docker API is running."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">

        <h1 className="mb-2 text-3xl font-bold">
          Bank Marketing Prediction
        </h1>

        <p className="mb-8 text-gray-600">
          Enter customer information to get a prediction.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Age */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Age *
              </label>

              <input
                type="number"
                min="1"
                required
                value={form.age}
                onChange={(e) =>
                  updateField("age", e.target.value)
                }
                placeholder="35"
                className="w-full rounded border p-2"
              />
            </div>

            {/* Job */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Job
              </label>

              <select
                value={form.job}
                onChange={(e) =>
                  updateField("job", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>

                {jobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Marital
              </label>

              <select
                value={form.marital}
                onChange={(e) =>
                  updateField("marital", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="married">married</option>
                <option value="single">single</option>
                <option value="divorced">divorced</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Education
              </label>

              <select
                value={form.education}
                onChange={(e) =>
                  updateField("education", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="secondary">secondary</option>
                <option value="tertiary">tertiary</option>
                <option value="primary">primary</option>
              </select>
            </div>

            {/* Default */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Default
              </label>

              <select
                value={form.default}
                onChange={(e) =>
                  updateField("default", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="no">no</option>
                <option value="yes">yes</option>
              </select>
            </div>

            {/* Balance */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Balance *
              </label>

              <input
                type="number"
                step="any"
                required
                value={form.balance}
                onChange={(e) =>
                  updateField("balance", e.target.value)
                }
                placeholder="1500.50"
                className="w-full rounded border p-2"
              />
            </div>

            {/* Housing */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Housing
              </label>

              <select
                value={form.housing}
                onChange={(e) =>
                  updateField("housing", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>

            {/* Loan */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Loan
              </label>

              <select
                value={form.loan}
                onChange={(e) =>
                  updateField("loan", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="no">no</option>
                <option value="yes">yes</option>
              </select>
            </div>

            {/* Contact */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Contact
              </label>

              <select
                value={form.contact}
                onChange={(e) =>
                  updateField("contact", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="cellular">cellular</option>
                <option value="telephone">telephone</option>
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Day *
              </label>

              <input
                type="number"
                min="1"
                max="31"
                required
                value={form.day_of_week}
                onChange={(e) =>
                  updateField("day_of_week", e.target.value)
                }
                placeholder="15"
                className="w-full rounded border p-2"
              />
            </div>

            {/* Month */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Month
              </label>

              <select
                value={form.month}
                onChange={(e) =>
                  updateField("month", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>

                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Campaign *
              </label>

              <input
                type="number"
                min="1"
                required
                value={form.campaign}
                onChange={(e) =>
                  updateField("campaign", e.target.value)
                }
                placeholder="1"
                className="w-full rounded border p-2"
              />
            </div>

            {/* Pdays */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Pdays *
              </label>

              <input
                type="number"
                min="-1"
                required
                value={form.pdays}
                onChange={(e) =>
                  updateField("pdays", e.target.value)
                }
                placeholder="-1"
                className="w-full rounded border p-2"
              />

              <p className="mt-1 text-xs text-gray-500">
                -1 means the customer was not previously contacted.
              </p>
            </div>

            {/* Previous */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Previous *
              </label>

              <input
                type="number"
                min="0"
                required
                value={form.previous}
                onChange={(e) =>
                  updateField("previous", e.target.value)
                }
                placeholder="0"
                className="w-full rounded border p-2"
              />
            </div>

            {/* Poutcome */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Previous Outcome
              </label>

              <select
                value={form.poutcome}
                onChange={(e) =>
                  updateField("poutcome", e.target.value)
                }
                className="w-full rounded border p-2"
              >
                <option value="">Not specified</option>
                <option value="failure">failure</option>
                <option value="other">other</option>
                <option value="success">success</option>
              </select>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
  <button
    type="submit"
    disabled={loading}
    className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
  >
    {loading ? "Predicting..." : "Predict"}
  </button>

  <button
    type="button"
    onClick={tryExample}
    disabled={loading}
    className="rounded border px-5 py-2"
  >
    Try Example
  </button>

  <button
    type="button"
    onClick={resetForm}
    disabled={loading}
    className="rounded border px-5 py-2"
  >
    Reset
  </button>
</div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded border border-red-500 p-4">
            <h2 className="font-semibold text-red-600">
              Prediction Error
            </h2>

            <pre className="mt-2 whitespace-pre-wrap text-sm text-red-600">
              {error}
            </pre>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 rounded border p-6">

            <h2 className="text-xl font-semibold">
              Prediction Result
            </h2>

            <div className="mt-4 space-y-2">

              <p>
                <strong>Prediction:</strong>{" "}
                {result.prediction}
              </p>

              <p>
                <strong>Probability:</strong>{" "}
                {(result.probability * 100).toFixed(2)}%
              </p>

              <p>
                <strong>Threshold:</strong>{" "}
                {(result.threshold * 100).toFixed(2)}%
              </p>

              <p>
                <strong>Message:</strong>{" "}
                {result.message}
              </p>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}