import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherCardSkeleton() {
	return (
		<Card className="clay-card border-none">
			<CardHeader>
				<div className="flex justify-center">
					<Skeleton className="h-8 w-48 rounded-md" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-[200px] w-full rounded-[32px]" />
			</CardContent>
		</Card>
	);
}
