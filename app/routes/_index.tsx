import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type LoaderData = {
  osInfo: string;
  cpuTemp: string;
  cpuUsage: string;
};

export const loader: LoaderFunction = async () => {
  const osInfo = await execAsync("uname -a");
  const cpuTemp = await execAsync("vcgencmd measure_temp");
  const cpuUsage = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1\"%\"}'");

  return json<LoaderData>({
    osInfo: osInfo.stdout.trim(),
    cpuTemp: cpuTemp.stdout.trim().replace("temp=", ""),
    cpuUsage: cpuUsage.stdout.trim(),
  });
};

export default function Index() {
  const { osInfo, cpuTemp, cpuUsage } = useLoaderData<LoaderData>();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Raspberry Pi System Info</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">OS Information:</h2>
            <p className="text-gray-600 dark:text-gray-400">{osInfo}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">CPU Temperature:</h2>
            <p className="text-gray-600 dark:text-gray-400">{cpuTemp}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">CPU Usage:</h2>
            <p className="text-gray-600 dark:text-gray-400">{cpuUsage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}