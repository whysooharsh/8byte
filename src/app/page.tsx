import { getPortfolio } from "@/lib/get-portfolio";
import { PortfolioDashboard } from "@/components/portfolio-dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
	const initialData = await getPortfolio();

	return (
		<div className="flex flex-1 flex-col bg-white dark:bg-black">
			<header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
					Portfolio
				</h1>
			</header>
			<PortfolioDashboard initialData={initialData} />
		</div>
	);
}
