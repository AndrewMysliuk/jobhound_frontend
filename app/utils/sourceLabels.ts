const SOURCE_LABELS: Readonly<Record<string, string>> = {
  europe_remotely: "Europe Remotely",
  working_nomads: "Working Nomads",
  himalayas: "Himalayas",
  builtin: "Built In",
  remotify_europe: "Remotify Europe",
  we_work_remotely: "We Work Remotely",
  wellfound: "Wellfound",
  vue_jobs: "VueJobs",
  golang_cafe: "Golang Cafe",
}

/** Human label for ingest source_id; unknown ids return the raw string. */
export function labelForSourceId(sourceId: string): string {
  const key = (sourceId ?? "").trim()
  if (key === "") return ""
  return SOURCE_LABELS[key] ?? key
}
