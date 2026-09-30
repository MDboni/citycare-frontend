"use client";

import { LocateFixedIcon, MapPinOffIcon, NavigationIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNearbyComplaints } from "@/hooks";

const RADIUS_OPTIONS = [
  { value: "0.5", label: "Within 500 m" },
  { value: "1", label: "Within 1 km" },
  { value: "2", label: "Within 2 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
];

/**
 * Issues around the user, so a second report on the same pothole becomes an
 * upvote instead. The endpoint needs coordinates, and the browser will only hand
 * them over on a gesture — so nothing loads until the button is pressed.
 */
export function NearbyView() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState("2");
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const query = useNearbyComplaints(
    coords ? { ...coords, radiusKm: Number(radiusKm) } : null,
  );

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("This browser cannot share a location.");
      setDenied(true);
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setLocating(false);
        setDenied(false);
      },
      () => {
        setLocating(false);
        setDenied(true);
        toast.error("Location permission was refused.");
      },
      { timeout: 10_000, enableHighAccuracy: true },
    );
  };

  const complaints = query.data ?? [];

  return (
    <div className="page-shell space-y-6 py-8">
      {/* The heading is on the banner above; what is left here is the control
          that belongs to the list rather than to the page. */}
      {coords && (
        <div className="cc-rise flex items-center justify-end gap-2">
          <Select
            value={radiusKm}
            onValueChange={(value) => setRadiusKm(String(value ?? "2"))}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={locate}>
            <LocateFixedIcon />
            Update
          </Button>
        </div>
      )}

      {!coords && (
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <NavigationIcon className="size-5" />
            </span>
            <div className="space-y-1">
              <h2 className="h-card">Share your location to start</h2>
              <p className="text-sm text-muted-foreground">
                CityCare uses it once, to search. It is not stored, and it is
                not attached to anything you have reported.
              </p>
            </div>
            <Button size="lg" disabled={locating} onClick={locate}>
              <LocateFixedIcon data-icon="inline-start" />
              {locating ? "Finding you…" : "Use my location"}
            </Button>

            {denied && (
              <p className="text-xs text-muted-foreground">
                Blocked? Allow location for this site in your browser settings,
                then try again.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {coords && (
        <>
          <p className="font-mono text-xs text-muted-foreground">
            Searching around {coords.lat}, {coords.lng}
          </p>

          {query.isPending && <TableSkeleton rows={3} columns={4} />}

          {query.isError && (
            <ErrorState
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          )}

          {!query.isPending && !query.isError && complaints.length === 0 && (
            <EmptyState
              icon={MapPinOffIcon}
              title="Nothing reported around here"
              description="Either the neighbourhood is in good shape, or you are the first to notice. Try a wider radius."
            />
          )}

          {complaints.length > 0 && (
            <div className="cc-stagger grid gap-3 xl:grid-cols-2">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
