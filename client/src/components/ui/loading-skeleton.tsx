import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
    className?: string;
}

// Card loading skeleton
export function CardSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-4 space-y-3", className)}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
        </div>
    );
}

// Stats card loading skeleton
export function StatsSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-4", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </div>
    );
}

// Table row loading skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// List item loading skeleton
export function ListItemSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn("flex items-center gap-4 p-4 border-b", className)}>
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    );
}

// Dashboard loading skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsSkeleton />
                <StatsSkeleton />
                <StatsSkeleton />
                <StatsSkeleton />
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSkeleton className="h-64" />
                <CardSkeleton className="h-64" />
            </div>
        </div>
    );
}

// Page loading skeleton
export function PageSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
            </div>
        </div>
    );
}

// Appointment card skeleton
export function AppointmentSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn("rounded-lg border bg-card p-4 space-y-3", className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
}

export default {
    CardSkeleton,
    StatsSkeleton,
    TableRowSkeleton,
    ListItemSkeleton,
    DashboardSkeleton,
    PageSkeleton,
    AppointmentSkeleton,
};
