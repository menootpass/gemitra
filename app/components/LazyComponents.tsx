"use client";
import { lazy, Suspense } from "react";
import LoadingSkeleton from "./LoadingSkeleton";

// Lazy load heavy components
export const LazyGemitraMap = lazy(() => import("./GemitraMap"));
export const LazyDestinationDetail = lazy(() => import("./DestinationDetail"));
export const LazyEventsSlider = lazy(() => import("./EventsSlider"));
export const LazyMapDiagnostics = lazy(() => import("./MapDiagnostics"));

// Wrapper components with loading states
export function LazyMapWrapper(props: any) {
  return (
    <Suspense fallback={<LoadingSkeleton type="map" />}>
      <LazyGemitraMap {...props} />
    </Suspense>
  );
}

export function LazyDestinationDetailWrapper(props: any) {
  return (
    <Suspense fallback={<div className="hidden" />}>
      <LazyDestinationDetail {...props} />
    </Suspense>
  );
}

export function LazyEventsSliderWrapper(props: any) {
  return (
    <Suspense fallback={<LoadingSkeleton type="events" count={3} />}>
      <LazyEventsSlider {...props} />
    </Suspense>
  );
}

export function LazyMapDiagnosticsWrapper(props: any) {
  return (
    <Suspense fallback={<LoadingSkeleton type="map" />}>
      <LazyMapDiagnostics {...props} />
    </Suspense>
  );
}
