import FcUnitedEventsPage from '@/components/fc-united/FcUnitedEventsPage';
import { fetchEventsCatalogPageServer } from '@/components/fc-united/ApiServerActions';

/** Dynamic events catalog from event_details (Future/Past toggle, search, date filters). */
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { events, totalCount } = await fetchEventsCatalogPageServer();
  return <FcUnitedEventsPage initialEvents={events} initialTotal={totalCount} />;
}
