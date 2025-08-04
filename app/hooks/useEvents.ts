'use client';

import { useState, useEffect } from 'react';
import { Event } from '../types';
import { eventsApiService } from '../services/api';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsApiService.fetchEvents();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengambil data events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}

export function useEventBySlug(slug: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching event with slug:', slug);
        console.log('Environment URL:', process.env.GEMITRA_EVENTS_URL);
        const data = await eventsApiService.fetchEventBySlug(slug);
        console.log('Fetched event data:', data);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Gagal mengambil data event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  return { event, loading, error };
}

export function useEventsByCategory(category: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!category) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await eventsApiService.fetchEventsByCategory(category);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengambil data events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);

  return { events, loading, error };
} 