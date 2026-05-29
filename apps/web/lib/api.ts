export type JobFileStatus = {
  filename: string;
  status: "queued" | "processing" | "complete" | "error";
  progress: number;
  errorMessage?: string;
};

export type JobStatus = {
  jobId: string;
  status: "queued" | "processing" | "complete" | "error";
  progress: number;
  stage: string;
  errorMessage?: string;
  resultName?: string;
  files?: JobFileStatus[];
};

async function responseError(response: Response) {
  const message = await response.text();
  try {
    const parsed = JSON.parse(message) as { detail?: string };
    return parsed.detail ?? message;
  } catch {
    return message;
  }
}

export async function startConversion(file: File, targetFormat: string, jobId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetFormat", targetFormat);
  formData.append("jobId", jobId);

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<{ jobId: string; status: string; estimatedSeconds: number }>;
}

export async function startBatchConversion(
  files: File[],
  targetFormat: string,
  jobId: string,
  outputMode: "separate" | "combined"
) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("targetFormat", targetFormat);
  formData.append("jobId", jobId);
  formData.append("outputMode", outputMode);

  const response = await fetch("/api/convert-batch", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<{ jobId: string; status: string; estimatedSeconds: number }>;
}

export async function getJobStatus(jobId: string) {
  const response = await fetch(`/api/jobs/${jobId}/status`);
  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<JobStatus>;
}

export async function downloadJob(jobId: string) {
  const response = await fetch(`/api/jobs/${jobId}/download`);
  if (!response.ok) {
    const message = await responseError(response);
    if (response.status === 404) {
      throw new Error("That converted file is no longer available on the server. Please run the conversion again.");
    }
    throw new Error(message || "Download failed. Please try again.");
  }

  return response.blob();
}
