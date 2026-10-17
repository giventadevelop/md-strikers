import { redirect } from 'next/navigation';

/**
 * Legacy catalog URL — events now live at `/events` (same dynamic catalog as kcnj-temp.com/events).
 */
export default function BrowseEventsPage() {
  redirect('/events');
}
